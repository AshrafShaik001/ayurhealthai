import Anthropic from '@anthropic-ai/sdk'

// ── POST /api/recommendations ────────────────────────────────
export async function getRecommendations(req, res) {
  try {
    const { doshaType, answers = [], concerns = '' } = req.body

    const valid = ['Vata', 'Pitta', 'Kapha']
    if (!doshaType || !valid.includes(doshaType)) {
      return res.status(400).json({ error: 'doshaType must be Vata, Pitta, or Kapha.' })
    }

    // Build context string from optional quiz answers
    let answerContext = ''
    if (answers.length > 0) {
      const relevant = answers.slice(0, 10)
      answerContext = `\n\nRelevant quiz answers from the user:\n${relevant
        .map(a => `- ${a.questionText}: "${a.selectedOption}"`)
        .join('\n')}`
    }
    if (concerns.trim()) {
      answerContext += `\n\nUser's additional health concerns: ${concerns.trim()}`
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: `You are an expert Ayurvedic practitioner. Based on the user's dosha, give personalized recommendations for diet, daily routine, herbs, and lifestyle in JSON format. Always respond with valid JSON only — no markdown fences, no explanation outside the JSON.`,
      messages: [
        {
          role: 'user',
          content: buildPrompt(doshaType, answerContext),
        },
      ],
    })

    const raw = message.content[0].text.trim()

    let recommendation
    try { recommendation = JSON.parse(raw) } catch {
      const stripped = raw.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/m, '').trim()
      try { recommendation = JSON.parse(stripped) } catch {
        const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
        if (s !== -1 && e > s) recommendation = JSON.parse(raw.slice(s, e + 1))
        else throw new SyntaxError('Could not parse AI response')
      }
    }

    res.json({ success: true, doshaType, recommendation })
  } catch (err) {
    console.error('getRecommendations error:', err?.message || err)
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' })
    }
    if (err?.status === 401) {
      return res.status(502).json({ error: 'API key is invalid. Check ANTHROPIC_API_KEY.' })
    }
    return res.status(500).json({ error: err?.message || 'Failed to generate recommendations.' })
  }
}

// ── Prompt builder ────────────────────────────────────────────
function buildPrompt(doshaType, answerContext) {
  return `
The user's dominant Ayurvedic dosha is ${doshaType}.${answerContext}

Provide comprehensive, highly personalised Ayurvedic recommendations in this exact JSON structure:

{
  "summary": "2–3 sentence warm, personalised overview of their ${doshaType} constitution and what these recommendations focus on",

  "constitution_highlights": [
    "Characteristic 1 specific to ${doshaType}",
    "Characteristic 2 specific to ${doshaType}",
    "Characteristic 3 specific to ${doshaType}",
    "Characteristic 4 specific to ${doshaType}"
  ],

  "diet": {
    "principle": "Core one-sentence dietary principle for ${doshaType}",
    "foods_to_favor": [
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason"
    ],
    "foods_to_avoid": [
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason",
      "Food or category — brief reason"
    ],
    "meal_timing": "Specific meal timing advice for ${doshaType} metabolism",
    "key_spices": [
      "Spice — specific benefit for ${doshaType}",
      "Spice — specific benefit for ${doshaType}",
      "Spice — specific benefit for ${doshaType}",
      "Spice — specific benefit for ${doshaType}",
      "Spice — specific benefit for ${doshaType}"
    ]
  },

  "daily_routine": {
    "morning": [
      { "time": "5:30–6:00 AM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "6:00–6:30 AM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "6:30–7:00 AM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "7:00–8:00 AM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" }
    ],
    "afternoon": [
      { "time": "12:00–1:00 PM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "2:00–2:30 PM",  "practice": "Practice name", "benefit": "Why it helps ${doshaType}" }
    ],
    "evening": [
      { "time": "5:30–6:00 PM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "7:00–8:00 PM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "8:30–9:00 PM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" }
    ],
    "bedtime": [
      { "time": "9:30–10:00 PM", "practice": "Practice name", "benefit": "Why it helps ${doshaType}" },
      { "time": "10:00 PM",      "practice": "Sleep",          "benefit": "Ideal sleep time for ${doshaType}" }
    ]
  },

  "herbs": [
    { "name": "Herb 1", "sanskrit": "Sanskrit name", "benefit": "Specific benefit for ${doshaType}", "how_to_use": "Simple usage method", "timing": "When to take" },
    { "name": "Herb 2", "sanskrit": "Sanskrit name", "benefit": "Specific benefit for ${doshaType}", "how_to_use": "Simple usage method", "timing": "When to take" },
    { "name": "Herb 3", "sanskrit": "Sanskrit name", "benefit": "Specific benefit for ${doshaType}", "how_to_use": "Simple usage method", "timing": "When to take" },
    { "name": "Herb 4", "sanskrit": "Sanskrit name", "benefit": "Specific benefit for ${doshaType}", "how_to_use": "Simple usage method", "timing": "When to take" },
    { "name": "Herb 5", "sanskrit": "Sanskrit name", "benefit": "Specific benefit for ${doshaType}", "how_to_use": "Simple usage method", "timing": "When to take" }
  ],

  "lifestyle": {
    "exercise": {
      "type": "Ideal exercise type for ${doshaType}",
      "intensity": "Recommended intensity level",
      "duration": "Recommended session duration",
      "best_time": "Best time of day to exercise for ${doshaType}"
    },
    "sleep": {
      "ideal_hours": "Ideal hours of sleep",
      "bedtime": "Recommended bedtime",
      "rituals": [
        "Sleep ritual 1",
        "Sleep ritual 2",
        "Sleep ritual 3"
      ]
    },
    "stress_management": [
      "Technique 1 specific to how ${doshaType} experiences stress",
      "Technique 2 specific to how ${doshaType} experiences stress",
      "Technique 3 specific to how ${doshaType} experiences stress"
    ],
    "seasonal_advice": "One key seasonal self-care tip for ${doshaType} types"
  },

  "yoga": {
    "poses": [
      { "name": "Pose 1 English", "sanskrit": "Sanskrit name", "benefit": "Why ideal for ${doshaType}" },
      { "name": "Pose 2 English", "sanskrit": "Sanskrit name", "benefit": "Why ideal for ${doshaType}" },
      { "name": "Pose 3 English", "sanskrit": "Sanskrit name", "benefit": "Why ideal for ${doshaType}" },
      { "name": "Pose 4 English", "sanskrit": "Sanskrit name", "benefit": "Why ideal for ${doshaType}" },
      { "name": "Pose 5 English", "sanskrit": "Sanskrit name", "benefit": "Why ideal for ${doshaType}" }
    ],
    "pranayama": [
      { "name": "Breathing technique 1", "benefit": "How it balances ${doshaType}", "practice": "Step-by-step practice instruction" },
      { "name": "Breathing technique 2", "benefit": "How it balances ${doshaType}", "practice": "Step-by-step practice instruction" }
    ],
    "meditation": "Specific meditation style or technique best suited for ${doshaType} mind and temperament"
  }
}

Make every recommendation specifically tailored to ${doshaType} dosha. Be warm, practical, and actionable.
  `.trim()
}
