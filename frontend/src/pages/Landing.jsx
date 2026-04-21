import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Bank-grade encryption',
    desc: 'All your assets are encrypted at rest and in transit.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'All asset types',
    desc: 'Stocks, FDs, gold, real estate — track it all in one place.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
    title: 'Maturity tracking',
    desc: 'Never miss an FD maturity or investment deadline again.',
  },
]

const mockAssets = [
  { icon: '📈', name: 'Nifty 50 Index',    type: 'Mutual Fund',            value: '₹8,40,000', change: '+18.2%',  up: true,  color: '#6366f1' },
  { icon: '🏦', name: 'SBI Fixed Deposit', type: 'FD · Matures Jan 2026', value: '₹5,00,000', change: '7.1% p.a.', up: true, color: '#34d399' },
  { icon: '🪙', name: 'Digital Gold',      type: 'Commodity',              value: '₹2,15,000', change: '+4.6%',   up: true,  color: '#fbbf24' },
  { icon: '🏠', name: 'REITs',             type: 'Real Estate',            value: '₹9,26,500', change: '-1.2%',   up: false, color: '#f87171' },
]

export default function Landing() {
  const { user } = useAuth()
  const glowRef = useRef(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el || window.innerWidth < 768) return
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30
      el.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e2f0', fontFamily: 'DM Sans, sans-serif' }}>

      {/* noise overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(30,30,46,0.6)' }}>
        <div className="l-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: '#6366f1', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 17, color: '#e2e2f0', letterSpacing: '-0.3px' }}>Vaultix</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <Link to="/app/dashboard" style={s.btnPrimary}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/login" style={s.btnGhost}>Sign in</Link>
                <Link to="/signup" style={s.btnPrimary}>Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div ref={glowRef} style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          transition: 'transform 0.15s ease-out',
        }} />
        <div className="l-hero">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 99, padding: '4px 12px', marginBottom: 22,
            fontSize: 12, color: '#a5b4fc', fontWeight: 500,
            animation: 'fadeUp 0.5s ease both',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1', flexShrink: 0 }} />
            Personal finance, secured
          </div>

          <h1 className="l-h1">
            Your vault for every<br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>asset you own</span>
          </h1>

          <p className="l-sub">
            Track investments, fixed deposits, gold, and more — with maturity alerts and a clean dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.3s ease both', opacity: 0 }}>
            <Link to="/signup" style={{ ...s.btnPrimary, padding: '11px 28px', fontSize: 14 }}>Start for free →</Link>
            <Link to="/login"  style={{ ...s.btnOutline, padding: '11px 24px', fontSize: 14 }}>Sign in</Link>
          </div>
        </div>
      </section>

      {/* ── MOCK DASHBOARD PREVIEW ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px 64px' }}>
        <div className="l-section">
          <div style={{
            background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 16,
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.06)',
            animation: 'fadeUp 0.6s 0.4s ease both', opacity: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 4 }}>Total portfolio</div>
                <div className="l-portfolio-val">₹24,81,500</div>
              </div>
              <div style={{
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#818cf8', fontWeight: 500, flexShrink: 0,
              }}>+12.4% overall</div>
            </div>

            {mockAssets.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                background: '#0d0d14', border: '1px solid #1a1a28', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  }}>{a.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e2f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                    <div className="l-asset-type">{a.type}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e2f0' }}>{a.value}</div>
                  <div style={{ fontSize: 11, color: a.up ? '#34d399' : '#f87171', marginTop: 1 }}>{a.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px 80px' }}>
        <div className="l-section">
          <div className="l-features">
            {features.map((f, i) => (
              <div key={i} className="l-feat-card"
                style={{ animation: `fadeUp 0.5s ${0.5 + i * 0.1}s ease both`, opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818cf8', marginBottom: 14, flexShrink: 0,
                }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e2f0', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6b6b8a', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 16px 80px' }}>
        <div className="l-section">
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 18,
            padding: '40px 20px', textAlign: 'center',
            animation: 'fadeUp 0.5s 0.7s ease both', opacity: 0,
          }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 600, color: '#e2e2f0', letterSpacing: '-0.5px', margin: '0 0 10px' }}>
              Ready to take control?
            </h2>
            <p style={{ color: '#6b6b8a', fontSize: 14, margin: '0 0 24px' }}>Free to use. No credit card required.</p>
            <Link to="/signup" style={{ ...s.btnPrimary, padding: '11px 32px', fontSize: 14 }}>
              Create your vault →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 1, borderTop: '1px solid #1e1e2e',
        padding: '20px 16px', textAlign: 'center', color: '#3a3a5a', fontSize: 12,
      }}>
        © {new Date().getFullYear()} Vaultix. Built with care.
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .l-nav {
          max-width: 1080px; margin: 0 auto;
          padding: 14px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .l-section { max-width: 860px; margin: 0 auto; }
        .l-hero {
          max-width: 700px; margin: 0 auto;
          padding: 52px 16px 52px;
          text-align: center; position: relative;
        }
        .l-h1 {
          font-size: clamp(30px, 7vw, 58px);
          font-weight: 600; line-height: 1.1; letter-spacing: -1.5px;
          color: #e2e2f0; margin: 0 0 16px;
          animation: fadeUp 0.5s 0.1s ease both; opacity: 0;
        }
        .l-sub {
          font-size: clamp(13px, 2.5vw, 16px); color: #6b6b8a; line-height: 1.7;
          max-width: 420px; margin: 0 auto 28px;
          animation: fadeUp 0.5s 0.2s ease both; opacity: 0;
        }
        .l-portfolio-val {
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 600; color: #e2e2f0; letter-spacing: -0.5px;
        }
        .l-asset-type {
          font-size: 11px; color: #6b6b8a; margin-top: 1px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 160px;
        }
        .l-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .l-feat-card {
          background: #111118; border: 1px solid #1e1e2e;
          border-radius: 14px; padding: 20px;
          transition: border-color 0.2s;
        }

        /* ── tablet ── */
        @media (max-width: 768px) {
          .l-features { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .l-asset-type { max-width: 120px; }
        }

        /* ── mobile ── */
        @media (max-width: 480px) {
          .l-nav { padding: 12px 14px; }
          .l-hero { padding: 40px 14px 40px; }
          .l-features { grid-template-columns: 1fr; gap: 10px; }
          .l-feat-card { padding: 16px; }
          .l-asset-type { max-width: 100px; }
        }
      `}</style>
    </div>
  )
}

const s = {
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center',
    background: '#6366f1', color: '#fff',
    padding: '8px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, textDecoration: 'none',
    fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center',
    color: '#6b6b8a', background: 'transparent',
    padding: '8px 10px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, textDecoration: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
  btnOutline: {
    display: 'inline-flex', alignItems: 'center',
    color: '#818cf8', background: 'transparent',
    border: '1px solid rgba(99,102,241,0.3)',
    padding: '8px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, textDecoration: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
}