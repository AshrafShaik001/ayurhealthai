import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  time:        { type: String, required: true },   // e.g. "6:00 AM"
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['morning', 'midday', 'evening', 'night'], required: true },
  icon:        { type: String, default: '🌿' },
  duration:    { type: String },                   // e.g. "10 minutes"
  completed:   { type: Boolean, default: false },
}, { _id: true })

const dinacharyaRoutineSchema = new mongoose.Schema({
  sessionId:  { type: String, required: true, unique: true, index: true },
  dosha:      { type: String, enum: ['vata', 'pitta', 'kapha'], required: true },
  wakeUpTime: { type: String, required: true },   // "06:00"
  activities: [activitySchema],
  aiSummary:  { type: String },
  doshaNote:  { type: String },
  completionDate: { type: String },               // ISO date string "YYYY-MM-DD"
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('DinacharyaRoutine', dinacharyaRoutineSchema)
