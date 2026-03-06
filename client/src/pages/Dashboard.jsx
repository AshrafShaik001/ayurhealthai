import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────────
const DOSHA_COLORS = {
  Vata:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400',   grad: 'from-blue-500 to-indigo-400'   },
  Pitta:   { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400', grad: 'from-orange-500 to-amber-400'   },
  Kapha:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  grad: 'from-green-600 to-emerald-400'  },
  Unknown: { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400',   grad: 'from-gray-500 to-gray-400'      },
}

const SEASON_EMOJI = { Vasanta:'🌸', Grishma:'☀️', Varsha:'🌧️', Sharad:'🍂', Hemanta:'🌿', Shishira:'❄️' }
const SEASON_GRAD  = {
  Vasanta:'from-pink-500 to-rose-400', Grishma:'from-orange-500 to-amber-400',
  Varsha:'from-blue-600 to-indigo-500', Sharad:'from-orange-600 to-yellow-500',
  Hemanta:'from-green-700 to-emerald-600', Shishira:'from-slate-600 to-blue-500',
}

const QUICK_LINKS = [
  { to:'/quiz',              icon:'🧬', label:'Dosha Quiz',       locked:false },
  { to:'/symptoms',          icon:'🔍', label:'Symptom Checker',  locked:false },
  { to:'/dinacharya',        icon:'🌞', label:'Daily Routine',    locked:false },
  { to:'/recipe-finder',     icon:'🍲', label:'Recipe Finder',    locked:true  },
  { to:'/food-compatibility',icon:'🥗', label:'Food Compatibility',locked:true  },
  { to:'/seasonal-guide',    icon:'🍂', label:'Seasonal Guide',   locked:true  },
]

// ── Helpers ───────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}
function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}
function age(dob) {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

// ── Edit Profile Modal ────────────────────────────────────────
function EditProfileModal({ user, onClose, onSaved }) {
  const { updateUser } = useAuth()
  const [form,    setForm]    = useState({
    name:             user?.name             || '',
    gender:           user?.gender           || 'Other',
    height:           user?.height           || '',
    weight:           user?.weight           || '',
    bodyFrame:        user?.bodyFrame        || 'Medium',
    existingDosha:    user?.existingDosha    || 'Unknown',
    healthConditions: user?.healthConditions || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const { data } = await api.patch('/api/auth/profile', form)
      if (data.success) {
        updateUser(data.user)
        onSaved(data.user)
        onClose()
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-lg font-bold text-ayur-bark">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your wellness details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf transition-all"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Gender</label>
            <div className="flex gap-2">
              {['Male','Female','Other'].map(g => (
                <button
                  key={g}
                  onClick={() => set('gender', g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.gender === g ? 'bg-ayur-leaf text-white border-ayur-leaf' : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Height + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="e.g. 170"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Weight (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder="e.g. 65"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf transition-all"
              />
            </div>
          </div>

          {/* Body Frame */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Body Frame</label>
            <div className="flex gap-2">
              {['Small','Medium','Large'].map(f => (
                <button
                  key={f}
                  onClick={() => set('bodyFrame', f)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.bodyFrame === f ? 'bg-ayur-leaf text-white border-ayur-leaf' : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Dosha */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Your Dosha
              <span className="ml-1 normal-case font-normal text-gray-400">(re-take quiz to update automatically)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Vata','Pitta','Kapha','Unknown'].map(d => (
                <button
                  key={d}
                  onClick={() => set('existingDosha', d)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.existingDosha === d ? 'bg-ayur-leaf text-white border-ayur-leaf' : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Health Conditions <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={form.healthConditions}
              onChange={e => set('healthConditions', e.target.value)}
              rows={3}
              placeholder="e.g. Diabetes, Hypertension, Joint pain…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ayur-leaf/30 focus:border-ayur-leaf transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all ${saving ? 'opacity-60' : 'hover:opacity-90 active:scale-[0.98]'}`}
              style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
            >
              {saving ? '⏳ Saving…' : '✅ Save Changes'}
            </button>
          </div>

          {/* Re-take quiz CTA */}
          <Link
            to="/quiz"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-ayur-leaf border-2 border-ayur-leaf/30 hover:border-ayur-leaf hover:bg-green-50 transition-all"
          >
            ✨ Re-take Dosha Quiz to update your constitution
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, value, label, color = 'text-ayur-leaf' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 font-medium">{label}</div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, icon, action, children, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-bold text-ayur-bark uppercase tracking-wide">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">
        {empty ?? children}
      </div>
    </div>
  )
}

// ── Dosha Score Bar ───────────────────────────────────────────
function DoshaBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={color}>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-','bg-')}`} style={{ width: `${pct}%`, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────
function Empty({ emoji, text, to, cta }) {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-sm text-gray-400 mb-3">{text}</p>
      {to && <Link to={to} className="btn-primary text-xs px-4 py-2">{cta}</Link>}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-gray-100 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Page ───────────────────────────────────────
export default function Dashboard() {
  const { user: authUser, updateUser } = useAuth()
  const navigate = useNavigate()

  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [editOpen,   setEditOpen]   = useState(false)

  // ── Fetch dashboard data ──────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: res } = await api.get('/api/dashboard')
        if (res.success) setData(res.data)
      } catch (err) {
        setError(err?.response?.data?.error || 'Could not load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleProfileSaved(updatedUser) {
    setData(prev => prev ? { ...prev, user: updatedUser } : prev)
  }

  if (loading) return <PageSkeleton />
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm px-5 py-2.5">Try Again</button>
      </div>
    </div>
  )

  const { user, quizResult, savedRecipes, recentChecks, seasonalPlans, stats } = data
  const dosha      = user?.existingDosha || 'Unknown'
  const dc         = DOSHA_COLORS[dosha] || DOSHA_COLORS.Unknown
  const memberSince = fmt(user?.createdAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-r from-ayur-leaf to-primary-800 text-white px-4 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dc.grad} flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0`}>
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-green-100 text-sm mb-0.5">Welcome back,</p>
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  🧬 {dosha} dosha
                </span>
                <span className="bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon="❤️" value={stats.recipesCount}  label="Saved Recipes"    color="text-red-500" />
          <StatCard icon="🥗" value={stats.checksCount}   label="Food Checks"      color="text-amber-600" />
          <StatCard icon="🍂" value={stats.plansCount}    label="Seasonal Plans"   color="text-ayur-leaf" />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════════════════════ LEFT COLUMN ════════════════════ */}
          <div className="space-y-6">
            {/* 1. Profile card */}
            <div className={`bg-white rounded-2xl border ${dc.border} shadow-sm overflow-hidden`}>
              <div className={`bg-gradient-to-r ${dc.grad} px-5 py-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-black">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight">{user?.name}</p>
                    <p className="text-white/70 text-xs">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { label: 'Dosha',       value: dosha,              icon: '🧬' },
                  { label: 'Gender',      value: user?.gender,       icon: '👤' },
                  { label: 'Height',      value: user?.height ? `${user.height} cm` : '—', icon: '📏' },
                  { label: 'Weight',      value: user?.weight ? `${user.weight} kg` : '—', icon: '⚖️' },
                  { label: 'Body Frame',  value: user?.bodyFrame,    icon: '🫀' },
                  { label: 'Age',         value: age(user?.dateOfBirth) ? `${age(user.dateOfBirth)} yrs` : '—', icon: '🎂' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5"><span>{icon}</span>{label}</span>
                    <span className="text-xs font-semibold text-ayur-bark">{value || '—'}</span>
                  </div>
                ))}
                {user?.healthConditions && (
                  <div className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-100 mt-1">
                    <p className="text-xs font-bold text-amber-700 mb-0.5">⚕️ Health Conditions</p>
                    <p className="text-xs text-gray-600">{user.healthConditions}</p>
                  </div>
                )}
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-full mt-1 py-2 rounded-xl text-xs font-bold text-ayur-leaf border-2 border-ayur-leaf/30 hover:border-ayur-leaf hover:bg-green-50 transition-all"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>

            {/* 2. Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">⚡ Quick Access</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ to, icon, label, locked }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-ayur-leaf hover:bg-green-50 transition-all group text-center"
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-ayur-leaf leading-tight">{label}</span>
                    {locked && <span className="text-[9px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.5 rounded-full">Members</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════ RIGHT COLUMN ════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3. Dosha Quiz Result */}
            <Section
              title="Your Dosha Profile"
              icon="🧬"
              action={
                <Link to="/quiz" className="text-xs font-bold text-ayur-leaf hover:underline">
                  Re-take Quiz →
                </Link>
              }
            >
              {!quizResult ? (
                <Empty emoji="🧬" text="No quiz result yet. Discover your Ayurvedic constitution." to="/quiz" cta="✨ Take Dosha Quiz" />
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className={`px-4 py-2 rounded-xl font-black text-lg ${dc.bg} ${dc.text} border ${dc.border}`}>
                      {quizResult.dominantDosha}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Dominant dosha</p>
                      <p className="text-xs text-gray-500">Taken on {fmt(quizResult.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <DoshaBar label="Vata"  pct={Math.round(quizResult.percentages?.vata  || 0)} color="text-blue-500"   />
                    <DoshaBar label="Pitta" pct={Math.round(quizResult.percentages?.pitta || 0)} color="text-orange-500" />
                    <DoshaBar label="Kapha" pct={Math.round(quizResult.percentages?.kapha || 0)} color="text-green-500"  />
                  </div>
                  {quizResult.recommendation?.summary && (
                    <p className="mt-4 text-xs text-gray-500 leading-relaxed bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                      💚 {quizResult.recommendation.summary}
                    </p>
                  )}
                  <Link
                    to={`/quiz/result/${quizResult.sessionId}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ayur-leaf hover:underline"
                  >
                    View full result →
                  </Link>
                </div>
              )}
            </Section>

            {/* 4. Saved Recipes */}
            <Section
              title="Saved Recipes"
              icon="❤️"
              action={
                <Link to="/recipe-finder" className="text-xs font-bold text-ayur-leaf hover:underline">
                  Find Recipes →
                </Link>
              }
            >
              {!savedRecipes?.length ? (
                <Empty emoji="🍲" text="No saved recipes yet. Find healing meals for your dosha." to="/recipe-finder" cta="🍲 Find Recipes" />
              ) : (
                <div className="space-y-3">
                  {savedRecipes.map((recipe, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-gray-100">
                      <span className="text-2xl flex-shrink-0 mt-0.5">🥘</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ayur-bark truncate">{recipe.name}</p>
                        {recipe.health_benefits && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{recipe.health_benefits}</p>
                        )}
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {recipe.balances_dosha?.map(d => (
                            <span key={d} className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">✅ {d}</span>
                          ))}
                          {recipe.best_season && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">
                              {SEASON_EMOJI[recipe.best_season] || '🌿'} {recipe.best_season}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{fmt(recipe.createdAt)}</p>
                    </div>
                  ))}
                  {stats.recipesCount > 3 && (
                    <Link to="/recipe-finder" className="block text-center text-xs font-semibold text-ayur-leaf hover:underline pt-1">
                      View all {stats.recipesCount} saved recipes →
                    </Link>
                  )}
                </div>
              )}
            </Section>

            {/* 5. Recent Food Compatibility Checks */}
            <Section
              title="Food Compatibility History"
              icon="🥗"
              action={
                <Link to="/food-compatibility" className="text-xs font-bold text-ayur-leaf hover:underline">
                  New Check →
                </Link>
              }
            >
              {!recentChecks?.length ? (
                <Empty emoji="🥗" text="No compatibility checks yet. See how your foods interact." to="/food-compatibility" cta="🥗 Check Foods" />
              ) : (
                <div className="space-y-2.5">
                  {recentChecks.map((check, i) => {
                    const scoreColor = check.overall_score >= 70 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : check.overall_score >= 40 ? 'text-amber-600 bg-amber-50 border-amber-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                    return (
                      <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-gray-100">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${scoreColor}`}>
                          <span className="text-base font-black leading-none">{check.overall_score}</span>
                          <span className="text-[9px] font-bold opacity-70">score</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ayur-bark truncate">
                            {check.foods?.join(', ')}
                          </p>
                          <div className="flex gap-2 mt-1 text-[10px] font-semibold">
                            <span className="text-emerald-600">✅ {check.summary?.good ?? 0} good</span>
                            <span className="text-red-500">❌ {check.summary?.bad ?? 0} bad</span>
                            <span className="text-amber-600">⚠️ {check.summary?.neutral ?? 0} neutral</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 flex-shrink-0">{fmt(check.createdAt)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* 6. Seasonal Guide summary */}
            <Section
              title="My Seasonal Plans"
              icon="🍂"
              action={
                <Link to="/seasonal-guide" className="text-xs font-bold text-ayur-leaf hover:underline">
                  View Guide →
                </Link>
              }
            >
              {!seasonalPlans?.length ? (
                <Empty emoji="🌿" text="No seasonal plans saved. Get your Ritucharya guide for the current season." to="/seasonal-guide" cta="🍂 Get Seasonal Guide" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seasonalPlans.slice(0, 4).map((plan, i) => {
                    const grad = SEASON_GRAD[plan.season] || 'from-green-600 to-emerald-500'
                    const emoji = SEASON_EMOJI[plan.season] || '🌿'
                    return (
                      <div key={i} className={`bg-gradient-to-r ${grad} rounded-xl p-4 text-white`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{emoji}</span>
                          <div>
                            <p className="font-bold text-sm leading-tight">{plan.guide?.ayurvedic_name || plan.season}</p>
                            <p className="text-white/70 text-xs">{plan.dosha} Dosha</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs text-white/80">
                          <span>🥦 {plan.guide?.foods_to_eat?.length ?? 0} foods</span>
                          <span>🌱 {plan.guide?.herbs?.length ?? 0} herbs</span>
                        </div>
                        <p className="text-[10px] text-white/60 mt-1">Updated {fmt(plan.updatedAt)}</p>
                      </div>
                    )
                  })}
                  {seasonalPlans.length > 4 && (
                    <Link to="/seasonal-guide" className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-ayur-leaf hover:text-ayur-leaf transition-all p-4">
                      +{seasonalPlans.length - 4} more →
                    </Link>
                  )}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <EditProfileModal
          user={data?.user || authUser}
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  )
}
