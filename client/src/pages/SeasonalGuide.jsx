import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// ── Ayurvedic Season Metadata ─────────────────────────────────
const SEASONS = {
  Vasanta: {
    western:      'Spring',
    months:       [3, 4],
    emoji:        '🌸',
    icon:         '🌺',
    gradient:     'from-pink-500 via-rose-400 to-green-500',
    cardGradient: 'from-pink-50 to-rose-50',
    border:       'border-rose-200',
    accent:       'text-rose-600',
    bg:           'bg-rose-50',
    dot:          'bg-rose-400',
    description:  'Season of renewal, blossoms, and awakening',
    dosha:        'Kapha',
  },
  Grishma: {
    western:      'Summer',
    months:       [5, 6],
    emoji:        '☀️',
    icon:         '🌞',
    gradient:     'from-orange-500 via-amber-400 to-yellow-400',
    cardGradient: 'from-orange-50 to-amber-50',
    border:       'border-amber-200',
    accent:       'text-amber-600',
    bg:           'bg-amber-50',
    dot:          'bg-amber-400',
    description:  'Season of heat, transformation, and fire',
    dosha:        'Pitta',
  },
  Varsha: {
    western:      'Monsoon',
    months:       [7, 8],
    emoji:        '🌧️',
    icon:         '☔',
    gradient:     'from-blue-600 via-indigo-500 to-blue-400',
    cardGradient: 'from-blue-50 to-indigo-50',
    border:       'border-blue-200',
    accent:       'text-blue-600',
    bg:           'bg-blue-50',
    dot:          'bg-blue-400',
    description:  'Season of rain, renewal, and Vata awakening',
    dosha:        'Vata',
  },
  Sharad: {
    western:      'Autumn',
    months:       [9, 10],
    emoji:        '🍂',
    icon:         '🍁',
    gradient:     'from-orange-600 via-amber-500 to-yellow-500',
    cardGradient: 'from-orange-50 to-yellow-50',
    border:       'border-orange-200',
    accent:       'text-orange-600',
    bg:           'bg-orange-50',
    dot:          'bg-orange-400',
    description:  'Season of transition, clarity, and harvest',
    dosha:        'Pitta',
  },
  Hemanta: {
    western:      'Early Winter',
    months:       [11, 12],
    emoji:        '🌿',
    icon:         '🌲',
    gradient:     'from-green-700 via-emerald-600 to-teal-500',
    cardGradient: 'from-green-50 to-emerald-50',
    border:       'border-emerald-200',
    accent:       'text-emerald-700',
    bg:           'bg-emerald-50',
    dot:          'bg-emerald-500',
    description:  'Season of strength, nourishment, and building',
    dosha:        'Kapha',
  },
  Shishira: {
    western:      'Late Winter',
    months:       [1, 2],
    emoji:        '❄️',
    icon:         '🌨️',
    gradient:     'from-slate-600 via-blue-500 to-cyan-400',
    cardGradient: 'from-slate-50 to-blue-50',
    border:       'border-blue-200',
    accent:       'text-slate-600',
    bg:           'bg-slate-50',
    dot:          'bg-slate-400',
    description:  'Season of stillness, introspection, and cold',
    dosha:        'Kapha',
  },
}

// ── Detect current Ayurvedic season from month ────────────────
function detectCurrentSeason() {
  const month = new Date().getMonth() + 1 // 1–12
  const found = Object.entries(SEASONS).find(([, meta]) => meta.months.includes(month))
  return found ? found[0] : 'Vasanta'
}

// ── Loading skeleton ──────────────────────────────────────────
function GuideSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-36 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl bg-gray-100" />
        <div className="h-48 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-40 rounded-2xl bg-gray-100" />
      <div className="h-56 rounded-2xl bg-gray-100" />
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-slate-50/60">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-bold text-ayur-bark uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Save toast ────────────────────────────────────────────────
function SaveToast({ show, success }) {
  if (!show) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 transition-all ${
      success ? 'bg-ayur-leaf text-white' : 'bg-red-500 text-white'
    }`}>
      {success ? '✅ Guide saved to your plan!' : '❌ Could not save — try again'}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function SeasonalGuide() {
  const { user } = useAuth()

  const defaultDosha  = user?.existingDosha && user.existingDosha !== 'Unknown'
    ? user.existingDosha : 'Vata'
  const detectedSeason = detectCurrentSeason()

  const [selectedSeason, setSelectedSeason] = useState(detectedSeason)
  const [dosha,          setDosha]           = useState(defaultDosha)
  const [guide,          setGuide]           = useState(null)
  const [loading,        setLoading]         = useState(false)
  const [error,          setError]           = useState('')
  const [saving,         setSaving]          = useState(false)
  const [saveToast,      setSaveToast]       = useState({ show: false, success: false })
  const [savedPlanId,    setSavedPlanId]     = useState(null)  // track if this season+dosha is saved
  const [savedPlans,     setSavedPlans]      = useState([])
  const [activeTab,      setActiveTab]       = useState('guide') // 'guide' | 'saved'
  const resultsRef = useRef(null)

  const seasonMeta = SEASONS[selectedSeason]

  // ── Load saved plans on mount ─────────────────────────────
  useEffect(() => {
    api.get('/api/seasonal-guide/saved')
      .then(({ data }) => {
        if (data.success) {
          setSavedPlans(data.plans)
          // Check if current season+dosha combo already saved
          const match = data.plans.find(p => p.season === selectedSeason && p.dosha === dosha)
          if (match) setSavedPlanId(match._id)
        }
      })
      .catch(console.error)
  }, []) // eslint-disable-line

  // ── Track save status when season/dosha changes ───────────
  useEffect(() => {
    const match = savedPlans.find(p => p.season === selectedSeason && p.dosha === dosha)
    setSavedPlanId(match?._id || null)
  }, [selectedSeason, dosha, savedPlans])

  // ── Generate guide ────────────────────────────────────────
  async function handleGenerate() {
    setError('')
    setLoading(true)
    setGuide(null)
    setSavedPlanId(null)

    try {
      const { data } = await api.post('/api/seasonal-guide/generate', {
        season: selectedSeason,
        dosha,
      })
      if (data.success) {
        setGuide(data.guide)
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Guide generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Save to plan ──────────────────────────────────────────
  async function handleSave() {
    if (!guide || saving) return
    setSaving(true)
    try {
      const { data } = await api.post('/api/seasonal-guide/save', {
        season: selectedSeason,
        dosha,
        guide,
      })
      if (data.success) {
        setSavedPlanId(data.plan._id)
        setSavedPlans(prev => {
          const filtered = prev.filter(p => !(p.season === selectedSeason && p.dosha === dosha))
          return [data.plan, ...filtered]
        })
        setSaveToast({ show: true, success: true })
      }
    } catch {
      setSaveToast({ show: true, success: false })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveToast({ show: false, success: false }), 3000)
    }
  }

  // ── Delete saved plan ─────────────────────────────────────
  async function handleDelete(id) {
    try {
      await api.delete(`/api/seasonal-guide/saved/${id}`)
      setSavedPlans(prev => prev.filter(p => p._id !== id))
      if (savedPlanId === id) setSavedPlanId(null)
    } catch (e) {
      console.error('delete error:', e)
    }
  }

  // ── Load a saved plan into the guide view ─────────────────
  function loadSavedPlan(plan) {
    setSelectedSeason(plan.season)
    setDosha(plan.dosha)
    setGuide(plan.guide)
    setSavedPlanId(plan._id)
    setActiveTab('guide')
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">
      {/* ── Header ── */}
      <div className={`bg-gradient-to-r ${seasonMeta.gradient} text-white px-4 py-10 transition-all duration-700`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">{seasonMeta.emoji}</span>
            <div>
              <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Ritucharya — Seasonal Regimen</div>
              <h1 className="text-2xl font-bold">Seasonal Eating Guide</h1>
              <p className="text-white/80 text-sm mt-0.5">{seasonMeta.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              📍 Auto-detected: <strong>{detectedSeason}</strong> ({SEASONS[detectedSeason].western})
            </span>
            {user?.existingDosha && user.existingDosha !== 'Unknown' && (
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                🧬 Your dosha: <strong>{user.existingDosha}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl w-fit mb-8 shadow-sm">
          {[
            { id: 'guide', label: `${seasonMeta.emoji} Generate Guide` },
            { id: 'saved', label: `📋 Saved Plans (${savedPlans.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-ayur-leaf text-white shadow-sm' : 'text-gray-500 hover:text-ayur-bark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* GUIDE TAB */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* ── Controls panel ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Season selector */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                  🌿 Select Season
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {Object.entries(SEASONS).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedSeason(key); setGuide(null) }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                        selectedSeason === key
                          ? `border-2 ${meta.border} ${meta.bg} shadow-sm scale-[1.02]`
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">{meta.emoji}</span>
                      <span className={`text-xs font-bold ${selectedSeason === key ? meta.accent : 'text-gray-600'}`}>
                        {key}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight">{meta.western}</span>
                      {key === detectedSeason && (
                        <span className="text-[9px] bg-ayur-leaf text-white font-bold px-1.5 py-0.5 rounded-full">
                          Now
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosha selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  🧬 Your Dosha
                  {user?.existingDosha && user.existingDosha !== 'Unknown' && (
                    <span className="ml-2 text-ayur-leaf normal-case font-normal">(from your profile)</span>
                  )}
                </label>
                <div className="flex gap-2">
                  {['Vata', 'Pitta', 'Kapha'].map(d => (
                    <button
                      key={d}
                      onClick={() => { setDosha(d); setGuide(null) }}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        dosha === d
                          ? 'bg-ayur-leaf text-white border-ayur-leaf shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf hover:text-ayur-leaf'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season aggravation note */}
              {SEASONS[selectedSeason].dosha && (
                <div className={`mb-5 flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-xl border ${seasonMeta.bg} ${seasonMeta.border} ${seasonMeta.accent}`}>
                  <span className="text-base">{seasonMeta.icon}</span>
                  <span>
                    <strong>{selectedSeason}</strong> season primarily aggravates{' '}
                    <strong>{SEASONS[selectedSeason].dosha}</strong> dosha.
                    {dosha === SEASONS[selectedSeason].dosha && (
                      <span className="ml-1 font-bold">⚠️ Extra care needed for your constitution.</span>
                    )}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all inline-flex items-center justify-center gap-2
                  ${!loading ? 'hover:opacity-90 active:scale-[0.99] cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                style={{ background: `linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)` }}
              >
                {loading ? (
                  <><span className="animate-spin">🌀</span> Generating Ritucharya Guide…</>
                ) : (
                  <><span>{seasonMeta.emoji}</span> Generate {selectedSeason} Guide for {dosha}</>
                )}
              </button>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <span className="animate-spin inline-block">🌿</span>
                  Our Ayurvedic AI is crafting your seasonal Ritucharya regimen…
                </p>
                <GuideSkeleton />
              </div>
            )}

            {/* ══════════════════════════════════════ */}
            {/* RESULTS                               */}
            {/* ══════════════════════════════════════ */}
            {!loading && guide && (
              <div ref={resultsRef} className="space-y-5">
                {/* ── Season banner ── */}
                <div className={`bg-gradient-to-r ${seasonMeta.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none select-none pointer-events-none">
                    {seasonMeta.emoji}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                          Ritucharya for {dosha} Dosha
                        </div>
                        <h2 className="text-2xl font-black mb-1">
                          {guide.ayurvedic_name} ({guide.season_name})
                        </h2>
                        {guide.season_description && (
                          <p className="text-white/85 text-sm leading-relaxed max-w-lg">
                            {guide.season_description}
                          </p>
                        )}
                        {guide.dosha_impact && (
                          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2.5 text-sm text-white max-w-lg">
                            🧬 <strong>Effect on {dosha}:</strong> {guide.dosha_impact}
                          </div>
                        )}
                      </div>
                      {/* Save button */}
                      <button
                        onClick={handleSave}
                        disabled={saving || !!savedPlanId}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          savedPlanId
                            ? 'bg-white/30 border-white/40 text-white cursor-default'
                            : 'bg-white text-ayur-leaf border-white hover:bg-green-50 active:scale-95'
                        } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {saving ? (
                          <><span className="animate-spin">🌀</span> Saving…</>
                        ) : savedPlanId ? (
                          <>✅ Saved to My Plan</>
                        ) : (
                          <>📋 Save to My Plan</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Foods grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Foods to eat */}
                  <Section title="Foods to Eat" icon="✅">
                    <div className="space-y-2">
                      {guide.foods_to_eat?.map((food, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <span className="text-xl flex-shrink-0">{food.emoji || '🌿'}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-sm font-semibold text-ayur-bark">{food.name}</span>
                              {food.taste && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                                  {food.taste}
                                </span>
                              )}
                              {food.quality && (
                                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                                  {food.quality}
                                </span>
                              )}
                            </div>
                            {food.benefit && (
                              <p className="text-xs text-gray-500 leading-relaxed">{food.benefit}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Foods to avoid */}
                  <Section title="Foods to Avoid" icon="❌">
                    <div className="space-y-2">
                      {guide.foods_to_avoid?.map((food, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                          <span className="text-xl flex-shrink-0">{food.emoji || '🚫'}</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold text-ayur-bark block mb-0.5">{food.name}</span>
                            {food.reason && (
                              <p className="text-xs text-gray-500 leading-relaxed">{food.reason}</p>
                            )}
                            {food.effect && (
                              <p className="text-xs text-red-500 font-medium mt-0.5">⚠️ {food.effect}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>

                {/* ── Herbs ── */}
                <Section title="Recommended Herbs" icon="🌱">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {guide.herbs?.map((herb, i) => (
                      <div key={i} className={`rounded-xl border ${seasonMeta.border} ${seasonMeta.bg} p-4`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="text-sm font-bold text-ayur-bark">{herb.name}</div>
                            {herb.sanskrit && (
                              <div className={`text-xs italic font-medium ${seasonMeta.accent}`}>{herb.sanskrit}</div>
                            )}
                          </div>
                          {herb.frequency && (
                            <span className="text-[10px] bg-white border border-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                              🕐 {herb.frequency}
                            </span>
                          )}
                        </div>
                        {herb.preparation && (
                          <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
                            <strong className="text-gray-700">How:</strong> {herb.preparation}
                          </p>
                        )}
                        {herb.benefit && (
                          <p className="text-xs text-gray-500 leading-relaxed">💚 {herb.benefit}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* ── Daily Routine ── */}
                <Section title="Daily Routine (Dinacharya)" icon="🕐">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[1.1rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-ayur-leaf via-ayur-gold to-ayur-leaf opacity-30 rounded-full" />
                    <div className="space-y-4">
                      {guide.daily_routine?.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 relative">
                          {/* Timeline dot */}
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full ${seasonMeta.dot} text-white flex items-center justify-center text-base shadow-sm z-10`}>
                            {item.icon || '🌿'}
                          </div>
                          <div className={`flex-1 bg-white rounded-xl border ${seasonMeta.border} p-3.5 shadow-sm`}>
                            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                              <div>
                                <span className="text-sm font-bold text-ayur-bark">{item.activity}</span>
                                {item.time && (
                                  <span className={`ml-2 text-xs font-semibold ${seasonMeta.accent}`}>{item.time}</span>
                                )}
                              </div>
                              {item.duration && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                  ⏱ {item.duration}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* ── Special advice ── */}
                {guide.special_advice && (
                  <div className={`bg-gradient-to-r ${seasonMeta.gradient} rounded-2xl p-6 text-white`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">💬</span>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">
                          Special Advice for {dosha} in {selectedSeason}
                        </h3>
                        <p className="text-white/95 text-sm leading-relaxed">{guide.special_advice}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Save button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !!savedPlanId}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
                      savedPlanId
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200 cursor-default'
                        : 'text-white hover:opacity-90 active:scale-95 cursor-pointer'
                    } ${saving ? 'opacity-60' : ''}`}
                    style={savedPlanId ? {} : { background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
                  >
                    {saving ? (
                      <><span className="animate-spin">🌀</span> Saving…</>
                    ) : savedPlanId ? (
                      <>✅ Saved to My Plan</>
                    ) : (
                      <>📋 Save to My Plan</>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 pb-4">
                  This Ritucharya guide is AI-generated based on classical Ayurvedic principles. Consult an Ayurvedic practitioner for personalised advice.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SAVED PLANS TAB */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'saved' && (
          <div>
            {savedPlans.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-ayur-bark mb-2">No saved plans yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Generate a guide and click "Save to My Plan" to keep it here.
                </p>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  🌿 Generate a Guide
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-ayur-bark mb-5">Your Saved Ritucharya Plans ({savedPlans.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPlans.map(plan => {
                    const meta = SEASONS[plan.season] || SEASONS.Vasanta
                    return (
                      <div
                        key={plan._id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Card header gradient */}
                        <div className={`bg-gradient-to-r ${meta.gradient} px-4 py-5 text-white`}>
                          <div className="text-3xl mb-1">{meta.emoji}</div>
                          <div className="font-bold text-base">{plan.guide?.ayurvedic_name || plan.season}</div>
                          <div className="text-white/70 text-xs">{meta.western} · {plan.dosha} Dosha</div>
                        </div>
                        <div className="p-4">
                          {/* Quick stats */}
                          <div className="flex gap-3 mb-4 flex-wrap">
                            {[
                              { label: 'Foods to eat',  count: plan.guide?.foods_to_eat?.length  ?? 0, color: 'text-emerald-600' },
                              { label: 'Foods avoid',   count: plan.guide?.foods_to_avoid?.length ?? 0, color: 'text-red-500' },
                              { label: 'Herbs',         count: plan.guide?.herbs?.length           ?? 0, color: meta.accent },
                            ].map(({ label, count, color }) => (
                              <div key={label} className="text-center">
                                <div className={`text-lg font-black ${color}`}>{count}</div>
                                <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
                              </div>
                            ))}
                          </div>
                          {/* Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadSavedPlan(plan)}
                              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                              style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #c9a84c 100%)' }}
                            >
                              View Guide
                            </button>
                            <button
                              onClick={() => handleDelete(plan._id)}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                              title="Delete plan"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Toast notification ── */}
      <SaveToast show={saveToast.show} success={saveToast.success} />
    </div>
  )
}
