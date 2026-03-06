import Anthropic from '@anthropic-ai/sdk'

// Robustly extract JSON from Claude's response (handles fences, leading text, trailing text)
function extractJSON(text) {
  // 1. Try direct parse
  try { return JSON.parse(text) } catch {}

  // 2. Strip markdown code fences
  const stripped = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
  try { return JSON.parse(stripped) } catch {}

  // 3. Extract the outermost {...} block
  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }

  throw new SyntaxError('Could not extract JSON from AI response')
}

// Severity thresholds based on symptom count
function getSeverity(count) {
  if (count <= 3)  return 'mild'
  if (count <= 7)  return 'moderate'
  return 'significant'
}

// ── POST /api/symptoms/analyze ───────────────────────────────
export async function analyzeSymptoms(req, res, next) {
  try {
    const { symptoms = [], doshaScores = {} } = req.body

    if (!symptoms.length || symptoms.length < 2) {
      return res.status(400).json({ error: 'Please select at least 2 symptoms.' })
    }
    if (symptoms.length > 46) {
      return res.status(400).json({ error: 'Too many symptoms provided.' })
    }

    const severity     = getSeverity(symptoms.length)
    const primaryDosha = Object.entries(doshaScores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'vata'
    const capitalised  = s => s.charAt(0).toUpperCase() + s.slice(1)

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 90000, // 90 second timeout
    })

    // Limit symptoms to top 15 to keep prompt manageable
    const limitedSymptoms = symptoms.slice(0, 15)

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are an expert Ayurvedic practitioner. Respond with valid JSON only — no markdown, no text outside the JSON. Be concise.`,
      messages: [{
        role: 'user',
        content: buildPrompt(limitedSymptoms, doshaScores, severity, capitalised(primaryDosha)),
      }],
    })

    const raw = message.content[0].text.trim()
    console.log('=== Claude raw response (first 500 chars) ===')
    console.log(raw.slice(0, 500))
    console.log('=== Last 200 chars ===')
    console.log(raw.slice(-200))
    console.log('=== stop_reason:', message.stop_reason, '| length:', raw.length, '===')
    const analysis = extractJSON(raw)

    res.json({ success: true, analysis, symptomCount: symptoms.length, severity })
  } catch (err) {
    console.error('analyzeSymptoms error:', err?.message || err)

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Analysis failed — please try again.' })
    }
    // Anthropic API errors (auth, rate limit, etc.)
    if (err?.status === 401 || err?.message?.includes('authentication')) {
      return res.status(502).json({ error: 'API key is invalid or expired. Please check your ANTHROPIC_API_KEY.' })
    }
    if (err?.status === 429 || err?.message?.includes('rate')) {
      return res.status(502).json({ error: 'Too many requests. Please wait a moment and try again.' })
    }
    if (err?.message?.includes('timeout') || err?.code === 'ETIMEDOUT' || err?.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Analysis is taking too long. Try selecting fewer symptoms and try again.' })
    }
    return res.status(500).json({ error: err?.message || 'Analysis failed. Please try again.' })
  }
}

// ── Prompt ───────────────────────────────────────────────────
function buildPrompt(symptoms, doshaScores, severity, primaryDosha) {
  const symptomList = symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const scores = Object.entries(doshaScores)
    .map(([d, v]) => `  ${d.charAt(0).toUpperCase() + d.slice(1)}: ${v}%`)
    .join('\n')

  return `
Patient symptoms (${severity} severity): ${symptomList}

Dosha scores: ${scores}

Respond in this exact JSON format (be concise, keep descriptions brief):

{
  "primary_imbalance": "Vata|Pitta|Kapha",
  "secondary_imbalance": "Vata|Pitta|Kapha|None",
  "severity": "${severity}",
  "dosha_scores": {"vata": 0-100, "pitta": 0-100, "kapha": 0-100},
  "analysis": "2-3 sentences on Ayurvedic perspective of these symptoms",
  "root_causes": ["cause 1", "cause 2", "cause 3"],
  "natural_remedies": [
    {"title": "name", "description": "brief how-to", "frequency": "how often", "type": "dietary|herbal|topical|practice", "dosha_target": "dosha"}
  ],
  "herbs": [
    {"name": "English name", "sanskrit": "Sanskrit name", "addresses": "symptoms targeted", "preparation": "how to use", "dosage": "amount+frequency", "caution": "caution or None"}
  ],
  "lifestyle_corrections": [
    {"area": "Sleep|Diet|Exercise|Stress|Routine", "issue": "Ayurvedic issue", "correction": "actionable fix", "timeframe": "timeframe", "priority": "high|medium|low"}
  ],
  "dietary_guidelines": {
    "immediate_foods": ["Food — benefit"],
    "foods_to_avoid": ["Food — reason"],
    "healing_recipe": {"name": "recipe name", "ingredients": ["ing1", "ing2"], "instructions": "brief steps", "benefit": "why it helps"}
  },
  "when_to_seek_help": "1-2 sentences on when to see a doctor",
  "positive_affirmation": "One warm closing sentence"
}

Rules: 3 remedies, 3 herbs, 3 lifestyle corrections, 3 foods each. Dosha scores sum to 100. Target ${primaryDosha} imbalance.
`.trim()
}
