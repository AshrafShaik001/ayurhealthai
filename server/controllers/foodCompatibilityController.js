import Anthropic from '@anthropic-ai/sdk'
import FoodCompatibilityCheck from '../models/FoodCompatibilityCheck.js'

// ── JSON extractor ─────────────────────────────────────────────
function extractJSON(text) {
  try { return JSON.parse(text) } catch {}

  const stripped = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
  try { return JSON.parse(stripped) } catch {}

  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }

  throw new SyntaxError('Could not extract JSON from AI response')
}

// ── Prompt builder ─────────────────────────────────────────────
function buildPrompt(foods, dosha) {
  const foodList = foods.join(', ')

  // Build all unique pairs for explicit guidance
  const pairs = []
  for (let i = 0; i < foods.length; i++) {
    for (let j = i + 1; j < foods.length; j++) {
      pairs.push(`${foods[i]} + ${foods[j]}`)
    }
  }

  return `You are an Ayurvedic food expert. Check if these foods are compatible with each other and with ${dosha} dosha.

Foods selected: ${foodList}
User's dosha: ${dosha}

Analyse every unique pair: ${pairs.join('; ')}

Respond with a single valid JSON object only — no markdown, no text outside the JSON:

{
  "compatible": true,
  "overall_score": 85,
  "combinations": [
    {
      "food1": "Food A",
      "food2": "Food B",
      "status": "good",
      "reason": "Why these foods work well together in Ayurveda",
      "remedy": ""
    },
    {
      "food1": "Food C",
      "food2": "Food D",
      "status": "bad",
      "reason": "Why this combination creates ama (toxins) or imbalance",
      "remedy": "How to counteract this if consumed — e.g. add spice, separate timing, digestive aid"
    },
    {
      "food1": "Food E",
      "food2": "Food F",
      "status": "neutral",
      "reason": "These foods are neither particularly beneficial nor harmful together",
      "remedy": ""
    }
  ],
  "dosha_analysis": [
    {
      "food": "Food A",
      "effect": "balances",
      "note": "Brief Ayurvedic reason why this food is good/bad/neutral for ${dosha}"
    }
  ],
  "overall_advice": "2-3 sentences of personalised Ayurvedic eating advice for a ${dosha} person eating these foods together"
}

Rules:
- "compatible" is true if more than half the pairs are good/neutral
- "overall_score" is 0-100 representing overall compatibility
- Include EVERY pair listed above in "combinations" — one object per pair
- "status" must be exactly "good", "bad", or "neutral"
- "remedy" is only required when status is "bad"; leave empty string "" for good/neutral
- "dosha_analysis" has one entry per food in the input list
- "effect" is one of: "balances", "aggravates", "neutral"
- Overall advice should be warm, practical, and specific to ${dosha} dosha`
}

// ── POST /api/food-compatibility ──────────────────────────────
export async function checkFoodCompatibility(req, res) {
  try {
    const { foods = [], dosha } = req.body

    if (!foods.length || foods.length < 2) {
      return res.status(400).json({ error: 'Please add at least 2 foods to check compatibility.' })
    }
    if (foods.length > 6) {
      return res.status(400).json({ error: 'Please select a maximum of 6 foods.' })
    }
    if (!dosha) {
      return res.status(400).json({ error: 'Dosha is required for compatibility analysis.' })
    }

    const anthropic = new Anthropic({
      apiKey:  process.env.ANTHROPIC_API_KEY,
      timeout: 90000,
    })

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4000,
      system:     'You are an Ayurvedic food expert. Respond with valid JSON only — no markdown, no text outside the JSON.',
      messages:   [{ role: 'user', content: buildPrompt(foods, dosha) }],
    })

    const raw = message.content[0].text.trim()
    console.log('=== FoodCompat Claude response (first 300 chars) ===')
    console.log(raw.slice(0, 300))
    console.log('=== stop_reason:', message.stop_reason, '| length:', raw.length, '===')

    const result = extractJSON(raw)

    // Normalise & safety-check
    const normalised = {
      compatible:    typeof result.compatible === 'boolean' ? result.compatible : true,
      overall_score: typeof result.overall_score === 'number'
        ? Math.min(100, Math.max(0, result.overall_score))
        : 70,
      combinations: (result.combinations || []).map(c => ({
        food1:  c.food1  || '',
        food2:  c.food2  || '',
        status: ['good', 'bad', 'neutral'].includes(c.status) ? c.status : 'neutral',
        reason: c.reason || '',
        remedy: c.remedy || '',
      })),
      dosha_analysis: (result.dosha_analysis || []).map(d => ({
        food:   d.food   || '',
        effect: ['balances', 'aggravates', 'neutral'].includes(d.effect) ? d.effect : 'neutral',
        note:   d.note   || '',
      })),
      overall_advice: result.overall_advice || '',
    }

    // ── Persist check to history (fire-and-forget) ─────────
    if (req.userId) {
      const combos = normalised.combinations || []
      FoodCompatibilityCheck.create({
        userId:        req.userId,
        foods,
        dosha,
        compatible:    normalised.compatible,
        overall_score: normalised.overall_score,
        summary: {
          good:    combos.filter(c => c.status === 'good').length,
          bad:     combos.filter(c => c.status === 'bad').length,
          neutral: combos.filter(c => c.status === 'neutral').length,
        },
      }).catch(e => console.warn('Could not save compat check:', e.message))
    }

    res.json({ success: true, result: normalised, foods, dosha })
  } catch (err) {
    console.error('checkFoodCompatibility error:', err?.message || err)

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Analysis failed — please try again.' })
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
    return res.status(500).json({ error: err?.message || 'Compatibility check failed.' })
  }
}
