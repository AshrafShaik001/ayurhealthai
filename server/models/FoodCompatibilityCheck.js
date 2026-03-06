import mongoose from 'mongoose'

const foodCompatibilityCheckSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    foods:         { type: [String], default: [] },
    dosha:         { type: String },
    compatible:    { type: Boolean },
    overall_score: { type: Number, min: 0, max: 100 },
    summary: {
      good:    { type: Number, default: 0 },
      bad:     { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
)

export default mongoose.model('FoodCompatibilityCheck', foodCompatibilityCheckSchema)
