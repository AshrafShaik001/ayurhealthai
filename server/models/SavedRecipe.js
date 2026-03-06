import mongoose from 'mongoose'

const savedRecipeSchema = new mongoose.Schema(
  {
    // ── Ownership ────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Recipe Content ───────────────────────────────────────
    name:             { type: String, required: true, trim: true },
    ingredients:      { type: [String], default: [] },
    steps:            { type: [String], default: [] },
    balances_dosha:   { type: [String], default: [] },
    aggravates_dosha: { type: [String], default: [] },
    best_season:      { type: String, default: '' },
    health_benefits:  { type: String, default: '' },

    // ── Filters used when the recipe was generated ───────────
    filters: {
      dosha:    { type: String },
      season:   { type: String },
      goal:     { type: String },
      mealType: { type: String },
    },
  },
  { timestamps: true }
)

// Prevent exact duplicate saves per user
savedRecipeSchema.index({ userId: 1, name: 1 }, { unique: true })

export default mongoose.model('SavedRecipe', savedRecipeSchema)
