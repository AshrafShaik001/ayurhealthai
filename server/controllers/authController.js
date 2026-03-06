import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET  = process.env.JWT_SECRET || 'ayurhealthai_dev_secret'
const JWT_EXPIRES = '7d'

// ── Helper: build safe user object (no password) ─────────────
function safeUser(user) {
  return {
    id:               user._id,
    name:             user.name,
    email:            user.email,
    gender:           user.gender,
    dateOfBirth:      user.dateOfBirth,
    height:           user.height,
    weight:           user.weight,
    bodyFrame:        user.bodyFrame,
    existingDosha:    user.existingDosha,
    healthConditions: user.healthConditions,
    createdAt:        user.createdAt,
  }
}

// ── Helper: sign token ────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

// ── POST /api/auth/signup ────────────────────────────────────
export async function signup(req, res) {
  try {
    const {
      name, email, password,
      dateOfBirth, gender,
      height, weight, bodyFrame,
      healthConditions, existingDosha,
    } = req.body

    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' })
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      name:             name.trim(),
      email:            email.toLowerCase().trim(),
      password:         hashedPassword,
      dateOfBirth:      dateOfBirth  || null,
      gender:           gender       || 'Other',
      height:           height       ? Number(height) : undefined,
      weight:           weight       ? Number(weight) : undefined,
      bodyFrame:        bodyFrame    || 'Medium',
      healthConditions: healthConditions || '',
      existingDosha:    existingDosha    || 'Unknown',
    })

    const token = signToken(user)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser(user),
    })
  } catch (err) {
    console.error('signup error:', err?.message || err)
    return res.status(500).json({ error: 'Signup failed. Please try again.' })
  }
}

// ── POST /api/auth/login ─────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' })
    }

    const token = signToken(user)

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser(user),
    })
  } catch (err) {
    console.error('login error:', err?.message || err)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
}

// ── GET /api/auth/me  (protected) ────────────────────────────
export async function getMe(req, res) {
  try {
    // req.userId is set by the auth middleware
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    return res.json({ success: true, user: safeUser(user) })
  } catch (err) {
    console.error('getMe error:', err?.message || err)
    return res.status(500).json({ error: 'Could not fetch profile.' })
  }
}

// ── PATCH /api/auth/profile  (protected) ─────────────────────
export async function updateProfile(req, res) {
  try {
    const allowed = ['name', 'height', 'weight', 'bodyFrame', 'gender', 'healthConditions', 'existingDosha', 'dateOfBirth']
    const updates = {}
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }
    if (updates.height) updates.height = Number(updates.height)
    if (updates.weight) updates.weight = Number(updates.weight)

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) return res.status(404).json({ error: 'User not found.' })
    return res.json({ success: true, user: safeUser(user) })
  } catch (err) {
    console.error('updateProfile error:', err?.message || err)
    return res.status(500).json({ error: 'Could not update profile.' })
  }
}
