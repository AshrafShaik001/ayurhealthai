import mongoose from 'mongoose'

export default async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('⚠️  MONGO_URI not set — skipping DB connection.')
    return
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`)
    console.warn('⚠️  Running without MongoDB — AI features will work but results won\'t be saved.')
  }
}
