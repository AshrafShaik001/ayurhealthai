import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    // ── Basic Auth ──────────────────────────────────────────
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // ── Personal Info ───────────────────────────────────────
    dateOfBirth: { type: Date },
    gender:      { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },

    // ── Physical Profile ────────────────────────────────────
    height:    { type: Number, min: 50, max: 300 },   // cm
    weight:    { type: Number, min: 10, max: 500 },   // kg
    bodyFrame: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },

    // ── Ayurvedic Profile ───────────────────────────────────
    existingDosha:    { type: String, enum: ['Vata', 'Pitta', 'Kapha', 'Unknown'], default: 'Unknown' },
    healthConditions: { type: String, trim: true, default: '' },

    // ── Legacy ─────────────────────────────────────────────
    dosha: { type: String, enum: ['Vata', 'Pitta', 'Kapha', 'Not sure', ''], default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
