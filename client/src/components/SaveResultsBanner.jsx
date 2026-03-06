import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Pending result key used across the app ───────────────────
export const PENDING_KEY = 'ayur_pending_result'

// ── Save a pending result to sessionStorage ──────────────────
export function storePendingResult({ type, sessionId, redirectTo }) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ type, sessionId, redirectTo }))
}

// ── Read and clear pending result ────────────────────────────
export function consumePendingResult() {
  const raw = sessionStorage.getItem(PENDING_KEY)
  if (!raw) return null
  sessionStorage.removeItem(PENDING_KEY)
  try { return JSON.parse(raw) } catch { return null }
}

// ── Banner Component ─────────────────────────────────────────
// type       : 'quiz' | 'symptoms' | 'dinacharya'
// sessionId  : string (quiz / dinacharya sessionId)
// redirectTo : string (path to return to after auth)
export default function SaveResultsBanner({ type, sessionId, redirectTo }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Don't show if already logged in
  if (isAuthenticated) return null

  const icons = {
    quiz:       '✨',
    symptoms:   '🔍',
    dinacharya: '🌙',
  }
  const labels = {
    quiz:       'your Dosha profile',
    symptoms:   'your symptom analysis',
    dinacharya: 'your daily routine',
  }

  const goToAuth = (path) => {
    storePendingResult({ type, sessionId, redirectTo })
    navigate(`${path}?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-amber-50 p-6 shadow-sm">
      {/* Background leaf decoration */}
      <div className="absolute -right-4 -top-4 text-8xl opacity-5 select-none pointer-events-none">🌿</div>
      <div className="absolute -left-2 -bottom-4 text-7xl opacity-5 select-none pointer-events-none">🍃</div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-ayur-leaf to-ayur-bark flex items-center justify-center text-2xl shadow-md">
          🌿
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="font-bold text-ayur-bark text-base mb-1 flex items-center gap-2">
            {icons[type]} Save Your Results
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Create a free account to save {labels[type]}, track your health journey over time, and get personalised recommendations.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => goToAuth('/signup')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
          >
            Create Free Account
          </button>
          <button
            onClick={() => goToAuth('/login')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-ayur-leaf border-2 border-ayur-leaf hover:bg-green-50 transition-colors active:scale-95"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}
