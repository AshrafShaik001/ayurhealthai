import mongoose from 'mongoose'

const remedySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    emoji:       { type: String, default: '🌿' },
    dosha:       { type: String, required: true },
    description: { type: String, required: true },
    benefits:    [{ type: String }],
    usage:       { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Remedy', remedySchema)
