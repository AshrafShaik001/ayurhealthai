import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { QUESTIONS, DOSHA_META } from '../data/quizQuestions'

const TOTAL = QUESTIONS.length

const CATEGORY_STYLE = {
  Physical:  { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🌿' },
  Mental:    { bg: 'bg-violet-100',  text: 'text-violet-700',  icon: '🧠' },
  Lifestyle: { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: '🌅' },
}

// ─── Main export ──────────────────────────────────────────────
export default function DoshaQuiz() {
  const [stage, setStage]       = useState('welcome')   // welcome | quiz | submitting
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState({})          // { [questionId]: option }
  const [direction, setDirection] = useState('forward')
  const [animating, setAnimating] = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const question        = QUESTIONS[current]
  const selectedAnswer  = answers[question?.id]
  const answeredCount   = Object.keys(answers).length
  const progressPct     = (answeredCount / TOTAL) * 100
  const catStyle        = CATEGORY_STYLE[question?.category] || {}
  const allAnswered     = answeredCount === TOTAL

  // ── navigation helpers ──────────────────────────────────────
  const go = useCallback((newIndex, dir) => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(newIndex)
      setAnimating(false)
    }, 220)
  }, [animating])

  const handleSelect = useCallback((option) => {
    setAnswers(prev => ({ ...prev, [question.id]: option }))
    // Small delay so user sees the selection highlight before advancing
    if (current < TOTAL - 1) {
      setTimeout(() => go(current + 1, 'forward'), 350)
    }
  }, [question?.id, current, go])

  const handlePrev = () => current > 0 && go(current - 1, 'backward')
  const handleNext = () => selectedAnswer && current < TOTAL - 1 && go(current + 1, 'forward')

  // ── submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!allAnswered) return
    setStage('submitting')
    setError('')

    const scores = { vata: 0, pitta: 0, kapha: 0 }
    QUESTIONS.forEach(q => {
      const ans = answers[q.id]
      if (ans?.dosha) scores[ans.dosha] += 1
    })

    const percentages = {
      vata:  Math.round((scores.vata  / TOTAL) * 100),
      pitta: Math.round((scores.pitta / TOTAL) * 100),
      kapha: Math.round((scores.kapha / TOTAL) * 100),
    }

    const dominantEntry = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
    const dominantDosha = dominantEntry[0].charAt(0).toUpperCase() + dominantEntry[0].slice(1)

    const sessionId = crypto.randomUUID()

    try {
      await api.post('/api/quiz/submit', {
        sessionId,
        answers: QUESTIONS.map(q => ({
          questionId:     q.id,
          questionText:   q.question,
          selectedOption: answers[q.id]?.text || '',
          dosha:          answers[q.id]?.dosha || '',
        })),
        scores,
        percentages,
        dominantDosha,
      })
      navigate(`/quiz/result/${sessionId}`)
    } catch (err) {
      setError('Something went wrong — please try again.')
      setStage('quiz')
    }
  }

  // ── keyboard navigation ──────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (stage !== 'quiz') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev()
      if (e.key === '1') question?.options[0] && handleSelect(question.options[0])
      if (e.key === '2') question?.options[1] && handleSelect(question.options[1])
      if (e.key === '3') question?.options[2] && handleSelect(question.options[2])
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [stage, question, handleSelect, handleNext, handlePrev])

  // ── stages ───────────────────────────────────────────────────
  if (stage === 'welcome')    return <WelcomeScreen onStart={() => setStage('quiz')} />
  if (stage === 'submitting') return <SubmittingScreen />

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2.5">
            <Link to="/" className="flex items-center gap-1.5 text-ayur-leaf font-bold text-sm">
              <span>🌿</span> AyurHealthAI
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">
                {answeredCount}/{TOTAL} answered
              </span>
              {/* Dot navigation — last 20 dots, tiny */}
              <div className="hidden sm:flex items-center gap-0.5">
                {QUESTIONS.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => !animating && go(i, i > current ? 'forward' : 'backward')}
                    className={`rounded-full transition-all duration-200 ${
                      i === current
                        ? 'w-4 h-2 bg-ayur-leaf'
                        : answers[q.id]
                        ? 'w-2 h-2 bg-green-400'
                        : 'w-2 h-2 bg-gray-200'
                    }`}
                    aria-label={`Question ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #4a7c59, #c9a84c)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Question area ── */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating
              ? direction === 'forward' ? 'translateX(24px)' : 'translateX(-24px)'
              : 'translateX(0)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-green-100/50 p-8 mb-5">
            {/* Category + counter */}
            <div className="flex items-center justify-between mb-7">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
                {catStyle.icon}&nbsp;{question.category}
              </span>
              <span className="text-sm font-semibold text-gray-300">
                {current + 1}
                <span className="font-normal"> / {TOTAL}</span>
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-xl md:text-2xl font-bold text-ayur-bark leading-snug mb-8">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer?.id === option.id
                const keyHint    = idx + 1

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 group ${
                      isSelected
                        ? 'border-ayur-leaf bg-ayur-leaf text-white shadow-lg shadow-green-200/60 scale-[1.01]'
                        : 'border-gray-200 hover:border-ayur-leaf hover:bg-green-50/60 text-gray-700 hover:scale-[1.005]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Key hint / checkmark circle */}
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-white bg-white text-ayur-leaf'
                            : 'border-gray-300 text-gray-400 group-hover:border-ayur-leaf group-hover:text-ayur-leaf'
                        }`}
                      >
                        {isSelected ? '✓' : keyHint}
                      </span>
                      <span className="text-sm leading-relaxed">{option.text}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation row */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <span className="text-xs text-gray-400 hidden sm:block">
              Press 1 · 2 · 3 to select
            </span>

            {current < TOTAL - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 px-6"
              >
                ✨ See My Results
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-4 bg-red-50 border border-red-200 rounded-lg py-2">
              {error}
            </p>
          )}

          {/* Keyboard tip */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Tip: Use ← → arrow keys to navigate between questions
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Welcome Screen ───────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full mx-auto">
        {/* Floating dosha icons */}
        <div className="flex justify-center gap-6 mb-8">
          {['💨', '🔥', '🌊'].map((emoji, i) => (
            <div
              key={emoji}
              className="text-5xl"
              style={{ animation: `bounce 1.4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-ayur-bark mb-4 leading-tight">
            Discover Your<br />
            <span className="text-ayur-leaf">Dosha</span>
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-sm mx-auto mb-2">
            Answer 20 questions about your body, mind, and lifestyle to reveal your unique Ayurvedic constitution.
          </p>
          <p className="text-sm text-gray-400">
            Takes about 5 minutes · No right or wrong answers
          </p>
        </div>

        {/* Dosha preview cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Object.entries(DOSHA_META).map(([key, d]) => (
            <div
              key={key}
              className={`${d.lightBg} ${d.border} border rounded-2xl p-4 text-center`}
            >
              <div className="text-3xl mb-2">{d.emoji}</div>
              <div className="font-bold text-sm text-gray-800">{d.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{d.elements}</div>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {d.traits.slice(0, 2).map(t => (
                  <span key={t} className={`text-xs px-1.5 py-0.5 rounded-full ${d.badge}`}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
          <h3 className="font-semibold text-ayur-bark text-sm mb-3">What you'll discover</h3>
          <ul className="space-y-2">
            {[
              ['🎯', 'Your dominant dosha and what it means'],
              ['🥗', 'Personalised diet & food recommendations'],
              ['🌿', 'The best Ayurvedic herbs for your type'],
              ['🧘', 'Ideal lifestyle, exercise & yoga practices'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <span>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onStart}
          className="btn-primary w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2"
        >
          Begin the Quiz
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  )
}

// ─── Submitting / Loading Screen ──────────────────────────────
function SubmittingScreen() {
  const [dots, setDots] = useState('.')
  const messages = [
    'Calculating your dosha balance…',
    'Consulting ancient Ayurvedic wisdom…',
    'Generating your personalised plan…',
    'Almost ready…',
  ]
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const dotTimer = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    const msgTimer  = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2200)
    return () => { clearInterval(dotTimer); clearInterval(msgTimer) }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-ayur-cream to-amber-50 flex flex-col items-center justify-center px-4">
      {/* Spinning mandala / flower */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-ayur-leaf/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 rounded-full border-4 border-dashed border-ayur-gold/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">🌿</div>
      </div>

      <h2 className="text-2xl font-bold text-ayur-bark mb-2 text-center">
        {messages[msgIdx]}{dots}
      </h2>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Our AI is weaving together 5,000 years of Ayurvedic knowledge for you
      </p>

      <div className="mt-8 flex gap-2">
        {['💨', '🔥', '🌊'].map((e, i) => (
          <span key={e} className="text-2xl" style={{ animation: 'bounce 1s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}>{e}</span>
        ))}
      </div>
    </div>
  )
}
