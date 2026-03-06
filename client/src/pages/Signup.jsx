import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import logo from '../../logo.png'
import { useAuth } from '../context/AuthContext'


// ─── Step config ──────────────────────────────────────────────
const TOTAL_STEPS = 2

const DOSHA_OPTIONS = [
  { value: 'Unknown',  label: 'I don\'t know yet', icon: '🤔' },
  { value: 'Vata',     label: 'Vata',  icon: '💨', desc: 'Air & Space — creative, energetic' },
  { value: 'Pitta',    label: 'Pitta', icon: '🔥', desc: 'Fire & Water — focused, driven' },
  { value: 'Kapha',    label: 'Kapha', icon: '🌊', desc: 'Earth & Water — calm, steady' },
]

const BODY_FRAME_OPTIONS = [
  { value: 'Small',  icon: '🌱', desc: 'Thin build, light bones, lean' },
  { value: 'Medium', icon: '🌿', desc: 'Moderate build, balanced physique' },
  { value: 'Large',  icon: '🌳', desc: 'Broad build, heavier bone structure' },
]

// ─── Main Component ───────────────────────────────────────────
export default function Signup() {
  const navigate           = useNavigate()
  const [searchParams]     = useSearchParams()
  const redirectTo         = searchParams.get('redirect') || '/'
  const { authLogin }      = useAuth()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    // Step 1
    name: '', email: '', password: '', dateOfBirth: '', gender: '',
    // Step 2
    height: '', weight: '', bodyFrame: 'Medium',
    healthConditions: '', existingDosha: 'Unknown',
  })

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // ── Validation ───────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.name.trim())            return 'Please enter your full name.'
    if (!form.email.trim())           return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.'
    if (!form.password)               return 'Please create a password.'
    if (form.password.length < 6)     return 'Password must be at least 6 characters.'
    if (!form.gender)                 return 'Please select your gender.'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/signup', {
        name:             form.name.trim(),
        email:            form.email.trim(),
        password:         form.password,
        dateOfBirth:      form.dateOfBirth || undefined,
        gender:           form.gender,
        height:           form.height ? Number(form.height) : undefined,
        weight:           form.weight ? Number(form.weight) : undefined,
        bodyFrame:        form.bodyFrame,
        healthConditions: form.healthConditions,
        existingDosha:    form.existingDosha,
      })
      // authLogin returns true if it navigated (pending result) — skip success screen
      const navigated = await authLogin(data.token, data.user, true)
      if (!navigated) setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ───────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">🌿</div>
          <h2 className="text-2xl font-bold text-ayur-bark mb-2">Welcome to AyurHealthAI!</h2>
          <p className="text-gray-500 mb-2">Your account has been created successfully.</p>
          <p className="text-sm text-ayur-leaf font-medium mb-8">
            Hello, <span className="font-bold">{form.name}</span>! Your Ayurvedic wellness journey begins now.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-primary py-3 text-base mb-3"
          >
            📊 Go to My Dashboard
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="w-full py-3 border border-ayur-leaf/40 rounded-xl text-ayur-leaf hover:bg-green-50 transition-colors text-sm font-medium mb-3"
          >
            ✨ Take Your Dosha Quiz
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-ayur-bark via-[#2d5016] to-[#1a3a0a] flex-col justify-between p-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🌿</div>
          <div className="absolute top-1/3 left-5 text-7xl">🍃</div>
          <div className="absolute bottom-20 right-20 text-8xl">✨</div>
          <div className="absolute bottom-10 left-10 text-6xl">🌱</div>
        </div>

        {/* Logo + tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="AyurHealthAI" className="h-14 w-auto" />
            <span className="text-2xl font-extrabold text-white tracking-tight">AyurHealthAI</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Your Personalised<br />
            <span className="text-ayur-gold">Ayurvedic</span><br />
            Wellness Journey
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Ancient wisdom meets modern AI. Get personalised dosha analysis, remedies, and daily routines crafted just for you.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🔍', text: 'Personalised symptom analysis' },
            { icon: '🌿', text: 'AI-powered herbal remedies' },
            { icon: '🌙', text: 'Custom daily routines (Dinacharya)' },
            { icon: '📊', text: 'Dosha-based wellness dashboard' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/80">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">{icon}</span>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-green-50 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <img src={logo} alt="AyurHealthAI" className="h-10 w-auto" />
            <span className="text-xl font-extrabold text-ayur-leaf">AyurHealthAI</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ayur-bark mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm">Step {step} of {TOTAL_STEPS} — {step === 1 ? 'Personal details' : 'Ayurvedic profile'}</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-ayur-leaf to-ayur-gold rounded-full transition-all duration-500"
                  style={{ width: step > i ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun Sharma"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white text-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used for age-based Ayurvedic recommendations</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                  <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.gender === g
                            ? 'border-ayur-leaf bg-green-50 text-ayur-leaf'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {g === 'Male' ? '♂️' : g === 'Female' ? '♀️' : '⚧️'} {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 text-base font-semibold mt-2"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6">

                {/* Height + Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Height (cm) <span className="text-gray-400 font-normal">optional</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 170"
                      value={form.height}
                      onChange={e => set('height', e.target.value)}
                      min="50" max="300"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (kg) <span className="text-gray-400 font-normal">optional</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 65"
                      value={form.weight}
                      onChange={e => set('weight', e.target.value)}
                      min="10" max="500"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                    />
                  </div>
                </div>

                {/* Body Frame */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Body Frame</label>
                  <p className="text-xs text-gray-400 mb-3">Helps determine your natural dosha constitution</p>
                  <div className="space-y-2">
                    {BODY_FRAME_OPTIONS.map(({ value, icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set('bodyFrame', value)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-sm transition-all ${
                          form.bodyFrame === value
                            ? 'border-ayur-leaf bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <div className="text-left">
                          <p className={`font-semibold ${form.bodyFrame === value ? 'text-ayur-leaf' : 'text-gray-700'}`}>{value}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        {form.bodyFrame === value && (
                          <span className="ml-auto text-ayur-leaf text-lg">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Existing Dosha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Do you know your Dosha?</label>
                  <p className="text-xs text-gray-400 mb-3">Select if you've been assessed before — or take our quiz after signing up</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DOSHA_OPTIONS.map(({ value, label, icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set('existingDosha', value)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border-2 text-sm transition-all ${
                          form.existingDosha === value
                            ? 'border-ayur-leaf bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${value === 'Unknown' ? 'col-span-2' : ''}`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className={`font-semibold text-xs ${form.existingDosha === value ? 'text-ayur-leaf' : 'text-gray-700'}`}>{label}</span>
                        {desc && <span className="text-xs text-gray-400 text-center">{desc}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health Conditions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Known Health Conditions <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. Diabetes, Hypertension, Thyroid issues, Allergies..."
                    value={form.healthConditions}
                    onChange={e => set('healthConditions', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Helps us provide safer, more relevant Ayurvedic recommendations</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3.5 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creating account…
                      </>
                    ) : '🌿 Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-ayur-leaf font-semibold hover:underline">
              Log in
            </Link>
          </p>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-4 max-w-sm mx-auto">
            By creating an account you agree to our terms. AyurHealthAI is for wellness purposes only and is not a substitute for medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
