import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-7xl mb-6">🌿</div>
      <h1 className="text-4xl font-bold text-ayur-bark mb-3">404 — Lost in the Forest</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist. Let's guide you back to wellness.
      </p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  )
}
