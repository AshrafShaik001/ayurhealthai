import { Link } from 'react-router-dom'
import logo from '../../logo.png'

const COL_EXPLORE = [
  { to: '/',             label: 'Home'            },
  { to: '/about',        label: 'About'           },
  { to: '/remedies',     label: 'Herbal Remedies' },
  { to: '/consultation', label: 'Consultation'    },
  { to: '/contact',      label: 'Contact Us'      },
]

const COL_FREE = [
  { to: '/quiz',     label: 'Dosha Quiz'      },
  { to: '/symptoms', label: 'Symptom Checker' },
]

const COL_PRO = [
  { to: '/dinacharya',         label: 'Daily Routine'     },
  { to: '/recommendations',    label: 'Recommendations'   },
  { to: '/recipe-finder',      label: 'Recipe Finder'     },
  { to: '/food-compatibility', label: 'Food Compatibility' },
  { to: '/seasonal-guide',     label: 'Seasonal Guide'    },
]

const linkCls = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  transition: 'color 0.15s',
}

function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        style={linkCls}
        onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a84c', flexShrink: 0, display: 'inline-block' }} />
        {label}
      </Link>
    </li>
  )
}

function ColHead({ children }) {
  return (
    <p style={{ color: '#c9a84c', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(180deg, #2e1a0e 0%, #1a0f06 100%)' }}>

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

        {/* Brand — spans 2 cols on lg */}
        <div className="col-span-2 md:col-span-4 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <img src={logo} alt="AyurHealthAI" style={{ height: 40, width: 'auto' }} />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px' }}>AyurHealthAI</span>
          </Link>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px', maxWidth: '300px' }}>
            Bridging 5,000 years of Ayurvedic wisdom with modern AI — personalised wellness for everyone.
          </p>

          {/* Founder inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3d6b1f, #c9a84c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '11px', fontWeight: 800
            }}>HR</div>
            <div>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>Haritha Reddy Boddu</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: 2 }}>Founder · Software Developer & Ayurveda Enthusiast</p>
            </div>
          </div>

          {/* Social + Email row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { href: '#', svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { href: '#', svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              { href: '#', svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            ].map((s, i) => (
              <a key={i} href={s.href} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.2)'; e.currentTarget.style.color = '#c9a84c' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >{s.svg}</a>
            ))}
            <a href="mailto:harithareddy434@gmail.com"
              style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: 4, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              harithareddy434@gmail.com
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <ColHead>Explore</ColHead>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COL_EXPLORE.map(l => <FooterLink key={l.to} {...l} />)}
          </ul>
        </div>

        {/* Free Tools */}
        <div>
          <ColHead>Free Tools</ColHead>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COL_FREE.map(l => <FooterLink key={l.to} {...l} />)}
          </ul>

          <p style={{ color: 'rgba(201,168,76,0.7)', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '18px 0 12px' }}>✨ Members</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COL_PRO.map(l => <FooterLink key={l.to} {...l} />)}
          </ul>
        </div>

        {/* CTA + Disclaimer */}
        <div>
          <ColHead>Get Started</ColHead>
          <Link to="/quiz"
            style={{ display: 'block', textAlign: 'center', padding: '9px 14px', borderRadius: 10, fontSize: '12px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3d6b1f, #5a8a3c, #c9a84c)', marginBottom: 8, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            🧬 Take Dosha Quiz
          </Link>
          <Link to="/signup"
            style={{ display: 'block', textAlign: 'center', padding: '9px 14px', borderRadius: 10, fontSize: '12px', fontWeight: 700, color: '#c9a84c', border: '1px solid rgba(201,168,76,0.35)', marginBottom: 20, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            🌿 Free Account
          </Link>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', lineHeight: 1.65 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Disclaimer:</span>{' '}
            For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px' }}>
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            © {new Date().getFullYear()} AyurHealthAI · Built with 🌿 by Haritha Reddy Boddu
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['#', 'Privacy'], ['#', 'Terms'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={label} to={to}
                style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              >{label}</Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
