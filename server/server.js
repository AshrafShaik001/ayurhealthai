import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load .env from the same directory as server.js (works regardless of where node is launched from)
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import apiRouter from './routes/api.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5001

// Connect to MongoDB
connectDB()

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// ── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'AyurHealthAI API' }))
app.use('/api', apiRouter)

// ── Error handling ──────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🌿 AyurHealthAI server running on http://localhost:${PORT}`)
})
