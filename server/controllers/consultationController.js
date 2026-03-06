import Consultation from '../models/Consultation.js'

// POST /api/consultation
export async function createConsultation(req, res, next) {
  try {
    const { name, email, age, concern, dosha } = req.body

    if (!name || !email || !concern) {
      return res.status(400).json({ error: 'name, email, and concern are required.' })
    }

    // Placeholder AI logic — swap for real AI integration
    const aiResponse = generateAyurvedicAdvice({ name, concern, dosha })

    const consultation = await Consultation.create({
      name, email, age: age ? Number(age) : undefined, concern, dosha, aiResponse,
    })

    res.status(201).json({
      message: `Thank you, ${name}! Your personalised Ayurvedic recommendation has been generated.`,
      recommendation: aiResponse,
      id: consultation._id,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/consultation  (admin / debug)
export async function listConsultations(_req, res, next) {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 }).limit(50)
    res.json({ count: consultations.length, consultations })
  } catch (err) {
    next(err)
  }
}

// ── Helpers ──────────────────────────────────────────────────
function generateAyurvedicAdvice({ name, concern, dosha }) {
  const doshaMap = {
    Vata:      'warming foods, sesame oil massage, and grounding routines',
    Pitta:     'cooling foods, coconut oil, and relaxation practices',
    Kapha:     'light stimulating foods, dry brushing, and energising exercise',
    'Not sure': 'a balanced diet, consistent sleep schedule, and mindful movement',
  }
  const advice = doshaMap[dosha] || doshaMap['Not sure']
  return `Based on your concern about "${concern}", we recommend ${advice}. Please consult a qualified Ayurvedic practitioner for personalised guidance, ${name}.`
}
