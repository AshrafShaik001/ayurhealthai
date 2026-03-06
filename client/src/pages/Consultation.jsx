import { useState } from 'react'
import api from '../api'

const questions = [
  { id: 'name',     label: 'Your Name',             type: 'text',   placeholder: 'e.g. Arjun Sharma' },
  { id: 'email',    label: 'Email Address',          type: 'email',  placeholder: 'you@example.com' },
  { id: 'age',      label: 'Age',                    type: 'number', placeholder: '25' },
  { id: 'concern',  label: 'Primary Health Concern', type: 'text',   placeholder: 'e.g. digestion, stress, sleep' },
]

const doshaOptions = ['Vata', 'Pitta', 'Kapha', 'Not sure']

export default function Consultation() {
  const [form, setForm]       = useState({ name: '', email: '', age: '', concern: '', dosha: '' })
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const { data } = await api.post('/api/consultation', form)
      setMessage(data.message || 'Consultation submitted successfully!')
      setStatus('success')
      setForm({ name: '', email: '', age: '', concern: '', dosha: '' })
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-ayur-bark mb-2">AI Consultation</h1>
      <p className="text-gray-500 mb-8">Fill in the form below and our AI will craft a personalised Ayurvedic recommendation for you.</p>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {questions.map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              value={form[id]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayur-leaf"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosha (if known)</label>
          <div className="flex flex-wrap gap-2">
            {doshaOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForm({ ...form, dosha: d })}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  form.dosha === d
                    ? 'bg-ayur-leaf text-white border-ayur-leaf'
                    : 'border-gray-300 text-gray-600 hover:border-ayur-leaf'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full disabled:opacity-60"
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Consultation'}
        </button>
      </form>
    </div>
  )
}
