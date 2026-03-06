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

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 8000,
      system: `You are an expert Ayurvedic practitioner. Based on the user's dosha, give personalized recommendations for diet, daily routine, herbs, and lifestyle in JSON format. Always respond with valid JSON only — no markdown, no text outside the JSON.`,
      messages: [{
        role: 'user',
        content: buildPrompt(symptoms, doshaScores, severity, capitalised(primaryDosha)),
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
A patient presents with the following ${symptoms.length} symptoms (severity: ${severity}):

${symptomList}

Preliminary dosha imbalance analysis based on symptom mapping:
${scores}

As an expert Ayurvedic practitioner, analyze these symptoms and provide a comprehensive response in this exact JSON format:

{
  "primary_imbalance": "Vata | Pitta | Kapha (the most dominant imbalanced dosha)",
  "secondary_imbalance": "Vata | Pitta | Kapha | None (second most affected, or 'None')",
  "severity": "${severity}",
  "dosha_scores": {
    "vata": <integer 0-100>,
    "pitta": <integer 0-100>,
    "kapha": <integer 0-100>
  },
  "analysis": "3-4 warm, professional sentences explaining what these symptoms collectively indicate from an Ayurvedic perspective, which dosha systems are affected, and the root imbalance pattern",
  "root_causes": [
    "Root cause 1 from Ayurvedic perspective",
    "Root cause 2",
    "Root cause 3"
  ],
  "natural_remedies": [
    {
      "title": "Remedy name",
      "description": "How to prepare or apply this remedy",
      "frequency": "How often to use",
      "type": "dietary | herbal | topical | practice",
      "dosha_target": "Which dosha imbalance it corrects"
    }
  ],
  "herbs": [
    {
      "name": "Herb name in English",
      "sanskrit": "Sanskrit / botanical name",
      "addresses": "Which specific symptoms from the list it targets",
      "preparation": "How to prepare (tea, powder, oil, etc.)",
      "dosage": "Amount and frequency",
      "caution": "Any cautions or contraindications (or 'None')"
    }
  ],
  "lifestyle_corrections": [
    {
      "area": "Sleep | Diet | Exercise | Stress | Routine | Environment",
      "issue": "The specific Ayurvedic issue being corrected",
      "correction": "Clear, actionable correction",
      "timeframe": "Expected timeframe to notice improvement",
      "priority": "high | medium | low"
    }
  ],
  "dietary_guidelines": {
    "immediate_foods": [
      "Food/drink — specific benefit for correcting the imbalance"
    ],
    "foods_to_avoid": [
      "Food/drink — why it worsens the imbalance"
    ],
    "healing_recipe": {
      "name": "Name of the Ayurvedic healing recipe",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": "Step-by-step preparation",
      "benefit": "Why this recipe specifically addresses these symptoms"
    }
  },
  "when_to_seek_help": "Clear guidance on when these symptoms warrant consulting a doctor or Ayurvedic practitioner (be specific and responsible)",
  "positive_affirmation": "One encouraging, warm closing note personalised to their healing journey"
}

Rules:
- Include exactly 4 natural remedies
- Include exactly 4 herbs
- Include exactly 4 lifestyle corrections
- Include exactly 4 immediate foods and 4 foods to avoid
- Make all recommendations specific to ${primaryDosha} imbalance
- The dosha_scores must add up to 100
- Be warm, specific, and clinically responsible
`.trim()
}
