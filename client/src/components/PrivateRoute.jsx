import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Spinner shown while token is being verified ───────────────
function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-ayur-leaf/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🌿</div>
      </div>
      <p className="text-sm text-gray-500 font-medium">Checking your session…</p>
    </div>
  )
}

// ── PrivateRoute ──────────────────────────────────────────────
// Renders children if authenticated.
// Otherwise redirects to /login with ?redirect + ?message params.
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoading />

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return (
      <Navigate
        to={`/login?redirect=${redirect}&message=Please+login+to+access+this+feature`}
        replace
      />
    )
  }

  return children
}
