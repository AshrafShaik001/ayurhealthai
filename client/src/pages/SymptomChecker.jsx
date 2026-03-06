import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS, calcDoshaScores } from '../data/symptomData'
import { DOSHA_META } from '../data/quizQuestions'

// ─── Main ─────────────────────────────────────────────────────
export default function SymptomChecker() {
  const [stage, setStage]         = useState('select')  // select | analyzing | results | error
  const [selected, setSelected]   = useState(new Set())
  const [activeCategory, setActiveCategory] = useState('all')
  const [analysis, setAnalysis]   = useState(null)
  const [errorMsg, setErrorMsg]   = useState('')
  const [barsReady, setBarsReady] = useState(false)
  const resultsRef = useRef(null)

  const count = selected.size
  const canAnalyze = count >= 2

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAnalyze = async () => {
    setStage('analyzing')
    const selectedIds    = [...selected]
    const symptomLabels  = selectedIds.map(id => ALL_SYMPTOMS.find(s => s.id === id)?.label).filter(Boolean)
    const doshaScores    = calcDoshaScores(selectedIds)

    try {
      const { data } = await api.post('/api/symptoms/analyze', {
        symptoms:    symptomLabels,
        doshaScores,
      })
      setAnalysis(data)
      setStage('results')
      setTimeout(() => setBarsReady(true), 400)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Analysis failed. Please try again.')
      setStage('error')
    }
  }

  const handleReset = () => {
    setStage('select')
    setSelected(new Set())
    setAnalysis(null)
    setBarsReady(false)
    setActiveCategory('all')
  }

  const visibleCategories = activeCategory === 'all'
    ? SYMPTOM_CATEGORIES
    : SYMPTOM_CATEGORIES.filter(c => c.id === activeCategory)

  if (stage === 'analyzing') return <AnalyzingScreen count={count} />
  if (stage === 'error')     return <ErrorScreen message={errorMsg} onRetry={handleReset} />

  if (stage === 'results' && analysis?.analysis) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">
      <div className="bg-gradient-to-r from-ayur-bark to-ayur-earth text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0">🔍</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Ayurvedic Analysis</h1>
              <p className="text-white/75 text-sm md:text-base max-w-2xl leading-relaxed">
                Based on your {analysis.symptomCount} symptom{analysis.symptomCount !== 1 ? 's' : ''}, here is your personalised Ayurvedic healing plan.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ayur-bark">Your Analysis</h2>
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-ayur-leaf transition-colors flex items-center gap-1"
          >
            ↩ New Check
          </button>
        </div>
        <ResultsContent analysis={analysis.analysis} barsReady={barsReady} onReset={handleReset} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-gradient-to-r from-ayur-bark to-ayur-earth text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0">🔍</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Ayurvedic Symptom Checker</h1>
              <p className="text-white/75 text-sm md:text-base max-w-2xl leading-relaxed">
                Select the symptoms you're currently experiencing. Our AI will identify which dosha is out of balance and give you personalised Ayurvedic remedies, herbs, and lifestyle corrections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SELECTION AREA ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <CategoryPill
            label="All Symptoms"
            icon="🌿"
            isActive={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            color="bg-gray-800 text-white"
            inactiveColor="bg-white border border-gray-200 text-gray-600"
          />
          {SYMPTOM_CATEGORIES.map(cat => {
            const catSelected = [...selected].filter(id => cat.symptoms.some(s => s.id === id)).length
            return (
              <CategoryPill
                key={cat.id}
                label={`${cat.icon} ${cat.label}`}
                badge={catSelected || null}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                color={`${cat.color.active} text-white`}
                inactiveColor={`${cat.color.bg} ${cat.color.border} border ${cat.color.text}`}
              />
            )
          })}
        </div>

        {/* Symptom grid(s) */}
        <div className="space-y-6">
          {visibleCategories.map(cat => (
            <div key={cat.id}>
              {activeCategory === 'all' && (
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${cat.color.text}`}>
                  <span>{cat.icon}</span> {cat.label}
                </h3>
              )}
              <div className="flex flex-wrap gap-2.5">
                {cat.symptoms.map(sym => {
                  const isSelected = selected.has(sym.id)
                  return (
                    <button
                      key={sym.id}
                      onClick={() => toggle(sym.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? `${cat.color.active} border-transparent text-white shadow-md scale-105`
                          : `bg-white ${cat.color.border} ${cat.color.text} hover:scale-102 hover:shadow-sm`
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {sym.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky bottom bar */}
        <div className={`sticky bottom-4 mt-10 transition-all duration-300 ${count > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-4 flex items-center justify-between gap-4">
            {/* Selected chips preview */}
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-gray-500 font-medium mb-1.5">
                {count} symptom{count !== 1 ? 's' : ''} selected
                {!canAnalyze && <span className="text-amber-500"> — select at least 2</span>}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[...selected].slice(0, 6).map(id => {
                  const sym = ALL_SYMPTOMS.find(s => s.id === id)
                  return (
                    <span key={id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {sym?.label}
                    </span>
                  )
                })}
                {count > 6 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    +{count - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 px-6 py-2.5"
              >
                <span>🔍</span> Analyze Symptoms
              </button>
            </div>
          </div>
        </div>

        {count === 0 && (
          <p className="text-center text-gray-400 text-sm mt-12">
            Select the symptoms you are experiencing to begin analysis
          </p>
        )}
      </div>

    </div>
  )
}

// ─── Tiny helper components ───────────────────────────────────
function CategoryPill({ label, badge, isActive, onClick, color, inactiveColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isActive ? color : inactiveColor}`}
    >
      {label}
      {badge > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-ayur-leaf text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ─── Results Content ──────────────────────────────────────────
function ResultsContent({ analysis, barsReady, onReset }) {
  if (!analysis) return null
  const primaryKey  = analysis.primary_imbalance?.toLowerCase()
  const primaryMeta = DOSHA_META[primaryKey] || DOSHA_META.vata
  const severityConfig = {
    mild:        { label: 'Mild Imbalance',        bg: 'bg-green-100',  text: 'text-green-700'  },
    moderate:    { label: 'Moderate Imbalance',     bg: 'bg-amber-100',  text: 'text-amber-700'  },
    significant: { label: 'Significant Imbalance',  bg: 'bg-red-100',    text: 'text-red-700'    },
  }
  const sev = severityConfig[analysis.severity] || severityConfig.moderate

  return (
    <div className="space-y-5">

      {/* ── HERO CARD ── */}
      <div className={`bg-gradient-to-br ${primaryMeta.gradient} text-white rounded-3xl p-7`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center text-5xl">
              {primaryMeta.emoji}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${sev.bg} ${sev.text}`}>
                {sev.label}
              </span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                Primary: {analysis.primary_imbalance} Imbalance
              </span>
              {analysis.secondary_imbalance && analysis.secondary_imbalance !== 'None' && (
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Secondary: {analysis.secondary_imbalance}
                </span>
              )}
            </div>
            <p className="text-white/90 leading-relaxed text-sm">{analysis.analysis}</p>
          </div>
        </div>
      </div>

      {/* ── DOSHA IMBALANCE BARS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span>📊</span> Dosha Imbalance Levels
        </h3>
        <div className="space-y-4">
          {Object.entries(DOSHA_META).map(([key, m]) => {
            const pct = analysis.dosha_scores?.[key] ?? 0
            const isDom = key === primaryKey
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.emoji}</span>
                    <span className={`font-semibold text-sm ${isDom ? 'text-gray-900' : 'text-gray-600'}`}>
                      {m.name}
                    </span>
                    {isDom && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.badge} font-semibold`}>
                        Most Imbalanced
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${isDom ? 'text-base' : 'text-sm text-gray-500'}`}>{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.bar} transition-all ease-out`}
                    style={{
                      width:              barsReady ? `${pct}%` : '0%',
                      transitionDuration: `${900 + Object.keys(DOSHA_META).indexOf(key) * 200}ms`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Root causes */}
        {analysis.root_causes?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Ayurvedic Root Causes</h4>
            <div className="space-y-2">
              {analysis.root_causes.map((cause, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${primaryMeta.gradient} text-white text-xs flex items-center justify-center font-bold`}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{cause}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2×2 GRID: Remedies + Herbs + Lifestyle + Diet ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Natural Remedies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>💊</span> Natural Remedies
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {analysis.natural_remedies?.map((remedy, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-gray-800 text-sm">{remedy.title}</h4>
                  <span className="flex-shrink-0 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full capitalize">
                    {remedy.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{remedy.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span>🕐</span> {remedy.frequency}
                  </span>
                  {remedy.dosha_target && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span>🎯</span> {remedy.dosha_target}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Herbs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-ayur-leaf to-primary-700 px-5 py-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🌿</span> Recommended Herbs
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {analysis.herbs?.map((herb, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="font-bold text-gray-800 text-sm">{herb.name}</h4>
                  {herb.sanskrit && <span className="text-xs italic text-gray-400">{herb.sanskrit}</span>}
                </div>
                <p className="text-xs text-ayur-leaf font-medium mb-1">Addresses: {herb.addresses}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">How to Use</p>
                    <p className="text-xs text-gray-700">{herb.preparation}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Dosage</p>
                    <p className="text-xs text-gray-700">{herb.dosage}</p>
                  </div>
                </div>
                {herb.caution && herb.caution !== 'None' && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {herb.caution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Corrections */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🔧</span> Lifestyle Corrections
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {analysis.lifestyle_corrections?.map((lc, i) => {
              const priorityConfig = {
                high:   { bg: 'bg-red-100',    text: 'text-red-700'    },
                medium: { bg: 'bg-amber-100',  text: 'text-amber-700'  },
                low:    { bg: 'bg-green-100',  text: 'text-green-700'  },
              }
              const p = priorityConfig[lc.priority] || priorityConfig.medium
              return (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text} capitalize`}>
                      {lc.priority} priority
                    </span>
                    <span className="text-xs font-semibold text-violet-600">{lc.area}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1 italic">Issue: {lc.issue}</p>
                  <p className="text-sm text-gray-800 font-medium leading-snug mb-1.5">{lc.correction}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span>⏱</span> {lc.timeframe}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dietary Guidelines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🥗</span> Dietary Guidelines
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Eat now */}
            {analysis.dietary_guidelines?.immediate_foods?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>✅</span> Eat Now
                </h4>
                <ul className="space-y-1.5">
                  {analysis.dietary_guidelines.immediate_foods.map((food, i) => {
                    const [name, ...rest] = food.split(' — ')
                    return (
                      <li key={i} className="text-xs text-gray-700 flex gap-2 items-start">
                        <span className="text-green-500 flex-shrink-0 font-bold mt-0.5">+</span>
                        <span><strong>{name}</strong>{rest.length ? ` — ${rest.join(' — ')}` : ''}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Avoid */}
            {analysis.dietary_guidelines?.foods_to_avoid?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>⚠️</span> Avoid
                </h4>
                <ul className="space-y-1.5">
                  {analysis.dietary_guidelines.foods_to_avoid.map((food, i) => {
                    const [name, ...rest] = food.split(' — ')
                    return (
                      <li key={i} className="text-xs text-gray-700 flex gap-2 items-start">
                        <span className="text-red-400 flex-shrink-0 font-bold mt-0.5">−</span>
                        <span><strong>{name}</strong>{rest.length ? ` — ${rest.join(' — ')}` : ''}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Healing Recipe ── */}
      {analysis.dietary_guidelines?.healing_recipe && (
        <div className={`${primaryMeta.lightBg} ${primaryMeta.border} border rounded-2xl p-6`}>
          <h3 className="font-bold text-ayur-bark text-lg mb-1 flex items-center gap-2">
            <span>🍵</span> {analysis.dietary_guidelines.healing_recipe.name}
          </h3>
          <p className="text-sm text-ayur-leaf font-medium mb-4">
            {analysis.dietary_guidelines.healing_recipe.benefit}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ingredients</h4>
              <ul className="space-y-1">
                {analysis.dietary_guidelines.healing_recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-ayur-leaf">•</span> {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Instructions</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysis.dietary_guidelines.healing_recipe.instructions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── When to seek help + Affirmation ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {analysis.when_to_seek_help && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <span>🏥</span> When to See a Doctor
            </h3>
            <p className="text-sm text-amber-900 leading-relaxed">{analysis.when_to_seek_help}</p>
          </div>
        )}
        {analysis.positive_affirmation && (
          <div className={`bg-gradient-to-br ${primaryMeta.gradient} rounded-2xl p-5 text-white`}>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>✨</span> Your Healing Journey
            </h3>
            <p className="text-sm text-white/90 leading-relaxed italic">
              "{analysis.positive_affirmation}"
            </p>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          to={`/recommendations?dosha=${analysis.primary_imbalance}`}
          className={`bg-gradient-to-br ${primaryMeta.gradient} text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center gap-2`}
        >
          <span>🗂️</span> Open {analysis.primary_imbalance} Dashboard
        </Link>
        <Link to="/quiz" className="btn-secondary flex items-center gap-2">
          <span>✨</span> Take Dosha Quiz
        </Link>
        <button onClick={onReset} className="px-5 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
          ↩ Check Different Symptoms
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 pb-4 max-w-2xl mx-auto">
        This analysis is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical concerns.
      </p>
    </div>
  )
}

// ─── Analyzing Screen ─────────────────────────────────────────
function AnalyzingScreen({ count }) {
  const messages = [
    'Reading your symptom patterns…',
    'Cross-referencing with Ayurvedic texts…',
    'Identifying your dosha imbalance…',
    'Selecting personalised remedies and herbs…',
    'Finalising your healing plan…',
  ]
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgT = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2000)
    const progT = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8, 92)), 600)
    return () => { clearInterval(msgT); clearInterval(progT) }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50 flex flex-col items-center justify-center px-4">
      {/* Animated dosha symbols */}
      <div className="flex gap-4 mb-10">
        {['💨', '🔥', '🌊'].map((e, i) => (
          <div
            key={e}
            className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-3xl"
            style={{ animation: `bounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
          >
            {e}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-ayur-bark mb-2 text-center">
        Analysing {count} Symptoms
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
        {messages[msgIdx]}
      </p>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-ayur-leaf to-ayur-gold rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
    </div>
  )
}

// ─── Error Screen ─────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🌿</div>
      <h2 className="text-2xl font-bold text-ayur-bark">Analysis Failed</h2>
      <p className="text-gray-500 max-w-sm text-sm">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-4">Try Again</button>
    </div>
  )
}
