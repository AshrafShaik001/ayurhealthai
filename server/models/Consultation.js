import mongoose from 'mongoose'

const consultationSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },
    age:     { type: Number },
    concern: { type: String, required: true },
    dosha:   { type: String, default: 'Not sure' },
    aiResponse: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Consultation', consultationSchema)
