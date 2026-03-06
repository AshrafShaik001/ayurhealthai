import Anthropic from '@anthropic-ai/sdk'
import QuizResult from '../models/QuizResult.js'

// ── POST /api/quiz/submit ────────────────────────────────────
export async function submitQuiz(req, res) {
  try {
    const { sessionId, answers, scores, percentages, dominantDosha } = req.body

    if (!sessionId || !answers?.length || !scores || !dominantDosha) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const validDoshas = ['Vata', 'Pitta', 'Kapha']
    if (!validDoshas.includes(dominantDosha)) {
      return res.status(400).json({ error: 'Invalid dominantDosha value.' })
    }

    // Generate AI recommendations (always returns — never throws)
    const recommendation = await getAIRecommendations(dominantDosha, percentages)

    // Save to MongoDB (optional — don't crash if it fails)
    let dbId = null
    try {
      const quizResult = await QuizResult.create({
        sessionId,
        answers,
        scores,
        percentages,
        dominantDosha,
        recommendation,
      })
      dbId = quizResult._id
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        // Session already saved — just return success
        console.warn('Duplicate sessionId, returning existing session.')
        return res.status(200).json({ success: true, sessionId })
      }
      console.error('MongoDB save error (non-fatal):', dbErr.message)
      // Still return the recommendation even if DB save failed
    }

    return res.status(201).json({ success: true, sessionId, id: dbId })
  } catch (err) {
    console.error('submitQuiz unexpected error:', err?.message || err)
    return res.status(500).json({ error: err?.message || 'Failed to submit quiz. Please try again.' })
  }
}

// ── GET /api/quiz/result/:sessionId ─────────────────────────
export async function getQuizResult(req, res) {
  try {
    const result = await QuizResult.findOne({ sessionId: req.params.sessionId })
    if (!result) return res.status(404).json({ error: 'Result not found.' })
    res.json(result)
  } catch (err) {
    console.error('getQuizResult error:', err?.message)
    return res.status(500).json({ error: 'Failed to retrieve quiz result.' })
  }
}

// ── Claude API ───────────────────────────────────────────────
async function getAIRecommendations(dominantDosha, percentages) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — using fallback recommendations.')
    return getFallback(dominantDosha)
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 2048,
      system: [
        'You are a deeply knowledgeable Ayurvedic wellness consultant with 20 years of experience.',
        'Respond ONLY with a single valid JSON object — no markdown fences, no text outside the JSON.',
        'Be warm, specific, and practical. Use second-person ("you") throughout.',
      ].join(' '),
      messages: [{
        role: 'user',
        content: `
A user completed an Ayurvedic Dosha assessment quiz. Their results:

Dominant Dosha : ${dominantDosha}
Vata  : ${percentages.vata}%
Pitta : ${percentages.pitta}%
Kapha : ${percentages.kapha}%

Generate personalised Ayurvedic recommendations with this exact JSON structure:

{
  "summary": "3-sentence overview of their constitution, what it means for their health, and one encouraging note",
  "diet": {
    "favor": ["6 specific foods or food qualities tailored to their dosha"],
    "avoid": ["5 specific foods or habits to reduce"],
    "tips":  ["3 practical daily eating tips"]
  },
  "lifestyle": {
    "dailyRoutine": [
      "4 specific dinacharya (daily routine) steps with approximate timing"
    ],
    "exercise": "A specific exercise recommendation with 2–3 examples and intensity level",
    "sleep":    "A specific sleep recommendation including timing and any rituals"
  },
  "herbs": [
    { "name": "Herb Name", "benefit": "One clear sentence on why it helps their constitution" },
    { "name": "Herb Name", "benefit": "..." },
    { "name": "Herb Name", "benefit": "..." },
    { "name": "Herb Name", "benefit": "..." }
  ],
  "yoga": [
    "4–5 specific yoga poses or pranayama practices with brief note on benefit for their dosha"
  ]
}

Tailor everything specifically to ${dominantDosha} dosha. Be practical and actionable — avoid generic advice.
        `.trim(),
      }],
    })

    const raw = message.content[0].text.trim()

    // Try direct parse; if that fails, strip fences or extract outermost {...}
    let parsed
    try { parsed = JSON.parse(raw) } catch {
      const stripped = raw.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/m, '').trim()
      try { parsed = JSON.parse(stripped) } catch {
        const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
        if (s !== -1 && e > s) parsed = JSON.parse(raw.slice(s, e + 1))
        else throw new Error('Could not parse AI response as JSON')
      }
    }
    return parsed
  } catch (err) {
    console.error('Claude API error — falling back to static recommendations:', err.message)
    return getFallback(dominantDosha)
  }
}

// ── Static fallbacks ─────────────────────────────────────────
function getFallback(dosha) {
  const map = {
    Vata: {
      summary:
        'Your constitution is predominantly Vata — governed by the elements of Air and Space. You are naturally creative, enthusiastic, and quick-thinking, with a gift for ideas and adaptability. The key to your wellbeing is grounding, warmth, and nourishing consistency.',
      diet: {
        favor: [
          'Warm, freshly cooked, and slightly oily foods',
          'Sweet, salty, and sour tastes',
          'Root vegetables like sweet potato, carrot, and beet',
          'Whole grains such as rice, oats, and wheat',
          'Warming spices — ginger, cinnamon, cardamom, cumin',
          'Healthy fats — ghee, sesame oil, avocado',
        ],
        avoid: [
          'Raw, cold, or dry foods (salads, crackers, cold drinks)',
          'Bitter and astringent tastes in excess',
          'Caffeine and alcohol, which aggravate dryness',
          'Skipping meals or irregular eating times',
          'Excessive fasting or very light diets',
        ],
        tips: [
          'Eat warm, cooked meals at the same time each day — consistency pacifies Vata.',
          'Add a teaspoon of ghee to rice or vegetables to lubricate and nourish your tissues.',
          'Sip warm ginger tea or CCF tea (cumin, coriander, fennel) throughout the day.',
        ],
      },
      lifestyle: {
        dailyRoutine: [
          '6:00 AM — Rise gently; drink a glass of warm water with lemon to awaken digestion.',
          '6:30 AM — Abhyanga (warm sesame oil self-massage) for 10 minutes before a warm shower.',
          '12:00 PM — Eat your largest, warmest meal of the day; rest briefly afterward.',
          '9:00 PM — Wind down with warm milk with ashwagandha and nutmeg; sleep by 10 PM.',
        ],
        exercise:
          'Gentle, grounding practices that build strength without over-stimulation. Ideal choices: Hatha yoga, tai chi, slow walking in nature, and light swimming. Aim for 30–45 minutes daily — avoid intense cardio or over-exertion that depletes Vata.',
        sleep:
          'Prioritise 7–8 hours of sleep. Maintain a consistent bedtime (ideally before 10 PM). Use warm, heavy blankets; consider a warm oil foot massage before bed. Avoid screens for one hour before sleep.',
      },
      herbs: [
        { name: 'Ashwagandha', benefit: 'A deeply grounding adaptogen that calms Vata anxiety, rebuilds strength, and supports restful sleep.' },
        { name: 'Shatavari',   benefit: 'Nourishes and moistens Vata dryness, supports hormonal balance, and builds resilience.' },
        { name: 'Triphala',    benefit: 'Gently regulates Vata-related digestive irregularity and supports elimination without depleting.' },
        { name: 'Brahmi',      benefit: 'Calms the racing Vata mind, enhances focus, and reduces overthinking and nervous tension.' },
      ],
      yoga: [
        "Child's Pose (Balasana) — deeply grounding, releases lower back tension common in Vata",
        'Seated Forward Fold (Paschimottanasana) — calms the nervous system and stretches the spine',
        'Mountain Pose (Tadasana) — builds the sense of rootedness and earth connection Vata needs',
        'Legs Up the Wall (Viparita Karani) — restores energy and calms Vata hyperactivity',
        'Nadi Shodhana Pranayama (Alternate Nostril Breathing) — balances Vata air energy in the mind',
      ],
    },

    Pitta: {
      summary:
        'Your constitution is predominantly Pitta — governed by Fire and Water. You are naturally sharp, driven, and courageous, with strong leadership qualities and a brilliant intellect. Your path to balance lies in cooling, releasing control, and channelling your fire with compassion rather than intensity.',
      diet: {
        favor: [
          'Cool, refreshing foods — cucumber, coconut water, mint, coriander',
          'Sweet, bitter, and astringent tastes',
          'Leafy greens, broccoli, asparagus, and zucchini',
          'Cooling grains — basmati rice, barley, oats',
          'Ghee and coconut oil as primary fats',
          'Sweet fruits — grapes, melon, pear, and figs',
        ],
        avoid: [
          'Spicy, pungent, and overly salty foods',
          'Fermented foods, vinegar, and alcohol',
          'Red meat and fried foods',
          'Skipping meals (leads to Pitta irritability and hypoglycaemia)',
          'Eating while stressed, angry, or rushed',
        ],
        tips: [
          'Eat at regular mealtimes — never skip lunch, as midday is your strongest Pitta digestive window.',
          'Include fresh coriander, coconut, and fennel regularly to cool excess internal heat.',
          'Start the day with a glass of cool (not cold) water and fresh lime rather than hot coffee.',
        ],
      },
      lifestyle: {
        dailyRoutine: [
          '6:00 AM — Rise before the Pitta period (10 AM–2 PM) heats the day; practice 10 minutes of cooling pranayama.',
          '7:00 AM — Coconut oil self-massage (abhyanga) followed by a cool-to-warm shower.',
          '12:00 PM — Eat your largest, most nourishing meal of the day when digestion is strongest.',
          '7:00 PM — Take an evening walk in nature; avoid intense work or screens after 9 PM.',
        ],
        exercise:
          'Moderate, non-competitive exercise that challenges without overheating. Ideal choices: swimming, cycling, hiking in cool environments, and yoga. Aim for 45 minutes. Avoid extreme heat (like hot yoga) and overly competitive activities that flare Pitta aggression.',
        sleep:
          'Aim for 6–8 hours. Sleep in a cool, well-ventilated room. Avoid working late into the evening. A brief meditation before bed helps discharge accumulated Pitta mental heat. Consistent sleep before 10:30 PM is ideal.',
      },
      herbs: [
        { name: 'Shatavari', benefit: 'Cools and nourishes Pitta fire, supports hormonal balance, and soothes inflamed tissues.' },
        { name: 'Amalaki',   benefit: 'The finest Pitta herb — deeply cooling, rich in Vitamin C, and rejuvenating to digestive and skin health.' },
        { name: 'Brahmi',    benefit: 'Cools the Pitta intellect, reduces irritability and perfectionism, and supports calm focus.' },
        { name: 'Neem',      benefit: 'Clears Pitta heat from the blood and skin; excellent for inflammatory skin conditions.' },
      ],
      yoga: [
        'Moon Salutation (Chandra Namaskar) — the cooling counterpart to Sun Salutation, ideal for Pitta',
        'Cobra Pose (Bhujangasana) — opens the heart and reduces the rigidity Pitta can create',
        'Fish Pose (Matsyasana) — expands the chest, cooling the Pitta tendency to constrict',
        'Sheetali Pranayama (Cooling Breath) — directly reduces internal heat and calms Pitta fire',
        'Savasana with cooling eye pillow — Pitta often rushes through rest; make this sacred',
      ],
    },

    Kapha: {
      summary:
        'Your constitution is predominantly Kapha — governed by Water and Earth. You are naturally calm, compassionate, and deeply loyal, with remarkable endurance and a nurturing spirit. Your path to balance lies in stimulation, lightness, and embracing movement and change with enthusiasm.',
      diet: {
        favor: [
          'Light, dry, warm, and well-spiced foods',
          'Pungent, bitter, and astringent tastes',
          'Most vegetables especially leafy greens, radishes, and peppers',
          'Legumes — lentils, chickpeas, and mung beans',
          'Light grains — barley, millet, buckwheat, and quinoa',
          'Warming spices — black pepper, ginger, turmeric, and mustard seeds',
        ],
        avoid: [
          'Heavy, oily, cold, and sweet foods',
          'Dairy products especially cold milk, ice cream, and cheese',
          'Refined sugar, wheat, and fried foods',
          'Excessive snacking between meals',
          'Cold drinks and raw salads in cold weather',
        ],
        tips: [
          'Eat your largest meal at midday and keep dinner light — Kapha metabolism slows significantly in the evening.',
          'Begin each morning with hot water, lemon, raw honey, and freshly grated ginger to kindle digestive fire.',
          'Use plenty of warming, stimulating spices in every meal to counteract Kapha\'s natural heaviness.',
        ],
      },
      lifestyle: {
        dailyRoutine: [
          '5:30 AM — Rise early before Kapha time (6–10 AM) to prevent the characteristic morning heaviness.',
          '6:00 AM — Vigorous dry-brush massage (garshana) followed by a warm shower with invigorating oils.',
          '7:00 AM — Do energising exercise before breakfast to ignite metabolism for the day.',
          '7:00 PM — Take an active evening walk; avoid sedentary evenings that increase Kapha stagnation.',
        ],
        exercise:
          'Vigorous, stimulating exercise is essential for Kapha wellbeing — this is non-negotiable. Ideal choices: running, HIIT, power yoga, dance, cycling, and martial arts. Aim for 45–60 minutes of heart-raising activity daily. Kapha benefits from pushing past the initial resistance to start.',
        sleep:
          'Aim for 6–7 hours maximum. Rise early — sleeping in dramatically increases Kapha sluggishness and brain fog. Avoid afternoon naps. Creating a morning alarm ritual that gets you out of bed immediately is transformative for Kapha balance.',
      },
      herbs: [
        { name: 'Trikatu',    benefit: 'The ultimate Kapha-stimulating formula of ginger, black pepper, and long pepper — kindles digestion and clears congestion.' },
        { name: 'Guggul',     benefit: 'Reduces excess Kapha accumulation, supports healthy weight, joint mobility, and metabolic function.' },
        { name: 'Triphala',   benefit: 'Gently detoxifies and lightens Kapha accumulation throughout the digestive tract.' },
        { name: 'Punarnava',  benefit: 'Reduces Kapha-related water retention and supports healthy kidney and liver function.' },
      ],
      yoga: [
        'Sun Salutation (Surya Namaskar) — dynamic, warming, and perfect for igniting Kapha energy each morning',
        'Warrior I & II (Virabhadrasana) — builds strength and fire, counteracting Kapha complacency',
        'Boat Pose (Navasana) — strengthens the core and stimulates Kapha digestion',
        'Kapalbhati Pranayama (Skull-Shining Breath) — powerfully clears Kapha congestion in the lungs and mind',
        'Camel Pose (Ustrasana) — opens the chest and heart, liberating Kapha from emotional attachment',
      ],
    },
  }

  return map[dosha] || map.Vata
}
