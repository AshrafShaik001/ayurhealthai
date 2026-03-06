import Anthropic from '@anthropic-ai/sdk'
import SavedRecipe from '../models/SavedRecipe.js'

// ── Helpers ───────────────────────────────────────────────────
function extractJSON(text) {
  try { return JSON.parse(text) } catch {}

  const stripped = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
  try { return JSON.parse(stripped) } catch {}

  // Find outermost [ ... ] array block (we expect an array of recipes)
  const arrStart = text.indexOf('[')
  const arrEnd   = text.lastIndexOf(']')
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(text.slice(arrStart, arrEnd + 1)) } catch {}
  }

  // Fallback: outermost { ... } object
  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1))
      if (obj.recipes) return obj.recipes
      return obj
    } catch {}
  }

  throw new SyntaxError('Could not extract JSON from AI response')
}

function buildPrompt(dosha, season, goal, mealType) {
  return `You are an expert Ayurvedic nutritionist. Given the user's dosha ${dosha}, season ${season}, health goal ${goal}, and meal type ${mealType}, suggest exactly 3 Ayurvedic recipes.

Respond with a valid JSON array only — no markdown, no extra text, just the raw JSON array.

[
  {
    "name": "Recipe Name",
    "description": "One sentence about why this recipe suits the dosha and goal",
    "ingredients": ["1 cup ingredient", "2 tbsp ingredient"],
    "steps": ["Step 1 instruction", "Step 2 instruction", "Step 3 instruction"],
    "balances_dosha": ["Vata", "Pitta"],
    "aggravates_dosha": ["Kapha"],
    "best_season": "Spring",
    "health_benefits": "Short description of health benefits",
    "prep_time": "15 mins",
    "cook_time": "20 mins",
    "meal_type": "${mealType}"
  }
]

Rules:
- Return exactly 3 recipes as a JSON array
- All fields are required
- balances_dosha and aggravates_dosha contain only values from: ["Vata", "Pitta", "Kapha"]
- best_season is one of: Spring, Summer, Monsoon, Autumn, Winter
- Recipes should genuinely align with Ayurvedic principles for ${dosha} dosha
- Focus on the ${goal} health goal
- Appropriate for ${mealType}
- Seasonal to ${season}`
}

// ── POST /api/recipes/generate ───────────────────────────────
export async function generateRecipes(req, res) {
  try {
    const { dosha, season, goal, mealType } = req.body

    if (!dosha || !season || !goal || !mealType) {
      return res.status(400).json({ error: 'All filters (dosha, season, goal, mealType) are required.' })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 90000,
    })

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 6000,
      system: 'You are an expert Ayurvedic nutritionist. Respond with valid JSON only — no markdown, no text outside the JSON.',
      messages: [{
        role:    'user',
        content: buildPrompt(dosha, season, goal, mealType),
      }],
    })

    const raw = message.content[0].text.trim()
    console.log('=== Recipe Claude response (first 300 chars) ===')
    console.log(raw.slice(0, 300))
    console.log('=== stop_reason:', message.stop_reason, '| length:', raw.length, '===')

    let recipes = extractJSON(raw)

    // If Claude wrapped in an object, unwrap
    if (!Array.isArray(recipes) && recipes.recipes) {
      recipes = recipes.recipes
    }
    if (!Array.isArray(recipes)) {
      recipes = [recipes]
    }

    // Ensure we have exactly 3 and normalise fields
    recipes = recipes.slice(0, 3).map(r => ({
      name:             r.name             || 'Ayurvedic Recipe',
      description:      r.description      || '',
      ingredients:      Array.isArray(r.ingredients)      ? r.ingredients      : [],
      steps:            Array.isArray(r.steps)            ? r.steps            : [],
      balances_dosha:   Array.isArray(r.balances_dosha)   ? r.balances_dosha   : [],
      aggravates_dosha: Array.isArray(r.aggravates_dosha) ? r.aggravates_dosha : [],
      best_season:      r.best_season      || season,
      health_benefits:  r.health_benefits  || '',
      prep_time:        r.prep_time        || '',
      cook_time:        r.cook_time        || '',
      meal_type:        r.meal_type        || mealType,
    }))

    res.json({ success: true, recipes, filters: { dosha, season, goal, mealType } })
  } catch (err) {
    console.error('generateRecipes error:', err?.message || err)

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Recipe generation failed — please try again.' })
    }
    if (err?.status === 401 || err?.message?.includes('authentication')) {
      return res.status(502).json({ error: 'API key error. Please check ANTHROPIC_API_KEY.' })
    }
    if (err?.status === 429 || err?.message?.includes('rate')) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
    }
    if (err?.message?.includes('timeout') || err?.code === 'ETIMEDOUT') {
      return res.status(504).json({ error: 'Request timed out. Please try again.' })
    }
    return res.status(500).json({ error: err?.message || 'Recipe generation failed.' })
  }
}

// ── POST /api/recipes/save ────────────────────────────────────
export async function saveRecipe(req, res) {
  try {
    const { recipe, filters } = req.body
    if (!recipe || !recipe.name) {
      return res.status(400).json({ error: 'Recipe data is required.' })
    }

    // Upsert: if user already saved this recipe name, update it
    const saved = await SavedRecipe.findOneAndUpdate(
      { userId: req.userId, name: recipe.name },
      {
        userId:           req.userId,
        name:             recipe.name,
        ingredients:      recipe.ingredients      || [],
        steps:            recipe.steps            || [],
        balances_dosha:   recipe.balances_dosha   || [],
        aggravates_dosha: recipe.aggravates_dosha || [],
        best_season:      recipe.best_season      || '',
        health_benefits:  recipe.health_benefits  || '',
        filters:          filters || {},
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json({ success: true, savedRecipe: saved })
  } catch (err) {
    console.error('saveRecipe error:', err?.message || err)
    return res.status(500).json({ error: 'Could not save recipe.' })
  }
}

// ── DELETE /api/recipes/save/:id ─────────────────────────────
export async function unsaveRecipe(req, res) {
  try {
    const { id } = req.params
    const deleted = await SavedRecipe.findOneAndDelete({ _id: id, userId: req.userId })
    if (!deleted) {
      return res.status(404).json({ error: 'Saved recipe not found.' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('unsaveRecipe error:', err?.message || err)
    return res.status(500).json({ error: 'Could not remove recipe.' })
  }
}

// ── GET /api/recipes/saved ────────────────────────────────────
export async function getSavedRecipes(req, res) {
  try {
    const recipes = await SavedRecipe
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
    res.json({ success: true, recipes })
  } catch (err) {
    console.error('getSavedRecipes error:', err?.message || err)
    return res.status(500).json({ error: 'Could not fetch saved recipes.' })
  }
}
