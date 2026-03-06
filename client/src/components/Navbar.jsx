import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../../logo.png'

const navLinks = [
  { to: '/quiz',            label: 'Dosha Quiz',       icon: '✨' },
  { to: '/symptoms',        label: 'Symptom Checker',  icon: '🔍' },
  { to: '/dinacharya',      label: 'Daily Routine',    icon: '🌞' },
  { to: '/recommendations', label: 'Dashboard',        icon: '📊' },
  { to: '/remedies',        label: 'Remedies',         icon: '🌿' },
  { to: '/about',           label: 'About',            icon: 'ℹ️' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={logo} alt="AyurHealthAI" style={{ height: '56px', width: 'auto' }} />
          <span className="text-xl font-extrabold text-ayur-leaf tracking-tight">AyurHealthAI</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-ayur-leaf bg-green-50'
                      : 'text-gray-600 hover:text-ayur-leaf hover:bg-gray-50'
                  }`
                }
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:block flex-shrink-0">
          <Link to="/consultation" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
            <span>💬</span> Consultation
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-600'
              }`
            }
          >
            🏠 Home
          </NavLink>
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-600'
                }`
              }
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
          <Link
            to="/consultation"
            onClick={() => setMenuOpen(false)}
            className="btn-primary flex items-center justify-center gap-2 text-sm mt-2"
          >
            <span>💬</span> Consultation
          </Link>
        </div>
      )}
    </nav>
  )
}
