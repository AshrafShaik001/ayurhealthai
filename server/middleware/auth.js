import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ayurhealthai_dev_secret'

// ── Verify JWT on protected routes ───────────────────────────
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId    = decoded.id
    req.userEmail = decoded.email
    req.userName  = decoded.name
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' })
  }
}
