import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { consumePendingResult } from '../components/SaveResultsBanner'

const AuthContext = createContext(null)

// ── Helper: find token in either storage ─────────────────────
function getStoredToken() {
  return localStorage.getItem('ayur_token') || sessionStorage.getItem('ayur_token') || null
}
function getStoredUser() {
  try {
    const raw = localStorage.getItem('ayur_user') || sessionStorage.getItem('ayur_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ── Save pending result to user's profile ────────────────────
async function savePendingResult(pending, token) {
  if (!pending || !token) return
  const headers = { Authorization: `Bearer ${token}` }
  try {
    if (pending.type === 'quiz' && pending.sessionId) {
      await api.patch(`/api/quiz/link/${pending.sessionId}`, {}, { headers })
    } else if (pending.type === 'dinacharya' && pending.sessionId) {
      await api.patch(`/api/dinacharya/${pending.sessionId}/link`, {}, { headers })
    }
    // symptoms type has no sessionId — just redirect, no server call needed
  } catch (err) {
    console.warn('Could not save pending result:', err?.message)
  }
}

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(getStoredUser)
  const [token,   setToken]   = useState(getStoredToken)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isAuthenticated = Boolean(token && user)

  // ── On mount: verify token with /me ──────────────────────
  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setUser(data.user))
      .catch(() => clearAuth())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login: store token, save pending result, redirect ────
  // Returns true if it handled navigation (pending result), false if caller should navigate.
  const authLogin = useCallback(async (newToken, newUser, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('ayur_token', newToken)
    storage.setItem('ayur_user',  JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)

    // Check for a pending result saved before auth
    const pending = consumePendingResult()
    if (pending) {
      await savePendingResult(pending, newToken)
      navigate(pending.redirectTo || '/')
      return true   // navigation handled — caller must NOT navigate again
    }

    return false    // no pending result — caller is responsible for navigating
  }, [navigate])

  // ── Update user in state + storage after profile edit ────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    if (localStorage.getItem('ayur_token')) {
      localStorage.setItem('ayur_user', JSON.stringify(updatedUser))
    } else {
      sessionStorage.setItem('ayur_user', JSON.stringify(updatedUser))
    }
  }, [])

  // ── Logout: clear everything ─────────────────────────────
  const logout = useCallback(() => {
    clearAuth()
  }, [])

  function clearAuth() {
    localStorage.removeItem('ayur_token')
    localStorage.removeItem('ayur_user')
    sessionStorage.removeItem('ayur_token')
    sessionStorage.removeItem('ayur_user')
    setToken(null)
    setUser(null)
  }

  // ── Attach token to every api request automatically ──────
  // Reads from storage on each request so the header is always current,
  // even if the interceptor re-registers slightly after a fresh login navigation.
  useEffect(() => {
    const interceptor = api.interceptors.request.use(config => {
      const t = getStoredToken()
      if (t) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${t}`
      }
      return config
    })
    return () => api.interceptors.request.eject(interceptor)
  }, []) // register once — getStoredToken() always reads the latest value

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, authLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
