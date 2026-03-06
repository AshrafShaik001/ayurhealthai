import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ayur-bark text-ayur-cream mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold">AyurHealthAI</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Bridging ancient Ayurvedic wisdom with modern AI to guide you toward holistic wellness.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-ayur-gold">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {[['/', 'Home'], ['/consultation', 'Consultation'], ['/remedies', 'Remedies'], ['/about', 'About']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-ayur-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-ayur-gold">Disclaimer</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            AyurHealthAI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-600 text-center text-xs text-gray-500 py-4">
        &copy; {new Date().getFullYear()} AyurHealthAI. All rights reserved.
      </div>
    </footer>
  )
}
