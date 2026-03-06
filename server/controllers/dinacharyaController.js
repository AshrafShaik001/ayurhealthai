import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'
import DinacharyaRoutine from '../models/DinacharyaRoutine.js'


// ── Static fallbacks ─────────────────────────────────────────────────────────
const FALLBACK = {
  vata: [
    { time: null, title: 'Wake Up Gently', description: 'Rise slowly, avoid rushing. Drink a glass of warm water with a pinch of ginger to ground Vata energy.', category: 'morning', icon: '🌅', duration: '5 minutes' },
    { time: null, title: 'Tongue Scraping', description: 'Use a copper or silver tongue scraper 7–14 times to remove overnight toxins (ama) and stimulate digestion.', category: 'morning', icon: '👅', duration: '2 minutes' },
    { time: null, title: 'Oil Pulling', description: 'Swish 1 tbsp warm sesame oil for 10–15 minutes to detox and nourish oral health. Spit into trash.', category: 'morning', icon: '🫙', duration: '15 minutes' },
    { time: null, title: 'Abhyanga (Self-Massage)', description: 'Warm sesame oil full-body massage for 10–15 minutes. Calms the nervous system and deeply nourishes Vata.', category: 'morning', icon: '🧴', duration: '15 minutes' },
    { time: null, title: 'Warm Shower', description: 'Shower with warm (not hot) water to rinse off the oil. Use calming lavender or sandalwood soap.', category: 'morning', icon: '🚿', duration: '10 minutes' },
    { time: null, title: 'Morning Yoga & Pranayama', description: 'Gentle, grounding poses: forward folds, warrior series, child\'s pose. Follow with Nadi Shodhana (alternate nostril breathing).', category: 'morning', icon: '🧘', duration: '20 minutes' },
    { time: null, title: 'Warm Breakfast', description: 'Eat a warm, oily, nourishing breakfast. Oatmeal with ghee, dates, and warm spiced milk works beautifully for Vata.', category: 'morning', icon: '🍲', duration: '20 minutes' },
    { time: null, title: 'Focused Work / Study', description: 'Channel Vata\'s creative energy during peak morning hours. Avoid multitasking — stay grounded with one task at a time.', category: 'midday', icon: '💻', duration: '3 hours' },
    { time: null, title: 'Warm Lunch (Main Meal)', description: 'Eat the largest meal of the day at midday. Warm, cooked foods: rice, lentil dal, root vegetables with ghee and cumin.', category: 'midday', icon: '🍛', duration: '30 minutes' },
    { time: null, title: 'Gentle Walk', description: 'A 10–15 minute slow walk after lunch aids digestion. Avoid vigorous exercise immediately after eating.', category: 'midday', icon: '🚶', duration: '15 minutes' },
    { time: null, title: 'Creative Break', description: 'Short creative or artistic break — journaling, drawing, or listening to calming music restores Vata balance.', category: 'midday', icon: '🎨', duration: '10 minutes' },
    { time: null, title: 'Afternoon Herbal Tea', description: 'Sip warm CCF tea (cumin, coriander, fennel) or ashwagandha milk to sustain energy and calm anxiety.', category: 'evening', icon: '🍵', duration: '10 minutes' },
    { time: null, title: 'Evening Walk', description: 'Slow, mindful walk in nature. Avoid cold or windy environments that aggravate Vata.', category: 'evening', icon: '🌳', duration: '20 minutes' },
    { time: null, title: 'Light Dinner', description: 'Eat dinner before 7 PM. Warm soups, kitchari, or lightly spiced cooked vegetables. Avoid raw or cold foods.', category: 'evening', icon: '🥣', duration: '20 minutes' },
    { time: null, title: 'Evening Meditation', description: 'Guided body scan or loving-kindness meditation to release accumulated Vata anxiety from the day.', category: 'evening', icon: '🧠', duration: '15 minutes' },
    { time: null, title: 'Wind Down Routine', description: 'Dim lights, avoid screens. Read something uplifting or listen to soft music. Apply warm oil to your feet.', category: 'night', icon: '🌙', duration: '30 minutes' },
    { time: null, title: 'Warm Milk Before Bed', description: 'Drink warm ashwagandha or nutmeg milk to promote deep, restful sleep — vital for balancing Vata.', category: 'night', icon: '🥛', duration: '10 minutes' },
    { time: null, title: 'Sleep', description: 'Aim for 8–9 hours. Sleep by 10 PM. Vata requires more rest than other doshas to stay grounded and calm.', category: 'night', icon: '😴', duration: '8 hours' },
  ],
  pitta: [
    { time: null, title: 'Wake Up Cool & Calm', description: 'Rise before the heat builds. Splash cool water on your face and eyes. Drink cool (room temp) water with lime.', category: 'morning', icon: '🌅', duration: '5 minutes' },
    { time: null, title: 'Tongue Scraping', description: 'Use a silver tongue scraper 7–14 times. Silver has cooling properties perfect for Pitta constitution.', category: 'morning', icon: '👅', duration: '2 minutes' },
    { time: null, title: 'Oil Pulling', description: 'Swish 1 tbsp coconut oil (cooling) for 10–15 minutes. Coconut oil pacifies Pitta\'s heat.', category: 'morning', icon: '🫙', duration: '15 minutes' },
    { time: null, title: 'Coconut Oil Massage', description: 'Light self-massage with coconut or sunflower oil. Focus on temples and scalp to cool Pitta\'s mental intensity.', category: 'morning', icon: '🧴', duration: '10 minutes' },
    { time: null, title: 'Cool Shower', description: 'Shower with cool to lukewarm water. Avoid scalding hot showers that increase Pitta\'s heat and inflammation.', category: 'morning', icon: '🚿', duration: '10 minutes' },
    { time: null, title: 'Morning Yoga & Pranayama', description: 'Cooling poses: moon salutations, twists, forward folds. Follow with Sheetali pranayama (cooling breath) to calm intensity.', category: 'morning', icon: '🧘', duration: '25 minutes' },
    { time: null, title: 'Cooling Breakfast', description: 'Sweet fruits, coconut yogurt, oatmeal with coconut milk and raisins. Avoid spicy or acidic foods in the morning.', category: 'morning', icon: '🥭', duration: '20 minutes' },
    { time: null, title: 'Peak Performance Work', description: 'Pitta excels at focused, analytical tasks. Schedule your most demanding work now. Set a timer to take breaks — don\'t overwork.', category: 'midday', icon: '💻', duration: '3 hours' },
    { time: null, title: 'Main Meal (Lunch)', description: 'Largest meal at noon. Sweet, bitter, astringent tastes: basmati rice, cucumber raita, mild dal, leafy greens with lime.', category: 'midday', icon: '🍱', duration: '30 minutes' },
    { time: null, title: 'Post-Meal Rest', description: 'A brief 10-minute walk in shade or a cool room. Avoid direct sun between noon and 2 PM — peak Pitta time.', category: 'midday', icon: '🌿', duration: '10 minutes' },
    { time: null, title: 'Creative / Leadership Work', description: 'Channel Pitta\'s natural leadership and problem-solving in the early afternoon. Practice delegation to avoid burnout.', category: 'midday', icon: '📊', duration: '2 hours' },
    { time: null, title: 'Cooling Herbal Tea', description: 'Sip rose petal, mint, or licorice tea. Avoid caffeinated drinks that further stimulate Pitta.', category: 'evening', icon: '🍵', duration: '10 minutes' },
    { time: null, title: 'Evening Exercise', description: 'Moderate exercise in the cool of evening — swimming, cycling, or walking. Avoid intense competition or overexertion.', category: 'evening', icon: '🏊', duration: '30 minutes' },
    { time: null, title: 'Light Dinner', description: 'Eat by 7 PM. Cooling, light foods: vegetable soup, kitchari, steamed greens. Avoid chili, garlic, onion, or fermented foods.', category: 'evening', icon: '🥗', duration: '20 minutes' },
    { time: null, title: 'Gratitude & Journaling', description: 'Write 3 things you are grateful for. Release the day\'s perfectionism and let go of judgment — key for Pitta balance.', category: 'evening', icon: '📓', duration: '10 minutes' },
    { time: null, title: 'Wind Down', description: 'Cool, dark room. Read something light. Avoid work emails or anything that triggers Pitta\'s competitive drive before bed.', category: 'night', icon: '🌙', duration: '20 minutes' },
    { time: null, title: 'Cooling Milk', description: 'Warm (not hot) saffron or cardamom milk with a little honey to relax the mind and cool Pitta before sleep.', category: 'night', icon: '🥛', duration: '10 minutes' },
    { time: null, title: 'Sleep', description: 'Aim for 7–8 hours. Sleep by 10:30 PM. Pitta must avoid burning the midnight oil — this overheats the system.', category: 'night', icon: '😴', duration: '7.5 hours' },
  ],
  kapha: [
    { time: null, title: 'Rise Early & Move Immediately', description: 'Wake before 6 AM during Kapha hours. Don\'t linger in bed! Get up immediately and move to overcome morning sluggishness.', category: 'morning', icon: '🌅', duration: '5 minutes' },
    { time: null, title: 'Tongue Scraping', description: 'Kapha produces the most ama overnight. Scrape tongue 10–14 times vigorously with copper scraper to detox.', category: 'morning', icon: '👅', duration: '2 minutes' },
    { time: null, title: 'Dry Brushing (Garshana)', description: 'Vigorous dry brushing with a natural bristle brush or raw silk gloves. Stimulates lymphatic drainage and circulation for Kapha.', category: 'morning', icon: '🪥', duration: '10 minutes' },
    { time: null, title: 'Oil Pulling with Mustard Oil', description: 'Swish warm mustard oil (heating and stimulating) for 10 minutes. Cuts Kapha mucus and improves oral health.', category: 'morning', icon: '🫙', duration: '10 minutes' },
    { time: null, title: 'Vigorous Exercise', description: 'Kapha MUST exercise every day. Run, do HIIT, sun salutations, or dance. Minimum 30–45 minutes of heart-pumping activity.', category: 'morning', icon: '🏃', duration: '40 minutes' },
    { time: null, title: 'Warm Shower with Invigorating Scents', description: 'Hot shower with eucalyptus, peppermint, or ginger soap. This energizes and clears Kapha congestion.', category: 'morning', icon: '🚿', duration: '10 minutes' },
    { time: null, title: 'Light Breakfast (Optional)', description: 'Kapha can skip breakfast if not hungry. If eating: light, spiced, dry foods — buckwheat porridge with ginger, or fruit.', category: 'morning', icon: '🍎', duration: '15 minutes' },
    { time: null, title: 'Active, Social Work', description: 'Kapha excels in social, collaborative environments. Take initiative in meetings, volunteer for new projects, avoid routine tasks.', category: 'midday', icon: '💼', duration: '3 hours' },
    { time: null, title: 'Main Meal (Lunch)', description: 'Eat at noon. Light, dry, spicy foods: legumes, salads, millet, barley, with plenty of ginger, black pepper, and mustard seeds.', category: 'midday', icon: '🥙', duration: '25 minutes' },
    { time: null, title: 'Walk After Lunch', description: 'A brisk 10–15 minute walk after eating. Kapha must not sit or nap after meals — this increases heaviness and weight.', category: 'midday', icon: '🚶', duration: '15 minutes' },
    { time: null, title: 'Stimulating Afternoon Tasks', description: 'Choose varied, stimulating tasks in the afternoon. Avoid monotony which causes Kapha to disengage and become lethargic.', category: 'midday', icon: '✅', duration: '2 hours' },
    { time: null, title: 'Ginger or Spiced Tea', description: 'Drink warming ginger, cinnamon, or tulsi tea. Skip the heavy chai with milk and sugar — use honey instead if needed.', category: 'evening', icon: '🍵', duration: '10 minutes' },
    { time: null, title: 'Evening Activity', description: 'Don\'t collapse on the couch! A walk, yoga class, or social activity maintains Kapha motivation and avoids evening stagnation.', category: 'evening', icon: '🏋️', duration: '30 minutes' },
    { time: null, title: 'Early Light Dinner', description: 'Eat before 6:30 PM. Very light: vegetable soup, steamed greens, or lentil broth. Skip dessert and heavy foods entirely.', category: 'evening', icon: '🥦', duration: '20 minutes' },
    { time: null, title: 'Journaling / Goal Setting', description: 'Write one thing you accomplished and one goal for tomorrow. Kapha benefits from regular motivation and achievement review.', category: 'evening', icon: '📓', duration: '10 minutes' },
    { time: null, title: 'Wind Down Early', description: 'Begin winding down by 9 PM. Kapha should aim to be asleep before 10 PM to avoid the midnight energy burst and overeating.', category: 'night', icon: '🌙', duration: '20 minutes' },
    { time: null, title: 'Herbal Nightcap', description: 'Warm water with a pinch of trikatu (ginger, black pepper, long pepper) or tulsi tea — no milk before bed for Kapha.', category: 'night', icon: '🌿', duration: '5 minutes' },
    { time: null, title: 'Sleep', description: 'Aim for 6–7 hours (less than Vata). Kapha should NOT oversleep — it increases heaviness and emotional dullness.', category: 'night', icon: '😴', duration: '6.5 hours' },
  ],
}

const CATEGORY_ICONS = { morning: '🌄', midday: '☀️', evening: '🌆', night: '🌙' }

function addTimesToActivities(activities, wakeUpTime) {
  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number)
  let totalMinutes = wakeHour * 60 + wakeMin

  return activities.map((act) => {
    const h = Math.floor(totalMinutes / 60) % 24
    const m = totalMinutes % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    const timeStr = `${displayH}:${String(m).padStart(2, '0')} ${ampm}`

    // Parse duration in minutes to advance the clock
    const dur = act.duration || '15 minutes'
    const match = dur.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)/i)
    let advance = 15
    if (match) {
      const val = parseFloat(match[1])
      advance = match[2].toLowerCase().startsWith('hour') ? val * 60 : val
    }
    totalMinutes += Math.round(advance) + 5 // 5 min buffer between activities

    return { ...act, time: timeStr }
  })
}

// ── Generate routine ─────────────────────────────────────────────────────────
export async function generateRoutine(req, res) {
  try {
    const { dosha, wakeUpTime } = req.body
    if (!dosha || !wakeUpTime) {
      return res.status(400).json({ error: 'dosha and wakeUpTime are required' })
    }

    const sessionId = crypto.randomUUID()
    const doshaLower = dosha.toLowerCase()

    let activities = []
    let aiSummary = ''
    let doshaNote = ''

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const [wakeH, wakeM] = wakeUpTime.split(':').map(Number)
        const ampm = wakeH < 12 ? 'AM' : 'PM'
        const displayH = wakeH % 12 === 0 ? 12 : wakeH % 12
        const wakeDisplay = `${displayH}:${String(wakeM).padStart(2, '0')} ${ampm}`

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: `You are an expert Ayurvedic practitioner specializing in Dinacharya — the daily routine practices that align body and mind with nature's rhythms. You generate highly personalized, practical daily schedules based on the user's dosha and wake-up time. Always respond with valid JSON only, no markdown.`,
          messages: [{
            role: 'user',
            content: `Generate a complete Ayurvedic Dinacharya (daily routine) for a ${dosha} dominant person who wakes up at ${wakeDisplay}.

Return ONLY valid JSON in this exact structure:
{
  "aiSummary": "2-3 sentence overview of this dosha's daily rhythm and key priorities",
  "doshaNote": "1 sentence special tip for this dosha's most common daily challenge",
  "activities": [
    {
      "title": "Activity Name",
      "description": "Detailed 1-2 sentence description with specific Ayurvedic reasoning",
      "category": "morning|midday|evening|night",
      "icon": "single emoji",
      "duration": "X minutes or X hours"
    }
  ]
}

Include 16-20 activities covering: tongue scraping, oil pulling, self-massage (abhyanga), yoga/exercise, pranayama, breakfast, main meal, afternoon work, herbal tea, evening walk, dinner, meditation, journaling, wind-down, warm beverage before bed, sleep.

The schedule should be specifically tailored for ${dosha} dosha imbalances and needs. Include exact Ayurvedic reasoning (which herbs, oils, foods, breathing techniques work for ${dosha}).`,
          }],
        })

        const rawText = response.content[0].text.trim()
        let parsed
        try { parsed = JSON.parse(rawText) } catch {
          const stripped = rawText.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/m, '').trim()
          try { parsed = JSON.parse(stripped) } catch {
            const s = rawText.indexOf('{'), e = rawText.lastIndexOf('}')
            if (s !== -1 && e > s) parsed = JSON.parse(rawText.slice(s, e + 1))
            else throw new Error('Could not parse AI response')
          }
        }

        aiSummary = parsed.aiSummary || ''
        doshaNote = parsed.doshaNote || ''
        activities = addTimesToActivities(parsed.activities || [], wakeUpTime)
      } catch (aiErr) {
        console.error('Claude API error, using fallback:', aiErr.message)
        activities = addTimesToActivities(FALLBACK[doshaLower] || FALLBACK.vata, wakeUpTime)
        aiSummary = getFallbackSummary(doshaLower)
        doshaNote = getFallbackNote(doshaLower)
      }
    } else {
      activities = addTimesToActivities(FALLBACK[doshaLower] || FALLBACK.vata, wakeUpTime)
      aiSummary = getFallbackSummary(doshaLower)
      doshaNote = getFallbackNote(doshaLower)
    }

    // Save to MongoDB if connected
    let routine = null
    try {
      routine = await DinacharyaRoutine.create({
        sessionId,
        dosha: doshaLower,
        wakeUpTime,
        activities,
        aiSummary,
        doshaNote,
        completionDate: new Date().toISOString().split('T')[0],
      })
    } catch (dbErr) {
      console.warn('MongoDB save skipped:', dbErr.message)
    }

    // Use MongoDB-saved activities (which have _id fields) when available
    // so the frontend can use activity._id for the toggle PATCH endpoint
    const responseActivities = routine
      ? routine.activities.map((a) => a.toObject())
      : activities

    return res.json({
      sessionId,
      dosha: doshaLower,
      wakeUpTime,
      activities: responseActivities,
      aiSummary,
      doshaNote,
    })
  } catch (err) {
    console.error('generateRoutine error:', err)
    return res.status(500).json({ error: 'Failed to generate routine' })
  }
}

// ── Get routine ──────────────────────────────────────────────────────────────
export async function getRoutine(req, res) {
  try {
    const routine = await DinacharyaRoutine.findOne({ sessionId: req.params.sessionId })
    if (!routine) return res.status(404).json({ error: 'Routine not found' })
    return res.json(routine)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve routine' })
  }
}

// ── Update activity completion ────────────────────────────────────────────────
export async function updateProgress(req, res) {
  try {
    const { sessionId } = req.params
    const { activityId, completed } = req.body

    const routine = await DinacharyaRoutine.findOne({ sessionId })
    if (!routine) return res.status(404).json({ error: 'Routine not found' })

    const activity = routine.activities.id(activityId)
    if (!activity) return res.status(404).json({ error: 'Activity not found' })

    activity.completed = completed
    routine.lastUpdated = new Date()
    await routine.save()

    return res.json({ success: true, completed })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update progress' })
  }
}

// ── Reset all completions for today ─────────────────────────────────────────
export async function resetProgress(req, res) {
  try {
    const routine = await DinacharyaRoutine.findOne({ sessionId: req.params.sessionId })
    if (!routine) return res.status(404).json({ error: 'Routine not found' })

    routine.activities.forEach((a) => { a.completed = false })
    routine.completionDate = new Date().toISOString().split('T')[0]
    routine.lastUpdated = new Date()
    await routine.save()

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset progress' })
  }
}

function getFallbackSummary(dosha) {
  const map = {
    vata:  'Vata types thrive with grounding, warm, and nourishing routines that counter their naturally mobile and erratic energy. Consistency is the single most powerful medicine for Vata — doing the same things at the same times each day creates stability and calm in both body and mind.',
    pitta: 'Pitta types need a cooling, moderating daily rhythm that channels their natural drive without allowing it to become burnout or inflammation. Prioritizing rest, play, and cooling practices alongside focused work keeps Pitta\'s formidable energy sustainable and joyful.',
    kapha: 'Kapha types flourish with stimulating, varied, and vigorous routines that counter their natural tendency toward heaviness and inertia. Early rising, daily intense exercise, and light eating are the three non-negotiable pillars that keep Kapha energized, motivated, and healthy.',
  }
  return map[dosha] || map.vata
}

function getFallbackNote(dosha) {
  const map = {
    vata:  'Tip: Resist the urge to skip meals or stay up late — regularity is Vata\'s most powerful medicine.',
    pitta: 'Tip: Build in at least 15 minutes of unstructured, playful downtime each day — Pitta\'s biggest blind spot is rest.',
    kapha: 'Tip: Never press snooze — the moment Kapha stays in bed past 6 AM, the whole day becomes heavier and harder.',
  }
  return map[dosha] || map.vata
}
