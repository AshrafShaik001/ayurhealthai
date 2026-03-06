import { Link } from 'react-router-dom'

const features = [
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
  {
    icon: '🌞',
    title: 'Daily Routine Planner',
    description: 'Get a full AI-generated Dinacharya schedule — tongue scraping, yoga, meals, meditation, and sleep, timed to your wake-up.',
    to: '/dinacharya',
  },
]

export default function Home() {
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
        <h2 className="text-3xl font-bold text-center text-ayur-bark mb-12">What AyurHealthAI Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, description, to }) => (
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
    </>
  )
}
