import mongoose from 'mongoose'

const seasonalPlanSchema = new mongoose.Schema(
  {
    // ── Ownership ────────────────────────────────────────────
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // ── Parameters ───────────────────────────────────────────
    season: { type: String, required: true }, // Vasanta, Grishma, Varsha, Sharad, Hemanta, Shishira
    dosha:  { type: String, required: true }, // Vata, Pitta, Kapha

    // ── AI-generated guide (full JSON stored as-is) ──────────
    guide: {
      season_name:     { type: String },
      ayurvedic_name:  { type: String },
      foods_to_eat:    [{ name: String, benefit: String, emoji: String }],
      foods_to_avoid:  [{ name: String, reason: String, emoji: String }],
      herbs:           [{ name: String, preparation: String, benefit: String, frequency: String }],
      daily_routine:   [{ time: String, activity: String, description: String, duration: String }],
      special_advice:  { type: String },
    },
  },
  { timestamps: true }
)

// One plan per user per season (upsert keeps latest)
seasonalPlanSchema.index({ userId: 1, season: 1 }, { unique: true })

export default mongoose.model('SeasonalPlan', seasonalPlanSchema)
