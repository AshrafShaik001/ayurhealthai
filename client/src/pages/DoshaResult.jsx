import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api'
import { DOSHA_META } from '../data/quizQuestions'
import SaveResultsBanner from '../components/SaveResultsBanner'

// ─── Main export ──────────────────────────────────────────────
export default function DoshaResult() {
  const { sessionId } = useParams()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [barsFilled, setBarsFilled] = useState(false)

  useEffect(() => {
    api.get(`/api/quiz/result/${sessionId}`)
      .then(({ data }) => {
        setResult(data)
        // Trigger bar animation after brief delay
        setTimeout(() => setBarsFilled(true), 400)
      })
      .catch(() => setError('Could not load your results. The session may have expired.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  const { dominantDosha, percentages, recommendation, scores } = result
  const dominantKey = dominantDosha.toLowerCase()
  const meta        = DOSHA_META[dominantKey] || DOSHA_META.vata

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50">

      {/* ── Hero ── */}
      <div className={`bg-gradient-to-br ${meta.gradient} text-white py-16 px-4`}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
            Your Dosha is
          </p>
          <div className="text-8xl mb-4 drop-shadow-lg">{meta.emoji}</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2">{dominantDosha}</h1>
          <p className="text-white/80 text-lg mb-6">{meta.elements} · {meta.tagline}</p>

          {/* Trait pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {meta.traits.map(t => (
              <span key={t} className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>

          <p className="text-white/90 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            {recommendation?.summary}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">

        {/* ── Dosha Breakdown ── */}
        <Section title="Your Dosha Breakdown" icon="📊">
          <div className="space-y-5">
            {Object.entries(DOSHA_META).map(([key, m]) => {
              const pct = percentages?.[key] ?? 0
              const raw = scores?.[key] ?? 0
              const isDom = key === dominantKey

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <span className={`font-bold text-gray-800 ${isDom ? 'text-base' : 'text-sm'}`}>
                          {m.name}
                        </span>
                        {isDom && (
                          <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${m.badge}`}>
                            Dominant
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${isDom ? 'text-lg text-gray-800' : 'text-sm text-gray-600'}`}>
                        {pct}%
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({raw}/20)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.bar} transition-all ease-out`}
                      style={{
                        width:      barsFilled ? `${pct}%` : '0%',
                        transitionDuration: `${800 + Object.keys(DOSHA_META).indexOf(key) * 200}ms`,
                        boxShadow: isDom ? `0 2px 8px rgba(0,0,0,0.15)` : 'none',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`mt-6 p-4 rounded-2xl ${meta.lightBg} ${meta.border} border`}>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">{meta.emoji} {dominantDosha} tip:</span>{' '}
              {dominantKey === 'vata' && 'Consistency, warmth, and grounding are your greatest allies. Build rituals that anchor you.'}
              {dominantKey === 'pitta' && 'Cooling, surrender, and play balance your fire. Allow yourself to rest without agenda.'}
              {dominantKey === 'kapha' && 'Movement, stimulation, and novelty spark your vitality. Embrace change as your medicine.'}
            </p>
          </div>
        </Section>

        {/* ── Diet ── */}
        {recommendation?.diet && (
          <Section title="Diet & Nutrition" icon="🥗">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Favor */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">✅</span> Favour These
                </h4>
                <ul className="space-y-2">
                  {recommendation.diet.favor?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Minimise These
                </h4>
                <ul className="space-y-2">
                  {recommendation.diet.avoid?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tips */}
            {recommendation.diet.tips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span> Practical Tips
                </h4>
                <ol className="space-y-2">
                  {recommendation.diet.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Section>
        )}

        {/* ── Lifestyle ── */}
        {recommendation?.lifestyle && (
          <Section title="Lifestyle & Daily Routine" icon="🌅">
            {/* Daily routine timeline */}
            {recommendation.lifestyle.dailyRoutine?.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">Dinacharya (Daily Routine)</h4>
                <div className="relative space-y-3">
                  {recommendation.lifestyle.dailyRoutine.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                          {i + 1}
                        </div>
                        {i < recommendation.lifestyle.dailyRoutine.length - 1 && (
                          <div className="w-0.5 h-3 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {recommendation.lifestyle.exercise && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <span>🏃</span> Exercise
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {recommendation.lifestyle.exercise}
                  </p>
                </div>
              )}
              {recommendation.lifestyle.sleep && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                  <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <span>😴</span> Sleep
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {recommendation.lifestyle.sleep}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Herbs ── */}
        {recommendation?.herbs?.length > 0 && (
          <Section title="Recommended Herbs" icon="🌿">
            <div className="grid sm:grid-cols-2 gap-4">
              {recommendation.herbs.map((herb, i) => (
                <div
                  key={i}
                  className={`${meta.lightBg} ${meta.border} border rounded-2xl p-5 flex gap-4 items-start`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                    🌱
                  </div>
                  <div>
                    <h4 className="font-bold text-ayur-bark text-sm mb-1">{herb.name}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{herb.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              * Consult an Ayurvedic practitioner before starting any herbal protocol.
            </p>
          </Section>
        )}

        {/* ── Yoga & Practices ── */}
        {recommendation?.yoga?.length > 0 && (
          <Section title="Yoga & Practices" icon="🧘">
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendation.yoga.map((practice, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  <span className={`text-lg flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    🧘
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{practice}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Dashboard CTA ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-shrink-0 text-4xl">🗂️</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-ayur-bark text-lg mb-1">Want deeper insights?</h3>
            <p className="text-gray-500 text-sm">
              Open your personalised {dominantDosha} dashboard — detailed diet tables, daily routine timeline, herb profiles, and yoga plans generated fresh by Claude AI.
            </p>
          </div>
          <Link
            to={`/recommendations?dosha=${dominantDosha}`}
            className={`flex-shrink-0 bg-gradient-to-br ${meta.gradient} text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap shadow-md`}
          >
            Open My Dashboard ✨
          </Link>
        </div>

        {/* ── CTA ── */}
        <div className={`bg-gradient-to-br ${meta.gradient} rounded-3xl p-8 text-white text-center`}>
          <div className="text-4xl mb-4">{meta.emoji}</div>
          <h3 className="text-2xl font-bold mb-2">Begin Your Wellness Journey</h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">
            Ready to go deeper? Our AI consultation can create a full Ayurvedic wellness plan tailored to your {dominantDosha} constitution.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/consultation" className="bg-white text-ayur-bark font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm">
              Full AI Consultation
            </Link>
            <Link to="/quiz" className="border border-white/50 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Retake Quiz
            </Link>
          </div>
        </div>

        {/* ── Save Results Banner ── */}
        <SaveResultsBanner
          type="quiz"
          sessionId={sessionId}
          redirectTo={`/quiz/result/${sessionId}`}
        />

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          AyurHealthAI recommendations are for informational purposes only and do not constitute medical advice.
          Always consult a qualified healthcare professional before making health decisions.
        </p>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm shadow-green-100/50 border border-gray-100 p-7">
      <h2 className="text-xl font-bold text-ayur-bark mb-6 flex items-center gap-2.5">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Loading State ────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-ayur-leaf/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-3 rounded-full border-4 border-dashed border-ayur-gold/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">🌿</div>
      </div>
      <p className="text-gray-500 text-sm font-medium">Loading your results…</p>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🌿</div>
      <h2 className="text-2xl font-bold text-ayur-bark">Results Not Found</h2>
      <p className="text-gray-500 max-w-sm">{message}</p>
      <Link to="/quiz" className="btn-primary mt-4">Retake the Quiz</Link>
    </div>
  )
}
