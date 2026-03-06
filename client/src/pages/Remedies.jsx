import { useState, useEffect } from 'react'
import api from '../api'

export default function Remedies() {
  const [remedies, setRemedies] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get('/api/remedies')
      .then(({ data }) => setRemedies(data.remedies || []))
      .catch(() => setError('Could not load remedies. Make sure the server is running.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-ayur-bark mb-2">Herbal Remedies</h1>
      <p className="text-gray-500 mb-10">Time-tested Ayurvedic herbs and their healing properties.</p>

      {loading && (
        <div className="text-center py-16 text-gray-400">Loading remedies…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      )}

      {!loading && !error && remedies.length === 0 && (
        <div className="text-center py-16 text-gray-400">No remedies found.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {remedies.map((remedy) => (
          <div key={remedy._id || remedy.name} className="card hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">{remedy.emoji || '🌿'}</div>
            <h3 className="font-bold text-ayur-bark text-lg mb-1">{remedy.name}</h3>
            <span className="inline-block text-xs bg-ayur-gold/20 text-ayur-earth px-2 py-0.5 rounded-full mb-2">
              {remedy.dosha}
            </span>
            <p className="text-sm text-gray-500 leading-relaxed">{remedy.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
