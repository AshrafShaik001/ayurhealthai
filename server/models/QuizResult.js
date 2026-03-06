import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  questionId:     { type: Number, required: true },
  questionText:   { type: String },
  selectedOption: { type: String },
  dosha:          { type: String, enum: ['vata', 'pitta', 'kapha'] },
}, { _id: false })

const herbSchema = new mongoose.Schema({
  name:    { type: String },
  benefit: { type: String },
}, { _id: false })

const recommendationSchema = new mongoose.Schema({
  summary: { type: String },
  diet: {
    favor: [String],
    avoid: [String],
    tips:  [String],
  },
  lifestyle: {
    dailyRoutine: [String],
    exercise:     { type: String },
    sleep:        { type: String },
  },
  herbs: [herbSchema],
  yoga:  [String],
}, { _id: false })

const quizResultSchema = new mongoose.Schema(
  {
    sessionId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    answers: [answerSchema],
    scores: {
      vata:  { type: Number, default: 0 },
      pitta: { type: Number, default: 0 },
      kapha: { type: Number, default: 0 },
    },
    percentages: {
      vata:  { type: Number, default: 0 },
      pitta: { type: Number, default: 0 },
      kapha: { type: Number, default: 0 },
    },
    dominantDosha:  { type: String, required: true },
    recommendation: recommendationSchema,
  },
  { timestamps: true }
)

export default mongoose.model('QuizResult', quizResultSchema)
