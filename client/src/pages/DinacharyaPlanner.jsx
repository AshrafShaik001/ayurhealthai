import { useState, useEffect, useCallback } from 'react'
import api from '../api'

const DOSHA_CONFIG = {
  vata: {
    name: 'Vata',
    emoji: '💨',
    elements: 'Air & Space',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    check: 'bg-violet-500',
    accent: 'text-violet-600',
    ring: 'ring-violet-300',
    tagline: 'Grounding & Nourishing Daily Rhythm',
  },
  pitta: {
    name: 'Pitta',
    emoji: '🔥',
    elements: 'Fire & Water',
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    check: 'bg-orange-500',
    accent: 'text-orange-600',
    ring: 'ring-orange-300',
    tagline: 'Cooling & Moderating Daily Rhythm',
  },
  kapha: {
    name: 'Kapha',
    emoji: '🌊',
    elements: 'Earth & Water',
    gradient: 'from-teal-500 to-blue-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    check: 'bg-teal-500',
    accent: 'text-teal-600',
    ring: 'ring-teal-300',
    tagline: 'Energizing & Stimulating Daily Rhythm',
  },
}

const CATEGORIES = [
  { id: 'all',     label: 'All',      icon: '📋' },
  { id: 'morning', label: 'Morning',  icon: '🌄' },
  { id: 'midday',  label: 'Midday',   icon: '☀️' },
  { id: 'evening', label: 'Evening',  icon: '🌆' },
  { id: 'night',   label: 'Night',    icon: '🌙' },
]

const CATEGORY_COLORS = {
  morning: { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  midday:  { bg: 'bg-sky-50',    border: 'border-sky-200',   badge: 'bg-sky-100 text-sky-700',     dot: 'bg-sky-400' },
  evening: { bg: 'bg-purple-50', border: 'border-purple-200',badge: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400' },
  night:   { bg: 'bg-indigo-50', border: 'border-indigo-200',badge: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-400' },
}

// ── Stage: Input Form ─────────────────────────────────────────────────────────
function PlannerForm({ onGenerate }) {
  const [dosha, setDosha] = useState('')
  const [wakeUpTime, setWakeUpTime] = useState('06:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!dosha) { setError('Please select your dosha.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/dinacharya/generate', { dosha, wakeUpTime })
      onGenerate(data)
    } catch (err) {
      setError('Failed to generate your routine. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream to-green-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-5xl block mb-4">🌞</span>
          <h1 className="text-3xl font-bold text-ayur-bark mb-2">Daily Dinacharya Planner</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            Dinacharya is the Ayurvedic daily routine — a personalised schedule of practices that align your body and mind with nature's cycles.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Dosha selector */}
            <div>
              <label className="block text-sm font-semibold text-ayur-bark mb-3">
                What is your dominant dosha?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(DOSHA_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDosha(key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      dosha === key
                        ? `border-transparent bg-gradient-to-br ${cfg.gradient} text-white shadow-lg scale-105`
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{cfg.emoji}</span>
                    <span className="text-xs font-semibold">{cfg.name}</span>
                    <span className={`text-xs ${dosha === key ? 'text-white/80' : 'text-gray-400'}`}>{cfg.elements}</span>
                  </button>
                ))}
              </div>
              {!dosha && (
                <p className="text-xs text-gray-400 mt-2">
                  Don't know your dosha?{' '}
                  <a href="/quiz" className="text-ayur-leaf font-medium hover:underline">Take the free quiz →</a>
                </p>
              )}
            </div>

            {/* Wake-up time */}
            <div>
              <label className="block text-sm font-semibold text-ayur-bark mb-3">
                What time do you wake up?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">⏰</span>
                <input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-lg font-medium text-ayur-bark focus:outline-none focus:border-ayur-leaf transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Your entire schedule will be calculated from this time.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all duration-300 ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : dosha
                  ? `bg-gradient-to-r ${DOSHA_CONFIG[dosha]?.gradient} hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                  : 'bg-ayur-leaf hover:bg-green-700 shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Claude is crafting your routine…
                </span>
              ) : (
                '✨ Generate My Daily Routine'
              )}
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '🤖', label: 'AI Personalised', sub: 'Tailored for your dosha' },
            { icon: '📋', label: '16–20 Activities', sub: 'Full day coverage' },
            { icon: '✅', label: 'Daily Checklist', sub: 'Track completion' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-xs font-semibold text-ayur-bark">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Activity Card ─────────────────────────────────────────────────────────────
function ActivityCard({ activity, doshaConfig, onToggle, index }) {
  const catColors = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.morning

  return (
    <div
      className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group
        ${activity.completed
          ? 'bg-green-50 border-green-200 opacity-80'
          : `${catColors.bg} ${catColors.border} hover:shadow-md hover:-translate-y-0.5`
        }`}
      onClick={() => onToggle(activity._id, !activity.completed)}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
            activity.completed
              ? `${doshaConfig.check} text-white shadow-md`
              : 'bg-white shadow-sm border border-gray-200'
          }`}
        >
          {activity.completed ? '✓' : activity.icon || '🌿'}
        </div>
        {index !== undefined && (
          <div className="w-px flex-1 bg-gray-200 mt-2 min-h-[8px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className={`text-xs font-semibold ${doshaConfig.accent} mr-2`}>{activity.time}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors.badge}`}>
              {activity.category}
            </span>
          </div>
          {activity.duration && (
            <span className="text-xs text-gray-400 flex-shrink-0">⏱ {activity.duration}</span>
          )}
        </div>
        <h3 className={`font-semibold text-sm text-ayur-bark mb-1 ${activity.completed ? 'line-through text-gray-400' : ''}`}>
          {activity.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">{activity.description}</p>
      </div>
    </div>
  )
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ percent, doshaConfig }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#ring-grad)" strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={percent >= 100 ? '#22c55e' : '#4a7c59'} />
          <stop offset="100%" stopColor={percent >= 100 ? '#16a34a' : '#c9a84c'} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Stage: Planner View ───────────────────────────────────────────────────────
function PlannerView({ routine: initialRoutine, onReset }) {
  const [routine, setRoutine] = useState(initialRoutine)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [updating, setUpdating] = useState(null)

  const doshaConfig = DOSHA_CONFIG[routine.dosha] || DOSHA_CONFIG.vata
  const activities = routine.activities || []

  const completed = activities.filter((a) => a.completed).length
  const total = activities.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  const filtered = activeCategory === 'all'
    ? activities
    : activities.filter((a) => a.category === activeCategory)

  const catCounts = CATEGORIES.slice(1).reduce((acc, { id }) => {
    acc[id] = activities.filter((a) => a.category === id)
    return acc
  }, {})

  async function handleToggle(activityId, newCompleted) {
    if (updating) return
    setUpdating(activityId)

    // Optimistic update
    setRoutine((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a._id === activityId ? { ...a, completed: newCompleted } : a
      ),
    }))

    try {
      await api.patch(`/api/dinacharya/${routine.sessionId}/progress`, {
        activityId,
        completed: newCompleted,
      })
    } catch {
      // Revert on failure
      setRoutine((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a._id === activityId ? { ...a, completed: !newCompleted } : a
        ),
      }))
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    if (percent === 100 && total > 0) setShowConfetti(true)
  }, [percent, total])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream to-green-50 pb-16">

      {/* Hero banner */}
      <div className={`bg-gradient-to-r ${doshaConfig.gradient} text-white px-4 py-10`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{doshaConfig.emoji}</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  {doshaConfig.name} Dinacharya
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{doshaConfig.tagline}</h1>
              <p className="text-white/80 text-sm">
                Wake-up: {formatDisplayTime(routine.wakeUpTime)} · {total} practices
              </p>
            </div>

            {/* Progress ring */}
            <div className="flex items-center gap-4 bg-white/15 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="relative">
                <ProgressRing percent={percent} doshaConfig={doshaConfig} />
                <div className="absolute inset-0 flex items-center justify-center rotate-0">
                  <span className="text-lg font-bold">{percent}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{completed}/{total}</p>
                <p className="text-white/80 text-xs">practices done</p>
                {percent === 100 && (
                  <p className="text-yellow-300 text-xs font-semibold mt-1">🎉 Day Complete!</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {routine.aiSummary && (
            <div className="mt-6 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/95 leading-relaxed">{routine.aiSummary}</p>
              {routine.doshaNote && (
                <p className="text-xs text-yellow-200 mt-2 font-medium">💡 {routine.doshaNote}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confetti banner */}
      {showConfetti && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-4 px-4 animate-bounce">
          <span className="font-bold text-lg">🎊 Amazing! You completed your entire Dinacharya today! 🎊</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-8">

        {/* Category progress bars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {CATEGORIES.slice(1).map(({ id, label, icon }) => {
            const cats = catCounts[id] || []
            const done = cats.filter((a) => a.completed).length
            const pct = cats.length ? Math.round((done / cats.length) * 100) : 0
            const cc = CATEGORY_COLORS[id]
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(activeCategory === id ? 'all' : id)}
                className={`${cc.bg} ${cc.border} border rounded-2xl p-4 text-left transition-all hover:shadow-md ${
                  activeCategory === id ? 'ring-2 ring-offset-2 ring-gray-400 shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cc.badge}`}>{done}/{cats.length}</span>
                </div>
                <p className="text-xs font-semibold text-ayur-bark mb-2">{label}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${cc.dot} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === id
                  ? `bg-gradient-to-r ${doshaConfig.gradient} text-white shadow-md`
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{icon}</span> {label}
              {id !== 'all' && (
                <span className={`text-xs ml-1 ${activeCategory === id ? 'text-white/80' : 'text-gray-400'}`}>
                  ({(catCounts[id] || []).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Activity list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No activities in this category.</p>
          ) : (
            filtered.map((activity, i) => (
              <ActivityCard
                key={activity._id || i}
                activity={activity}
                doshaConfig={doshaConfig}
                onToggle={handleToggle}
                index={i < filtered.length - 1 ? i : undefined}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-10 justify-center">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            ↩ New Routine
          </button>
          <button
            onClick={async () => {
              try {
                await api.patch(`/api/dinacharya/${routine.sessionId}/reset`)
                setRoutine((prev) => ({
                  ...prev,
                  activities: prev.activities.map((a) => ({ ...a, completed: false })),
                }))
                setShowConfetti(false)
              } catch { /* silent */ }
            }}
            className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            🔄 Reset Checklist
          </button>
        </div>

        {/* Tip box */}
        <div className={`mt-10 ${doshaConfig.lightBg} ${doshaConfig.border} border rounded-2xl p-5`}>
          <h3 className={`font-semibold text-sm ${doshaConfig.accent} mb-2`}>💡 How to use your Dinacharya</h3>
          <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
            <li>• Tap any practice to mark it complete — your progress saves automatically</li>
            <li>• Filter by time of day using the category buttons above</li>
            <li>• Aim for consistency over perfection — even 50% daily is transformative</li>
            <li>• Use "Reset Checklist" each morning to start fresh</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function formatDisplayTime(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const dh = h % 12 === 0 ? 12 : h % 12
  return `${dh}:${String(m).padStart(2, '0')} ${ampm}`
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DinacharyaPlanner() {
  const [routine, setRoutine] = useState(null)
  const [stage, setStage] = useState('form') // 'form' | 'planner'

  function handleGenerate(data) {
    setRoutine(data)
    setStage('planner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setRoutine(null)
    setStage('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (stage === 'planner' && routine) {
    return <PlannerView routine={routine} onReset={handleReset} />
  }

  return <PlannerForm onGenerate={handleGenerate} />
}
