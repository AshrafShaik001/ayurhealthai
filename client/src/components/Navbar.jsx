import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../logo.png'
import { useAuth } from '../context/AuthContext'

// ── Avatar initials ───────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

// ── Tool definitions ──────────────────────────────────────────
const FREE_TOOLS = [
  { to: '/quiz',         icon: '🧬', label: 'Dosha Quiz',        desc: 'Discover your Ayurvedic constitution'  },
  { to: '/symptoms',     icon: '🔍', label: 'Symptom Checker',   desc: 'AI-powered symptom analysis'           },
  { to: '/remedies',     icon: '🌿', label: 'Herbal Remedies',   desc: 'Browse 100+ Ayurvedic herbs & uses'    },
  { to: '/consultation', icon: '💬', label: 'Free Consultation', desc: 'Ask an Ayurvedic health question'      },
]

const PRO_TOOLS = [
  { to: '/dinacharya',         icon: '🌞', label: 'Daily Routine',      desc: 'Personalised Dinacharya planner'  },
  { to: '/recommendations',    icon: '💡', label: 'Recommendations',    desc: 'AI wellness plan for your dosha'  },
  { to: '/recipe-finder',      icon: '🍲', label: 'Recipe Finder',      desc: 'Dosha-specific healing recipes'   },
  { to: '/food-compatibility',  icon: '🥗', label: 'Food Compatibility',  desc: 'Check Ayurvedic food pairings'   },
  { to: '/seasonal-guide',     icon: '🍂', label: 'Seasonal Guide',      desc: 'Ritucharya wellness by season'   },
]

// ── Reusable active-link class ────────────────────────────────
const navCls = (isActive) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'text-ayur-leaf bg-green-50'
      : 'text-gray-600 hover:text-ayur-leaf hover:bg-gray-50'
  }`

// ── Dropdown shell ────────────────────────────────────────────
function DropBtn({ open, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
        open ? 'text-ayur-leaf bg-green-50' : 'text-gray-600 hover:text-ayur-leaf hover:bg-gray-50'
      }`}
    >
      {children}
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

// ═════════════════════════════════════════════════════════════
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [featOpen,   setFeatOpen]   = useState(false)   // guest  Features ▾
  const [toolsOpen,  setToolsOpen]  = useState(false)   // auth   Tools ▾
  const [avatarOpen, setAvatarOpen] = useState(false)   // avatar dropdown

  const featRef   = useRef(null)
  const toolsRef  = useRef(null)
  const avatarRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function onOutside(e) {
      if (featRef.current   && !featRef.current.contains(e.target))   setFeatOpen(false)
      if (toolsRef.current  && !toolsRef.current.contains(e.target))  setToolsOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const closeAll = () => {
    setMenuOpen(false)
    setFeatOpen(false)
    setToolsOpen(false)
    setAvatarOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeAll()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">

        {/* ── Logo ── */}
        <Link to="/" onClick={closeAll} className="flex items-center gap-3 flex-shrink-0">
          <img src={logo} alt="AyurHealthAI" style={{ height: '56px', width: 'auto' }} />
          <span className="text-xl font-extrabold text-ayur-leaf tracking-tight">AyurHealthAI</span>
        </Link>

        {/* ══════════════ DESKTOP CENTRE ══════════════ */}
        <div className="hidden lg:flex items-center gap-0.5">

          {isAuthenticated ? (
            /* ── Authenticated nav ── */
            <>
              <NavLink to="/dashboard" className={({ isActive }) => navCls(isActive)}>
                📊 Dashboard
              </NavLink>

              {/* Wellness dropdown */}
              <div className="relative" ref={toolsRef}>
                <DropBtn open={toolsOpen} onClick={() => setToolsOpen(p => !p)}>
                  🌿 Wellness
                </DropBtn>

                {toolsOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                    <div className="grid grid-cols-2 gap-3">

                      {/* Free */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Free Tools</p>
                        {FREE_TOOLS.map(({ to, icon, label, desc }) => (
                          <Link
                            key={to} to={to} onClick={() => setToolsOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                          >
                            <span className="text-xl mt-0.5">{icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-ayur-leaf leading-tight">{label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Members */}
                      <div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 px-1">✨ Members</p>
                        {PRO_TOOLS.map(({ to, icon, label, desc }) => (
                          <Link
                            key={to} to={to} onClick={() => setToolsOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors group"
                          >
                            <span className="text-xl mt-0.5">{icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-600 leading-tight">{label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </>

          ) : (
            /* ── Guest nav ── */
            <>
              {/* Explore dropdown */}
              <div className="relative" ref={featRef}>
                <DropBtn open={featOpen} onClick={() => setFeatOpen(p => !p)}>
                  Explore
                </DropBtn>

                {featOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                    <div className="grid grid-cols-2 gap-3">

                      {/* Free */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Free to Try</p>
                        {FREE_TOOLS.map(({ to, icon, label, desc }) => (
                          <Link
                            key={to} to={to} onClick={() => setFeatOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                          >
                            <span className="text-xl mt-0.5">{icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-ayur-leaf leading-tight">{label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Members only */}
                      <div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 px-1">✨ Members Only</p>
                        {PRO_TOOLS.map(({ to, icon, label, desc }) => (
                          <Link
                            key={to}
                            to={`/signup?redirect=${encodeURIComponent(to)}`}
                            onClick={() => setFeatOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors group"
                          >
                            <span className="text-xl mt-0.5 opacity-50">{icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-500 group-hover:text-amber-600 leading-tight">{label}</p>
                                <span className="text-[9px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">🔒 Sign Up</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                          </Link>
                        ))}

                        {/* Mini CTA */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link
                            to="/signup"
                            onClick={() => setFeatOpen(false)}
                            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
                          >
                            🌿 Get Free Access
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/about" className={({ isActive }) => navCls(isActive)}>
                About
              </NavLink>
            </>
          )}
        </div>

        {/* ══════════════ DESKTOP RIGHT ══════════════ */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">

          {isAuthenticated ? (
            /* ── Avatar + dropdown ── */
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(p => !p)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ayur-leaf to-ayur-bark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-gray-400 leading-none mt-0.5">
                    {user?.existingDosha && user.existingDosha !== 'Unknown'
                      ? `${user.existingDosha} Dosha`
                      : 'Wellness Profile'}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${avatarOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard" onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-ayur-leaf transition-colors"
                  >
                    📊 My Dashboard
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      🚪 Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Guest CTAs ── */
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 text-gray-600 hover:text-ayur-leaf font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
              >
                🌿 Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen(p => !p)}
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

      {/* ══════════════ MOBILE MENU ══════════════ */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">

          {isAuthenticated ? (
            <>
              {/* User card */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-green-50 rounded-xl mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ayur-leaf to-ayur-bark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {user?.existingDosha && user.existingDosha !== 'Unknown'
                      ? `${user.existingDosha} Dosha`
                      : user?.email}
                  </p>
                </div>
              </div>

              <NavLink to="/dashboard" onClick={closeAll} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                📊 Dashboard
              </NavLink>

              <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Free Tools</p>
              {FREE_TOOLS.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} onClick={closeAll} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>{icon}</span> {label}
                </NavLink>
              ))}

              <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">✨ Members</p>
              {PRO_TOOLS.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} onClick={closeAll} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-amber-600 bg-amber-50' : 'text-gray-700 hover:bg-amber-50'}`}>
                  <span>{icon}</span> {label}
                </NavLink>
              ))}

              <div className="border-t border-gray-100 pt-2 mt-2">
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  🚪 Log out
                </button>
              </div>
            </>

          ) : (
            <>
              <p className="px-3 pt-1 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Free to Try</p>
              {FREE_TOOLS.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} onClick={closeAll} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>{icon}</span> {label}
                </NavLink>
              ))}

              <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">✨ Members Only</p>
              {PRO_TOOLS.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={`/signup?redirect=${encodeURIComponent(to)}`}
                  onClick={closeAll}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-amber-50 transition-colors"
                >
                  <span>{icon}</span> {label}
                  <span className="ml-auto text-[9px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.5 rounded-full">🔒</span>
                </Link>
              ))}

              <NavLink to="/about" onClick={closeAll} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-ayur-leaf bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                ℹ️ About
              </NavLink>

              <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                <Link to="/login" onClick={closeAll} className="block text-center text-ayur-leaf rounded-xl py-2.5 text-sm font-semibold hover:bg-green-50 transition-colors">
                  Log In
                </Link>
                <Link
                  to="/signup" onClick={closeAll}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
                >
                  🌿 Get Started Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
