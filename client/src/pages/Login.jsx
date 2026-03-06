import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import logo from '../../logo.png'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate               = useNavigate()
  const [searchParams]         = useSearchParams()
  const redirectTo             = searchParams.get('redirect') || '/dashboard'
  const { authLogin }          = useAuth()
  const [form, setForm]        = useState({ email: '', password: '', rememberMe: false })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const set = (field, value) => { setForm(p => ({ ...p, [field]: value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return setError('Please enter your email address.')
    if (!form.password)     return setError('Please enter your password.')

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        email:    form.email.trim(),
        password: form.password,
      })
      // authLogin returns true if it navigated (pending result); otherwise we navigate here
      const navigated = await authLogin(data.token, data.user, form.rememberMe)
      if (!navigated) navigate(redirectTo)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-ayur-bark via-[#2d5016] to-[#1a3a0a] flex-col justify-between p-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-10 right-10 text-9xl">🌿</div>
          <div className="absolute top-1/3 left-5 text-7xl">🍃</div>
          <div className="absolute bottom-20 right-20 text-8xl">✨</div>
          <div className="absolute bottom-10 left-10 text-6xl">🌱</div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="AyurHealthAI" className="h-14 w-auto" />
            <span className="text-2xl font-extrabold text-white tracking-tight">AyurHealthAI</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Welcome<br />
            <span className="text-ayur-gold">Back</span> to Your<br />
            Wellness Journey
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Continue where you left off. Your personalised Ayurvedic profile, dosha analysis, and wellness routines are waiting for you.
          </p>
        </div>

        {/* Wellness tips */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🌅', text: 'Start your day with your Dinacharya routine' },
            { icon: '🌿', text: 'Check today\'s herbal remedies for balance' },
            { icon: '📊', text: 'Track your dosha wellness dashboard' },
            { icon: '🔍', text: 'Analyse new symptoms with AI guidance' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/70">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">{icon}</span>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <img src={logo} alt="AyurHealthAI" className="h-10 w-auto" />
            <span className="text-xl font-extrabold text-ayur-leaf">AyurHealthAI</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ayur-bark mb-1">Sign in to your account</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Google placeholder */}
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-400 cursor-not-allowed mb-5 relative"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf bg-white"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-ayur-leaf hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
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

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => set('rememberMe', !form.rememberMe)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  form.rememberMe
                    ? 'bg-ayur-leaf border-ayur-leaf'
                    : 'bg-white border-gray-300 hover:border-ayur-leaf'
                }`}
              >
                {form.rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-600 select-none cursor-pointer" onClick={() => set('rememberMe', !form.rememberMe)}>
                Remember me for 7 days
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-semibold rounded-xl text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: loading ? '#5a8a3c' : 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : '🌿 Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-7">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ayur-leaf font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-4 max-w-sm mx-auto">
            AyurHealthAI is for wellness purposes only and is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
