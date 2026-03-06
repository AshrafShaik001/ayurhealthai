import { Router } from 'express'
import { createConsultation, listConsultations } from '../controllers/consultationController.js'
import { getRemedies, getRemedyById } from '../controllers/remedyController.js'
import { submitQuiz, getQuizResult } from '../controllers/quizController.js'
import { getRecommendations } from '../controllers/recommendationController.js'
import { analyzeSymptoms } from '../controllers/symptomController.js'
import { generateRoutine, getRoutine, updateProgress, resetProgress } from '../controllers/dinacharyaController.js'

const router = Router()

// ── Health ───────────────────────────────────────────────────
router.get('/', (_req, res) => res.json({ message: 'AyurHealthAI API v1' }))

// ── Consultation ─────────────────────────────────────────────
router.post('/consultation',  createConsultation)
router.get('/consultation',   listConsultations)   // admin / debug

// ── Remedies ─────────────────────────────────────────────────
router.get('/remedies',      getRemedies)
router.get('/remedies/:id',  getRemedyById)

// ── Dosha Quiz ───────────────────────────────────────────────
router.post('/quiz/submit',           submitQuiz)
router.get('/quiz/result/:sessionId', getQuizResult)

// ── Recommendations (Claude AI) ──────────────────────────────
router.post('/recommendations', getRecommendations)

// ── Symptom Checker (Claude AI) ──────────────────────────────
router.post('/symptoms/analyze', analyzeSymptoms)

// ── Dinacharya Planner (Claude AI) ───────────────────────────
router.post('/dinacharya/generate',              generateRoutine)
router.get('/dinacharya/:sessionId',             getRoutine)
router.patch('/dinacharya/:sessionId/progress',  updateProgress)
router.patch('/dinacharya/:sessionId/reset',     resetProgress)

export default router
