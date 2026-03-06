import User                  from '../models/User.js'
import QuizResult             from '../models/QuizResult.js'
import SavedRecipe            from '../models/SavedRecipe.js'
import FoodCompatibilityCheck from '../models/FoodCompatibilityCheck.js'
import SeasonalPlan           from '../models/SeasonalPlan.js'

// ── GET /api/dashboard ────────────────────────────────────────
export async function getDashboard(req, res) {
  try {
    const uid = req.userId

    // ── Run all queries in parallel ────────────────────────
    const [
      user,
      quizResult,
      savedRecipes,
      savedRecipesCount,
      recentChecks,
      checksCount,
      seasonalPlans,
    ] = await Promise.all([
      User.findById(uid).select('-password'),

      // Latest quiz result linked to user
      QuizResult.findOne({ userId: uid }).sort({ createdAt: -1 }),

      // 3 most recently saved recipes
      SavedRecipe.find({ userId: uid }).sort({ createdAt: -1 }).limit(3),

      // Total saved recipe count
      SavedRecipe.countDocuments({ userId: uid }),

      // 5 most recent food compat checks
      FoodCompatibilityCheck.find({ userId: uid }).sort({ createdAt: -1 }).limit(5),

      // Total compat checks count
      FoodCompatibilityCheck.countDocuments({ userId: uid }),

      // All seasonal plans (sorted by most recent)
      SeasonalPlan.find({ userId: uid }).sort({ updatedAt: -1 }),
    ])

    if (!user) return res.status(404).json({ error: 'User not found.' })

    res.json({
      success: true,
      data: {
        user: {
          id:               user._id,
          name:             user.name,
          email:            user.email,
          gender:           user.gender,
          dateOfBirth:      user.dateOfBirth,
          height:           user.height,
          weight:           user.weight,
          bodyFrame:        user.bodyFrame,
          existingDosha:    user.existingDosha,
          healthConditions: user.healthConditions,
          createdAt:        user.createdAt,
        },
        quizResult,
        savedRecipes,
        recentChecks,
        seasonalPlans,
        stats: {
          recipesCount: savedRecipesCount,
          checksCount,
          plansCount:   seasonalPlans.length,
        },
      },
    })
  } catch (err) {
    console.error('getDashboard error:', err?.message || err)
    return res.status(500).json({ error: 'Could not load dashboard data.' })
  }
}
