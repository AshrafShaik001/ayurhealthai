export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-ayur-bark mb-6">About AyurHealthAI</h1>
      <p className="text-gray-600 leading-relaxed mb-6">
        AyurHealthAI is an AI-powered wellness platform that bridges the timeless science of Ayurveda with modern machine learning. Our mission is to make personalised Ayurvedic guidance accessible to everyone, anywhere.
      </p>
      <p className="text-gray-600 leading-relaxed mb-6">
        Ayurveda, the "science of life", is one of the world's oldest holistic healing systems, originating in India over 5,000 years ago. At its core is the belief that health is a dynamic balance between body, mind, and spirit — shaped by your unique constitution, or <em>dosha</em>.
      </p>

      <div className="grid md:grid-cols-3 gap-6 my-12">
        {[
          { dosha: 'Vata', emoji: '💨', traits: 'Creative, quick-thinking, energetic when balanced; anxious, scattered when imbalanced.' },
          { dosha: 'Pitta', emoji: '🔥', traits: 'Focused, driven, warm when balanced; irritable, inflamed when imbalanced.' },
          { dosha: 'Kapha', emoji: '🌊', traits: 'Calm, nurturing, grounded when balanced; sluggish, congested when imbalanced.' },
        ].map(({ dosha, emoji, traits }) => (
          <div key={dosha} className="card border-l-4 border-ayur-gold">
            <div className="text-3xl mb-2">{emoji}</div>
            <h3 className="font-bold text-ayur-bark text-lg mb-1">{dosha}</h3>
            <p className="text-sm text-gray-500">{traits}</p>
          </div>
        ))}
      </div>

      {/* What We Offer */}
      <h2 className="text-2xl font-bold text-ayur-bark mb-6">What We Offer</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {[
          { icon: '🧬', title: 'Dosha Quiz', desc: 'A 20-question AI-powered quiz that reveals your dominant constitution and what it means for your health.' },
          { icon: '🔍', title: 'Symptom Checker', desc: 'Describe your symptoms and receive Ayurvedic insights on dosha imbalances and targeted herbal remedies.' },
          { icon: '📊', title: 'Wellness Dashboard', desc: 'A full personalised plan covering diet, herbs, yoga, daily routine, and lifestyle — generated fresh by Claude AI.' },
          { icon: '🌞', title: 'Daily Routine Planner', desc: 'An AI-generated Dinacharya schedule timed to your wake-up, covering tongue scraping, yoga, meals, and sleep.' },
          { icon: '🌿', title: 'Herbal Remedies Library', desc: 'Browse our curated library of Ayurvedic herbs with detailed benefits, usage, and dosha suitability.' },
          { icon: '💬', title: 'AI Consultation', desc: 'Chat with our AI practitioner for deeper, personalised Ayurvedic guidance tailored to your unique needs.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
            <div>
              <h3 className="font-semibold text-ayur-bark mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Our Approach */}
      <h2 className="text-2xl font-bold text-ayur-bark mb-4">Our Approach</h2>
      <div className="bg-ayur-cream/60 border border-ayur-gold/30 rounded-2xl p-6 mb-10">
        <p className="text-gray-700 leading-relaxed mb-3">
          Every recommendation on AyurHealthAI is generated in real time by <strong>Claude AI</strong>, grounded in classical Ayurvedic texts. We don't serve static content — your dosha, your concerns, and your lifestyle shape every plan we produce.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Our goal is simple: bring 5,000 years of holistic wisdom to your fingertips, in a format that is warm, practical, and actionable for modern life.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">⚕️</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          AyurHealthAI is intended for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making changes to your health routine.
        </p>
      </div>
    </div>
  )
}
