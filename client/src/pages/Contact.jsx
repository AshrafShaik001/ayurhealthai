import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // Opens user's mail client with pre-filled content
    const body = `Name: ${form.name}%0AEmail: ${form.email}%0A%0A${form.message}`
    window.location.href = `mailto:harithareddy434@gmail.com?subject=${encodeURIComponent(form.subject || 'AyurHealthAI Enquiry')}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fdf8f0 0%, #f0f7e8 100%)' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2e1a0e 0%, #3d6b1f 60%, #1c1008 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a84c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5a8a3c 0%, transparent 50%)'
        }} />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="inline-block text-xs font-bold tracking-[3px] uppercase px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(201,168,76,0.2)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
            We'd Love to Hear From You
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Get in Touch
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Have a question, feedback, or just want to say hello? Haritha personally reads every message.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">

        {/* ── Left: Founder Card + Info ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Founder Card */}
          <div className="rounded-2xl p-6 shadow-xl" style={{ background: 'linear-gradient(145deg, #2e1a0e, #3d280e)' }}>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3d6b1f, #c9a84c)', color: '#fff' }}
              >
                HR
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">Haritha Reddy Boddu</p>
                <p className="text-sm mt-0.5" style={{ color: '#c9a84c' }}>Founder & Creator</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Software Developer · Ayurveda Enthusiast</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Haritha is a software developer who has woven Ayurveda into every aspect of her life — from her morning rituals to the recipes she prepares daily. Having helped countless friends and family members through Ayurvedic guidance, she built AyurHealthAI to bring this wisdom to everyone.
            </p>
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <a
                href="mailto:harithareddy434@gmail.com"
                className="flex items-center gap-3 text-sm transition-all hover:opacity-80"
                style={{ color: '#c9a84c' }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.15)' }}>
                  ✉️
                </span>
                harithareddy434@gmail.com
              </a>
            </div>
          </div>

          {/* Contact info tiles */}
          {[
            { icon: '⚡', title: 'Quick Response', desc: 'We typically reply within 24–48 hours on working days.' },
            { icon: '🌿', title: 'Ayurveda Queries', desc: 'Questions about your dosha or any feature? We love hearing from you.' },
            { icon: '🐛', title: 'Bug Reports', desc: "Found an issue? Let us know and we'll fix it right away." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: '#2d5016' }}>{title}</p>
                <p className="text-xs mt-1 leading-relaxed text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: Contact Form ── */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">

            {sent ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-5">🌿</div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2d5016' }}>Message Sent!</h2>
                <p className="text-gray-500 mb-6">Your mail client has opened with the pre-filled message. Haritha will get back to you soon.</p>
                <button
                  onClick={() => setSent(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #3d6b1f, #5a8a3c)' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#2d5016' }}>Send a Message</h2>
                <p className="text-sm text-gray-500 mb-8">Fill in the form and your mail client will open with everything pre-filled.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#3d6b1f' }}>
                        Your Name
                      </label>
                      <input
                        type="text" name="name" required
                        value={form.name} onChange={handleChange}
                        placeholder="Arjun Sharma"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2"
                        style={{ border: '1.5px solid #e5e7eb', '--tw-ring-color': '#3d6b1f33' }}
                        onFocus={e => e.target.style.borderColor = '#3d6b1f'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#3d6b1f' }}>
                        Your Email
                      </label>
                      <input
                        type="email" name="email" required
                        value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
                        style={{ border: '1.5px solid #e5e7eb' }}
                        onFocus={e => e.target.style.borderColor = '#3d6b1f'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#3d6b1f' }}>
                      Subject
                    </label>
                    <input
                      type="text" name="subject"
                      value={form.subject} onChange={handleChange}
                      placeholder="e.g. Question about my Dosha results"
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
                      style={{ border: '1.5px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#3d6b1f'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#3d6b1f' }}>
                      Message
                    </label>
                    <textarea
                      name="message" required rows={6}
                      value={form.message} onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all resize-none"
                      style={{ border: '1.5px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#3d6b1f'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
                  >
                    ✉️ Send Message
                  </button>

                  <p className="text-xs text-center text-gray-400">
                    This will open your mail client with the message pre-filled.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="text-center pb-16 px-6">
        <p className="text-sm text-gray-500">
          Prefer to explore first?{' '}
          <Link to="/quiz" className="font-bold" style={{ color: '#3d6b1f' }}>
            Take the free Dosha Quiz →
          </Link>
        </p>
      </div>

    </div>
  )
}
