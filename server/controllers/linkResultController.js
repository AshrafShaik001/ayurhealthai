import QuizResult        from '../models/QuizResult.js'
import DinacharyaRoutine from '../models/DinacharyaRoutine.js'

// ── PATCH /api/quiz/link/:sessionId ─────────────────────────
// Links an anonymous quiz session to the logged-in user
export async function linkQuizToUser(req, res) {
  try {
    const { sessionId } = req.params
    const userId        = req.userId   // set by requireAuth middleware

    const doc = await QuizResult.findOneAndUpdate(
      { sessionId },
      { $set: { userId } },
      { new: true }
    )
    if (!doc) return res.status(404).json({ error: 'Quiz session not found.' })

    return res.json({ success: true, message: 'Quiz result saved to your profile!' })
  } catch (err) {
    console.error('linkQuizToUser error:', err?.message)
    return res.status(500).json({ error: 'Could not save quiz result.' })
  }
}

// ── PATCH /api/dinacharya/link/:sessionId ───────────────────
// Links an anonymous dinacharya session to the logged-in user
export async function linkDinacharyaToUser(req, res) {
  try {
    const { sessionId } = req.params
    const userId        = req.userId

    const doc = await DinacharyaRoutine.findOneAndUpdate(
      { sessionId },
      { $set: { userId } },
      { new: true }
    )
    if (!doc) return res.status(404).json({ error: 'Dinacharya session not found.' })

    return res.json({ success: true, message: 'Dinacharya routine saved to your profile!' })
  } catch (err) {
    console.error('linkDinacharyaToUser error:', err?.message)
    return res.status(500).json({ error: 'Could not save dinacharya routine.' })
  }
}
