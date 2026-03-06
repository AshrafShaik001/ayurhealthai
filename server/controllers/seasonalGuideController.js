import Anthropic from '@anthropic-ai/sdk'
import SeasonalPlan from '../models/SeasonalPlan.js'

// ── JSON extractor ────────────────────────────────────────────
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

// ── Prompt ────────────────────────────────────────────────────
function buildPrompt(season, dosha) {
  return `You are an Ayurvedic seasonal health expert. For season ${season} and dosha ${dosha}, provide a complete Ritucharya (seasonal health regimen) guide.

Respond with a single valid JSON object only — no markdown, no text outside the JSON:

{
  "season_name": "${season}",
  "ayurvedic_name": "Sanskrit Ritucharya name for this season",
  "season_description": "2 sentences on this season's energy and effect on the body from an Ayurvedic perspective",
  "dosha_impact": "1-2 sentences on how this season specifically affects ${dosha} dosha",
  "foods_to_eat": [
    { "name": "Food name", "benefit": "Why it's ideal this season for ${dosha}", "emoji": "🥕", "taste": "Sweet/Sour/Salty/Pungent/Bitter/Astringent", "quality": "Heavy/Light/Warm/Cool/Dry/Oily" }
  ],
  "foods_to_avoid": [
    { "name": "Food name", "reason": "Why this food aggravates ${dosha} in ${season}", "emoji": "🚫", "effect": "What imbalance it creates" }
  ],
  "herbs": [
    { "name": "Herb name", "sanskrit": "Sanskrit name", "preparation": "How to use — e.g. decoction, powder with honey", "benefit": "Specific benefit for ${dosha} in ${season}", "frequency": "e.g. Once daily, Twice daily" }
  ],
  "daily_routine": [
    { "time": "5:00–6:00 AM", "activity": "Activity name", "description": "Detailed instruction including technique or approach", "duration": "e.g. 15 minutes", "icon": "🌅" }
  ],
  "special_advice": "3-4 sentences of personalised wisdom for ${dosha} constitution during ${season} — lifestyle adjustments, mindset, key warnings"
}

Rules:
- foods_to_eat: exactly 8 items
- foods_to_avoid: exactly 6 items
- herbs: exactly 5 items
- daily_routine: exactly 7 time-ordered items covering morning to evening/night
- All emoji fields should use relevant food/herb emojis
- Be specific to ${dosha} dosha — not generic Ayurvedic advice
- ayurvedic_name should be the traditional Sanskrit Ritu name (e.g. Vasanta, Grishma, Varsha, Sharad, Hemanta, Shishira)`
}

// ── POST /api/seasonal-guide/generate ────────────────────────
export async function generateSeasonalGuide(req, res) {
  try {
    const { season, dosha } = req.body

    const validSeasons = ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira']
    const validDoshas  = ['Vata', 'Pitta', 'Kapha']

    if (!validSeasons.includes(season)) {
      return res.status(400).json({ error: `Season must be one of: ${validSeasons.join(', ')}` })
    }
    if (!validDoshas.includes(dosha)) {
      return res.status(400).json({ error: `Dosha must be one of: ${validDoshas.join(', ')}` })
    }

    const anthropic = new Anthropic({
      apiKey:  process.env.ANTHROPIC_API_KEY,
      timeout: 90000,
    })

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 8000,
      system:     'You are an Ayurvedic seasonal health expert. Respond with valid JSON only — no markdown, no text outside the JSON.',
      messages:   [{ role: 'user', content: buildPrompt(season, dosha) }],
    })

    const raw = message.content[0].text.trim()
    console.log('=== SeasonalGuide Claude (first 300 chars) ===')
    console.log(raw.slice(0, 300))
    console.log('=== stop_reason:', message.stop_reason, '| length:', raw.length, '===')

    const guide = extractJSON(raw)

    // Normalise arrays to guarantee shape
    const normalised = {
      season_name:        guide.season_name        || season,
      ayurvedic_name:     guide.ayurvedic_name     || season,
      season_description: guide.season_description || '',
      dosha_impact:       guide.dosha_impact       || '',
      foods_to_eat: (guide.foods_to_eat || []).map(f => ({
        name:    f.name    || '',
        benefit: f.benefit || '',
        emoji:   f.emoji   || '🌿',
        taste:   f.taste   || '',
        quality: f.quality || '',
      })),
      foods_to_avoid: (guide.foods_to_avoid || []).map(f => ({
        name:   f.name   || '',
        reason: f.reason || '',
        emoji:  f.emoji  || '🚫',
        effect: f.effect || '',
      })),
      herbs: (guide.herbs || []).map(h => ({
        name:        h.name        || '',
        sanskrit:    h.sanskrit    || '',
        preparation: h.preparation || '',
        benefit:     h.benefit     || '',
        frequency:   h.frequency   || '',
      })),
      daily_routine: (guide.daily_routine || []).map(r => ({
        time:        r.time        || '',
        activity:    r.activity    || '',
        description: r.description || '',
        duration:    r.duration    || '',
        icon:        r.icon        || '🌿',
      })),
      special_advice: guide.special_advice || '',
    }

    res.json({ success: true, guide: normalised, season, dosha })
  } catch (err) {
    console.error('generateSeasonalGuide error:', err?.message || err)

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Guide generation failed — please try again.' })
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
    return res.status(500).json({ error: err?.message || 'Guide generation failed.' })
  }
}

// ── POST /api/seasonal-guide/save ────────────────────────────
export async function saveSeasonalPlan(req, res) {
  try {
    const { season, dosha, guide } = req.body
    if (!season || !dosha || !guide) {
      return res.status(400).json({ error: 'season, dosha and guide are required.' })
    }

    const saved = await SeasonalPlan.findOneAndUpdate(
      { userId: req.userId, season },
      { userId: req.userId, season, dosha, guide },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json({ success: true, plan: saved })
  } catch (err) {
    console.error('saveSeasonalPlan error:', err?.message || err)
    return res.status(500).json({ error: 'Could not save seasonal plan.' })
  }
}

// ── GET /api/seasonal-guide/saved ────────────────────────────
export async function getSavedPlans(req, res) {
  try {
    const plans = await SeasonalPlan
      .find({ userId: req.userId })
      .sort({ updatedAt: -1 })
    res.json({ success: true, plans })
  } catch (err) {
    console.error('getSavedPlans error:', err?.message || err)
    return res.status(500).json({ error: 'Could not fetch saved plans.' })
  }
}

// ── DELETE /api/seasonal-guide/saved/:id ─────────────────────
export async function deleteSavedPlan(req, res) {
  try {
    const deleted = await SeasonalPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!deleted) return res.status(404).json({ error: 'Plan not found.' })
    res.json({ success: true })
  } catch (err) {
    console.error('deleteSavedPlan error:', err?.message || err)
    return res.status(500).json({ error: 'Could not delete plan.' })
  }
}
