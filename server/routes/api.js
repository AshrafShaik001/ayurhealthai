import { Router } from 'express'
import { createConsultation, listConsultations } from '../controllers/consultationController.js'
import { getRemedies, getRemedyById } from '../controllers/remedyController.js'
import { submitQuiz, getQuizResult } from '../controllers/quizController.js'
import { getRecommendations } from '../controllers/recommendationController.js'
import { analyzeSymptoms } from '../controllers/symptomController.js'
import { generateRoutine, getRoutine, updateProgress, resetProgress } from '../controllers/dinacharyaController.js'
import { signup, login, getMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { linkQuizToUser, linkDinacharyaToUser } from '../controllers/linkResultController.js'
import { generateRecipes, saveRecipe, unsaveRecipe, getSavedRecipes } from '../controllers/recipeController.js'
import { checkFoodCompatibility } from '../controllers/foodCompatibilityController.js'
import { generateSeasonalGuide, saveSeasonalPlan, getSavedPlans, deleteSavedPlan } from '../controllers/seasonalGuideController.js'
import { getDashboard } from '../controllers/dashboardController.js'
import { updateProfile } from '../controllers/authController.js'

const router = Router()

// ── Health ───────────────────────────────────────────────────
router.get('/', (_req, res) => res.json({ message: 'AyurHealthAI API v1' }))

// ── Auth ─────────────────────────────────────────────────────
router.post('/auth/signup',     signup)
router.post('/auth/login',      login)
router.get('/auth/me',          requireAuth, getMe)
router.patch('/auth/profile',   requireAuth, updateProfile)

// ── User Dashboard ────────────────────────────────────────────
router.get('/dashboard',        requireAuth, getDashboard)

// ── Consultation ─────────────────────────────────────────────
router.post('/consultation',  createConsultation)
router.get('/consultation',   listConsultations)   // admin / debug

// ── Remedies ─────────────────────────────────────────────────
router.get('/remedies',      getRemedies)
router.get('/remedies/:id',  getRemedyById)

// ── Dosha Quiz ───────────────────────────────────────────────
router.post('/quiz/submit',             submitQuiz)
router.get('/quiz/result/:sessionId',   getQuizResult)
router.patch('/quiz/link/:sessionId',   requireAuth, linkQuizToUser)

// ── Recommendations (Claude AI) ──────────────────────────────
router.post('/recommendations', getRecommendations)

// ── Symptom Checker (Claude AI) ──────────────────────────────
router.post('/symptoms/analyze', analyzeSymptoms)

// ── Dinacharya Planner (Claude AI) ───────────────────────────
router.post('/dinacharya/generate',              generateRoutine)
router.get('/dinacharya/:sessionId',             getRoutine)
router.patch('/dinacharya/:sessionId/progress',  updateProgress)
router.patch('/dinacharya/:sessionId/reset',     resetProgress)
router.patch('/dinacharya/:sessionId/link',      requireAuth, linkDinacharyaToUser)

// ── Seasonal Guide (Claude AI) — Protected ───────────────────
router.post('/seasonal-guide/generate',      requireAuth, generateSeasonalGuide)
router.post('/seasonal-guide/save',          requireAuth, saveSeasonalPlan)
router.get('/seasonal-guide/saved',          requireAuth, getSavedPlans)
router.delete('/seasonal-guide/saved/:id',   requireAuth, deleteSavedPlan)

// ── Food Compatibility (Claude AI) — Protected ───────────────
router.post('/food-compatibility', requireAuth, checkFoodCompatibility)

// ── Recipe Finder (Claude AI) — Protected ────────────────────
router.post('/recipes/generate',    requireAuth, generateRecipes)
router.get('/recipes/saved',        requireAuth, getSavedRecipes)
router.post('/recipes/save',        requireAuth, saveRecipe)
router.delete('/recipes/save/:id',  requireAuth, unsaveRecipe)

export default router
