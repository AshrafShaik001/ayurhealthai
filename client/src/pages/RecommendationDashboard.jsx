import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'
import { DOSHA_META } from '../data/quizQuestions'

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: '🔮' },
  { id: 'diet',      label: 'Diet',            icon: '🥗' },
  { id: 'routine',   label: 'Daily Routine',   icon: '🌅' },
  { id: 'herbs',     label: 'Herbs',           icon: '🌿' },
  { id: 'yoga',      label: 'Yoga & Mind',     icon: '🧘' },
]

const DOSHAS = ['Vata', 'Pitta', 'Kapha']

// ─── Main component ───────────────────────────────────────────
export default function RecommendationDashboard() {
  const [searchParams] = useSearchParams()
  const urlDosha = searchParams.get('dosha')

  const [selectedDosha, setSelectedDosha] = useState(urlDosha || '')
  const [concerns, setConcerns]           = useState('')
  const [stage, setStage]                 = useState(urlDosha ? 'loading' : 'select')
  // stage: 'select' | 'loading' | 'dashboard' | 'error'
  const [data, setData]                   = useState(null)
  const [activeTab, setActiveTab]         = useState('overview')
  const [errorMsg, setErrorMsg]           = useState('')
  const tabRef = useRef(null)

  // Auto-fetch if dosha comes from URL
  useEffect(() => {
    if (urlDosha && DOSHAS.includes(urlDosha)) {
      fetchRecommendations(urlDosha, '')
    }
  }, [urlDosha])

  const fetchRecommendations = async (dosha, userConcerns) => {
    setStage('loading')
    setErrorMsg('')
    try {
      const { data: resp } = await api.post('/api/recommendations', {
        doshaType: dosha,
        concerns:  userConcerns,
        answers:   [],
      })
      setData(resp)
      setSelectedDosha(dosha)
      setStage('dashboard')
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to generate recommendations. Please try again.')
      setStage('error')
    }
  }

  const handleGenerate = () => {
    if (!selectedDosha) return
    fetchRecommendations(selectedDosha, concerns)
  }

  const handleReset = () => {
    setStage('select')
    setData(null)
    setActiveTab('overview')
    setSelectedDosha('')
    setConcerns('')
  }

  // Scroll tab bar into view on tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    tabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  if (stage === 'select') return <SelectForm selectedDosha={selectedDosha} setSelectedDosha={setSelectedDosha} concerns={concerns} setConcerns={setConcerns} onGenerate={handleGenerate} />
  if (stage === 'loading') return <LoadingScreen dosha={selectedDosha} />
  if (stage === 'error')   return <ErrorScreen message={errorMsg} onRetry={() => setStage('select')} />

  const { recommendation, doshaType } = data
  const meta = DOSHA_META[doshaType.toLowerCase()] || DOSHA_META.vata

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO HEADER ── */}
      <div className={`bg-gradient-to-br ${meta.gradient} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Dosha symbol */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-6xl shadow-xl border border-white/20">
                {meta.emoji}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                Personalised Ayurvedic Dashboard
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-1">{doshaType} Constitution</h1>
              <p className="text-white/70 text-sm mb-4">{meta.elements} · {meta.tagline}</p>
              <p className="text-white/90 leading-relaxed text-sm md:text-base max-w-2xl">
                {recommendation.summary}
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors border border-white/30"
              >
                ↩ Change Dosha
              </button>
              <Link
                to="/quiz"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-ayur-bark hover:bg-white/90 transition-colors text-center"
              >
                Retake Quiz
              </Link>
            </div>
          </div>

          {/* Constitution highlights */}
          {recommendation.constitution_highlights?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {recommendation.constitution_highlights.map((h, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-sm text-white/90 text-center">
                  {h}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY TAB BAR ── */}
      <div ref={tabRef} className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-ayur-leaf text-ayur-leaf'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'overview'  && <OverviewTab  rec={recommendation} meta={meta} doshaType={doshaType} />}
        {activeTab === 'diet'      && <DietTab      rec={recommendation} meta={meta} />}
        {activeTab === 'routine'   && <RoutineTab   rec={recommendation} meta={meta} />}
        {activeTab === 'herbs'     && <HerbsTab     rec={recommendation} meta={meta} />}
        {activeTab === 'yoga'      && <YogaTab      rec={recommendation} meta={meta} />}
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className={`bg-gradient-to-br ${meta.gradient} rounded-3xl p-8 text-white text-center`}>
          <div className="text-4xl mb-3">{meta.emoji}</div>
          <h3 className="text-2xl font-bold mb-2">Ready to Go Deeper?</h3>
          <p className="text-white/80 max-w-md mx-auto text-sm mb-6">
            Book a full AI consultation to get a week-by-week wellness plan tailored to your {doshaType} constitution.
          </p>
          <Link to="/consultation" className="inline-block bg-white text-ayur-bark font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors">
            Start Full Consultation
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          AyurHealthAI recommendations are informational only and not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────
function OverviewTab({ rec, meta, doshaType }) {
  return (
    <div className="space-y-6">
      {/* Quick-action cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🥗', label: 'Foods to Favour', value: rec.diet?.foods_to_favor?.length ?? 0, unit: 'items', tab: 'diet' },
          { icon: '🌿', label: 'Herbal Remedies',  value: rec.herbs?.length ?? 0,                unit: 'herbs', tab: 'herbs' },
          { icon: '🧘', label: 'Yoga Poses',        value: rec.yoga?.poses?.length ?? 0,          unit: 'poses', tab: 'yoga' },
          { icon: '🕐', label: 'Routine Steps',     value: (
              (rec.daily_routine?.morning?.length ?? 0) +
              (rec.daily_routine?.afternoon?.length ?? 0) +
              (rec.daily_routine?.evening?.length ?? 0) +
              (rec.daily_routine?.bedtime?.length ?? 0)
            ), unit: 'steps', tab: 'routine' },
        ].map(card => (
          <div key={card.label} className={`${meta.lightBg} ${meta.border} border rounded-2xl p-5 text-center cursor-default`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{card.unit}</div>
            <div className="text-xs text-gray-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Dietary principle highlight */}
      {rec.diet?.principle && (
        <div className={`${meta.lightBg} ${meta.border} border rounded-2xl p-6`}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Core Dietary Principle</p>
          <p className="text-lg font-semibold text-gray-800 leading-snug">{rec.diet.principle}</p>
        </div>
      )}

      {/* Key spices */}
      {rec.diet?.key_spices?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>✨</span> Your Power Spices
          </h3>
          <div className="flex flex-wrap gap-2">
            {rec.diet.key_spices.map((spice, i) => (
              <div key={i} className={`${meta.badge} px-4 py-2 rounded-full text-sm font-medium`}>
                {spice}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle snapshot */}
      {rec.lifestyle && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>🏃</span> Exercise</h3>
            <div className="space-y-2">
              {rec.lifestyle.exercise && Object.entries(rec.lifestyle.exercise).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500 capitalize">{k.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>😴</span> Sleep</h3>
            <div className="space-y-2">
              {rec.lifestyle.sleep && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ideal hours</span>
                    <span className="font-medium text-gray-800">{rec.lifestyle.sleep.ideal_hours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bedtime</span>
                    <span className="font-medium text-gray-800">{rec.lifestyle.sleep.bedtime}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasonal advice */}
      {rec.lifestyle?.seasonal_advice && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
          <span className="text-2xl flex-shrink-0">🍂</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">Seasonal Advice for {doshaType}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{rec.lifestyle.seasonal_advice}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Diet ────────────────────────────────────────────────
function DietTab({ rec, meta }) {
  const diet = rec.diet || {}
  return (
    <div className="space-y-6">
      {/* Meal timing banner */}
      {diet.meal_timing && (
        <div className={`bg-gradient-to-r ${meta.gradient} text-white rounded-2xl p-5 flex gap-4 items-center`}>
          <span className="text-3xl flex-shrink-0">🕐</span>
          <div>
            <p className="font-bold mb-0.5">Meal Timing for Your Dosha</p>
            <p className="text-white/90 text-sm">{diet.meal_timing}</p>
          </div>
        </div>
      )}

      {/* Favour / Avoid grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Favour */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-green-500 px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <span>✅</span> Foods to Favour
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {diet.foods_to_favor?.map((item, i) => {
              const [food, ...reasonParts] = item.split(' — ')
              const reason = reasonParts.join(' — ')
              return (
                <li key={i} className="px-6 py-3.5 flex gap-3 items-start">
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">+</span>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{food}</span>
                    {reason && <p className="text-xs text-gray-500 mt-0.5">{reason}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Avoid */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-red-500 px-6 py-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <span>⚠️</span> Foods to Minimise
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {diet.foods_to_avoid?.map((item, i) => {
              const [food, ...reasonParts] = item.split(' — ')
              const reason = reasonParts.join(' — ')
              return (
                <li key={i} className="px-6 py-3.5 flex gap-3 items-start">
                  <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">−</span>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{food}</span>
                    {reason && <p className="text-xs text-gray-500 mt-0.5">{reason}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Key spices */}
      {diet.key_spices?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
            <span>🌶️</span> Healing Spices for Your Dosha
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {diet.key_spices.map((spice, i) => {
              const [name, ...benefitParts] = spice.split(' — ')
              const benefit = benefitParts.join(' — ')
              return (
                <div key={i} className={`flex gap-3 items-start ${meta.lightBg} ${meta.border} border rounded-xl p-4`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                    {benefit && <p className="text-xs text-gray-500 mt-0.5">{benefit}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Daily Routine ───────────────────────────────────────
function RoutineTab({ rec, meta }) {
  const routine = rec.daily_routine || {}
  const periods = [
    { key: 'morning',   label: 'Morning',   emoji: '🌄', bg: 'from-amber-400  to-orange-400' },
    { key: 'afternoon', label: 'Afternoon', emoji: '☀️', bg: 'from-yellow-400 to-amber-400'  },
    { key: 'evening',   label: 'Evening',   emoji: '🌆', bg: 'from-orange-400 to-rose-400'   },
    { key: 'bedtime',   label: 'Bedtime',   emoji: '🌙', bg: 'from-indigo-400 to-purple-500' },
  ]

  return (
    <div className="space-y-6">
      {periods.map(period => {
        const steps = routine[period.key] || []
        if (!steps.length) return null
        return (
          <div key={period.key} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Period header */}
            <div className={`bg-gradient-to-r ${period.bg} px-6 py-4 flex items-center gap-3`}>
              <span className="text-2xl">{period.emoji}</span>
              <h3 className="font-bold text-white text-lg">{period.label}</h3>
            </div>

            {/* Steps */}
            <div className="divide-y divide-gray-50">
              {steps.map((step, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 items-start">
                  {/* Time pill */}
                  <div className="flex-shrink-0 min-w-[100px]">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {step.time}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{step.practice}</p>
                    {step.benefit && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.benefit}</p>
                    )}
                  </div>
                  {/* Step number */}
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Stress management */}
      {rec.lifestyle?.stress_management?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <span>🧠</span> Stress Management for Your Type
          </h3>
          <div className="space-y-3">
            {rec.lifestyle.stress_management.map((technique, i) => (
              <div key={i} className={`flex gap-4 items-start ${meta.lightBg} rounded-xl p-4`}>
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{technique}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Herbs ───────────────────────────────────────────────
function HerbsTab({ rec, meta }) {
  const herbs = rec.herbs || []
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
        <span className="text-xl flex-shrink-0">⚕️</span>
        <p className="text-sm text-amber-800">
          Always consult a qualified Ayurvedic practitioner before beginning any herbal protocol. Dosages may vary.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {herbs.map((herb, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Herb header */}
            <div className={`bg-gradient-to-r ${meta.gradient} px-5 py-4 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                🌱
              </div>
              <div>
                <h3 className="font-bold text-white">{herb.name}</h3>
                {herb.sanskrit && <p className="text-white/70 text-xs italic">{herb.sanskrit}</p>}
              </div>
              <div className="ml-auto w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
            </div>

            {/* Herb details */}
            <div className="p-5 space-y-3 flex-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Benefit</p>
                <p className="text-sm text-gray-700 leading-relaxed">{herb.benefit}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`${meta.lightBg} rounded-xl p-3`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">How to Use</p>
                  <p className="text-xs text-gray-700">{herb.how_to_use}</p>
                </div>
                <div className={`${meta.lightBg} rounded-xl p-3`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Timing</p>
                  <p className="text-xs text-gray-700">{herb.timing}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Yoga & Mind ─────────────────────────────────────────
function YogaTab({ rec, meta }) {
  const yoga = rec.yoga || {}
  return (
    <div className="space-y-6">
      {/* Poses */}
      {yoga.poses?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${meta.gradient} px-6 py-4`}>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span>🧘</span> Recommended Yoga Poses
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {yoga.poses.map((pose, i) => (
              <div key={i} className="px-6 py-4 flex gap-4 items-start">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-800">{pose.name}</h4>
                    {pose.sanskrit && (
                      <span className="text-xs italic text-gray-400">({pose.sanskrit})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{pose.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pranayama */}
      {yoga.pranayama?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${meta.gradient} px-6 py-4`}>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span>🌬️</span> Pranayama (Breathing Practices)
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {yoga.pranayama.map((p, i) => (
              <div key={i} className="px-6 py-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center text-sm flex-shrink-0`}>
                    💨
                  </div>
                  <h4 className="font-bold text-gray-800">{p.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{p.benefit}</p>
                <div className={`${meta.lightBg} rounded-xl p-4`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">How to Practice</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{p.practice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meditation */}
      {yoga.meditation && (
        <div className={`bg-gradient-to-br ${meta.gradient} rounded-2xl p-6 text-white`}>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span>🔮</span> Meditation Practice
          </h3>
          <p className="text-white/90 leading-relaxed">{yoga.meditation}</p>
        </div>
      )}

      {/* Sleep rituals */}
      {rec.lifestyle?.sleep?.rituals?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <span>🌙</span> Sleep Rituals
          </h3>
          <div className="space-y-3">
            {rec.lifestyle.sleep.rituals.map((ritual, i) => (
              <div key={i} className={`flex gap-3 items-center ${meta.lightBg} rounded-xl p-4`}>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>{i + 1}</span>
                <p className="text-sm text-gray-700">{ritual}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dosha Selector Form ──────────────────────────────────────
function SelectForm({ selectedDosha, setSelectedDosha, concerns, setConcerns, onGenerate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold text-ayur-bark mb-2">Personalised Recommendations</h1>
          <p className="text-gray-500 text-sm">Select your dominant dosha to generate a custom Ayurvedic plan powered by Claude AI.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {/* Dosha selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Dominant Dosha</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(DOSHA_META).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDosha(m.name)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    selectedDosha === m.name
                      ? `border-transparent bg-gradient-to-br ${m.gradient} text-white shadow-lg scale-105`
                      : `${m.border} ${m.lightBg} text-gray-700 hover:scale-102`
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="font-bold text-sm">{m.name}</span>
                  <span className={`text-xs ${selectedDosha === m.name ? 'text-white/70' : 'text-gray-400'}`}>
                    {m.elements}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Concerns field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Health Concerns <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={concerns}
              onChange={e => setConcerns(e.target.value)}
              placeholder="e.g. poor sleep, digestive issues, stress, low energy…"
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf resize-none"
            />
          </div>

          <button
            onClick={onGenerate}
            disabled={!selectedDosha}
            className="btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>✨</span> Generate My Dashboard
          </button>

          <p className="text-center text-xs text-gray-400">
            Don't know your dosha?{' '}
            <Link to="/quiz" className="text-ayur-leaf font-medium hover:underline">Take the quiz first →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Loading screen ───────────────────────────────────────────
function LoadingScreen({ dosha }) {
  const meta   = dosha ? DOSHA_META[dosha.toLowerCase()] : null
  const tips   = [
    'Consulting the ancient Charaka Samhita…',
    'Calibrating your elemental balance…',
    'Crafting your personalised plan with Claude AI…',
    'Almost ready — applying 5,000 years of wisdom…',
  ]
  const [tip, setTip] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTip(i => (i + 1) % tips.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${meta ? meta.gradient : 'from-green-500 to-teal-600'} text-white px-4`}>
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-3 rounded-full border-4 border-dashed border-white/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {meta?.emoji ?? '🌿'}
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-center">
        {dosha ? `Building Your ${dosha} Dashboard` : 'Generating Recommendations'}
      </h2>
      <p className="text-white/70 text-sm text-center max-w-xs transition-all duration-500">
        {tips[tip]}
      </p>
    </div>
  )
}

// ─── Error screen ─────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🌿</div>
      <h2 className="text-2xl font-bold text-ayur-bark">Something Went Wrong</h2>
      <p className="text-gray-500 max-w-sm text-sm">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-4">Try Again</button>
    </div>
  )
}
