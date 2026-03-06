import Remedy from '../models/Remedy.js'

// Seed data used when DB is empty
const SEED_REMEDIES = [
  { name: 'Ashwagandha', emoji: '🌱', dosha: 'Vata / Kapha',  description: 'Adaptogenic root that reduces stress, boosts energy and supports immune function.' },
  { name: 'Turmeric',    emoji: '🟡', dosha: 'All Doshas',    description: 'Powerful anti-inflammatory and antioxidant; supports joint and digestive health.' },
  { name: 'Triphala',    emoji: '🍵', dosha: 'All Doshas',    description: 'Classic formula of three fruits that gently cleanses and tones the digestive tract.' },
  { name: 'Brahmi',      emoji: '🧠', dosha: 'Pitta / Vata',  description: 'Brain tonic herb renowned for enhancing memory, focus, and calm.' },
  { name: 'Neem',        emoji: '🌿', dosha: 'Pitta / Kapha', description: 'Bitter cooling herb used for skin health, blood purification, and immunity.' },
  { name: 'Shatavari',   emoji: '💚', dosha: 'Vata / Pitta',  description: 'Rejuvenating adaptogen particularly supportive for reproductive and hormonal health.' },
]

// GET /api/remedies
export async function getRemedies(_req, res, next) {
  try {
    let remedies = await Remedy.find().sort({ name: 1 })

    // Seed if empty (convenience for first run)
    if (remedies.length === 0) {
      remedies = await Remedy.insertMany(SEED_REMEDIES)
    }

    res.json({ count: remedies.length, remedies })
  } catch (err) {
    next(err)
  }
}

// GET /api/remedies/:id
export async function getRemedyById(req, res, next) {
  try {
    const remedy = await Remedy.findById(req.params.id)
    if (!remedy) return res.status(404).json({ error: 'Remedy not found.' })
    res.json(remedy)
  } catch (err) {
    next(err)
  }
}
