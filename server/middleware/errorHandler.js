// 404 handler — attach after all routes
export function notFound(req, res, next) {
  const error = new Error(`Not found — ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Global error handler
export function errorHandler(err, _req, res, _next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry — resource already exists.' })
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ error: messages.join(', ') })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid resource ID format.' })
  }

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
