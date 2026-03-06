import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Open features (available to everyone) ────────────────────
const openFeatures = [
  {
    icon: '🧬',
    title: 'Dosha Analysis',
    description: 'Discover your unique mind-body constitution (Vata, Pitta, Kapha) through our AI-powered quiz.',
    to: '/quiz',
  },
  {
    icon: '🔍',
    title: 'Symptom Checker',
    description: 'Select your symptoms and let Claude AI identify your dosha imbalance with targeted remedies and herbs.',
    to: '/symptoms',
  },
  {
    icon: '🌞',
    title: 'Daily Routine Planner',
    description: 'Get a full AI-generated Dinacharya schedule — tongue scraping, yoga, meals, meditation, and sleep, timed to your wake-up.',
    to: '/dinacharya',
  },
  {
    icon: '🗂️',
    title: 'Wellness Dashboard',
    description: 'Get a full personalised dashboard — diet, daily routine, herbs, yoga, and lifestyle corrections.',
    to: '/recommendations',
  },
  {
    icon: '🌿',
    title: 'Herbal Remedies',
    description: 'Explore our library of Ayurvedic herbs and their healing properties for all three doshas.',
    to: '/remedies',
  },
]

// ── Locked features (require account) ────────────────────────
const lockedFeatures = [
  {
    icon: '🍲',
    title: 'Ayurvedic Recipe Finder',
    description: 'Discover healing recipes tailored to your dosha type — personalised meal plans crafted by AI.',
    to: '/recipe-finder',
    badge: 'Members Only',
  },
  {
    icon: '🥗',
    title: 'Food Compatibility',
    description: 'Find out which foods harmonise with your constitution and which ones to avoid for optimal health.',
    to: '/food-compatibility',
    badge: 'Members Only',
  },
  {
    icon: '🍂',
    title: 'Seasonal Wellness Guide',
    description: 'Adapt your lifestyle to the rhythms of every season with personalised Ayurvedic seasonal routines.',
    to: '/seasonal-guide',
    badge: 'Members Only',
  },
]

// ── Lock Modal ────────────────────────────────────────────────
function LockModal({ feature, onClose }) {
  const navigate = useNavigate()
  if (!feature) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ayur-leaf to-ayur-bark flex items-center justify-center text-3xl shadow-md mx-auto mb-5">
          🔒
        </div>

        {/* Feature icon + name */}
        <div className="text-3xl mb-2">{feature.icon}</div>
        <h3 className="text-xl font-bold text-ayur-bark mb-2">{feature.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Create a free account to unlock <strong>{feature.title}</strong> and all other members-only features.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/signup?redirect=${encodeURIComponent(feature.to)}`)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
          >
            ✨ Create Free Account
          </button>
          <button
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(feature.to)}&message=Please+login+to+access+this+feature`)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-ayur-leaf border-2 border-ayur-leaf hover:bg-green-50 transition-colors active:scale-95"
          >
            Log In
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">Free forever. No credit card required.</p>
      </div>
    </div>
  )
}

// ── Home Page ─────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth()
  const [lockedModal, setLockedModal] = useState(null) // holds the clicked locked feature object

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ayur-leaf to-primary-800 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            AI × Ayurveda
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Ancient Wisdom,<br />Modern Intelligence
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            AyurHealthAI combines the 5,000-year-old science of Ayurveda with cutting-edge AI to deliver personalised wellness guidance — right to your fingertips.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/quiz" className="bg-white text-ayur-leaf font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors">
              Take the Dosha Quiz ✨
            </Link>
            <Link to="/about" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-ayur-bark mb-3">What AyurHealthAI Offers</h2>
        <p className="text-center text-gray-500 text-sm mb-12">
          Free tools available to everyone — plus exclusive features for members.
        </p>

        {/* ── Open Features ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {openFeatures.map(({ icon, title, description, to }) => (
            <Link key={title} to={to} className="card hover:shadow-lg transition-all hover:-translate-y-1 group">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-lg font-semibold text-ayur-bark mb-2 group-hover:text-ayur-leaf transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              <span className="text-xs text-ayur-leaf font-semibold mt-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                Get started →
              </span>
            </Link>
          ))}
        </div>

        {/* ── Members-Only label ── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 whitespace-nowrap">
            🔒 Members Only
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── Locked Features ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lockedFeatures.map((feature) => {
            const { icon, title, description, to, badge } = feature

            // Logged-in users get a real link
            if (isAuthenticated) {
              return (
                <Link key={title} to={to} className="card hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{icon}</div>
                    <span className="text-xs font-bold bg-ayur-leaf/10 text-ayur-leaf px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-ayur-bark mb-2 group-hover:text-ayur-leaf transition-colors">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  <span className="text-xs text-ayur-leaf font-semibold mt-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started →
                  </span>
                </Link>
              )
            }

            // Guests see locked cards
            return (
              <button
                key={title}
                onClick={() => setLockedModal(feature)}
                className="card text-left hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden cursor-pointer w-full"
              >
                {/* Subtle locked overlay */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <span className="text-sm font-bold text-ayur-bark bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    🔒 Login to unlock
                  </span>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl opacity-70">{icon}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      🔒 {badge}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-ayur-bark mb-2 opacity-80">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </button>
            )
          })}
        </div>

        {/* ── Sign-up nudge for guests ── */}
        {!isAuthenticated && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Unlock all 3 members-only features — free, forever.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
            >
              ✨ Create Free Account
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-ayur-gold/10 border-y border-ayur-gold/20 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-ayur-bark mb-4">Start Your Wellness Journey Today</h2>
          <p className="text-gray-600 mb-8">Take the dosha quiz to discover your constitution — or check your symptoms for instant AI-powered Ayurvedic guidance.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/quiz" className="btn-primary inline-flex items-center gap-2">
              <span>✨</span> Take the Dosha Quiz
            </Link>
            <Link to="/symptoms" className="btn-secondary inline-flex items-center gap-2">
              <span>🔍</span> Check My Symptoms
            </Link>
          </div>
        </div>
      </section>

      {/* Lock Modal */}
      <LockModal feature={lockedModal} onClose={() => setLockedModal(null)} />
    </>
  )
}
