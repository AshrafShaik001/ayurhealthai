import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age:   { type: Number, min: 1, max: 120 },
    dosha: { type: String, enum: ['Vata', 'Pitta', 'Kapha', 'Not sure', ''], default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
