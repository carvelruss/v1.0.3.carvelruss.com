import { FiArrowRight, FiAward } from 'react-icons/fi';

const PARTNERS = ['Clutch', 'Deloitte', 'Vue.js', 'Awwwards', 'Google', 'Stripe'];

export default function WSHero() {
  return (
    <section id="ws-hero" className="ws-hero blob-bg">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* Left: headline + CTAs */}
          <div className="col-lg-6">
            <div className="ws-hero-badge ws-fade-up" aria-label="Award-winning web studio">
              <FiAward size={14} aria-hidden="true" />
              Award‑winning web studio
            </div>

            <h1 className="hero-title ws-fade-up ws-du-1">
              Web studio of<br />
              <span className="text-gradient">effective</span><br />
              development
            </h1>

            <p
              className="ws-fade-up ws-du-2"
              style={{
                fontSize: '1.125rem',
                color: 'var(--ws-body)',
                lineHeight: 1.75,
                maxWidth: '480px',
                marginTop: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              We build websites, tools and applications that offer beautiful
              web presence and ultimate user experience.
            </p>

            <div className="d-flex flex-wrap gap-3 ws-fade-up ws-du-2">
              <a href="#ws-contact" className="ws-btn-primary">
                Let's partner
                <FiArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="#ws-case-studies" className="ws-btn-secondary">
                View Case Studies
              </a>
            </div>

            <div className="ws-hero-bullets ws-fade-up ws-du-3">
              <div className="ws-hero-bullet">Full spectrum of services</div>
              <div className="ws-hero-bullet">Flexible work terms</div>
            </div>
          </div>

          {/* Right: floating card composition */}
          <div className="col-lg-6">
            <div className="ws-hero-visual" aria-hidden="true">

              {/* Floating badge — top left */}
              <div className="ws-float-badge ws-float-badge-top">
                <svg width="14" height="14" fill="#22c55e" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                5‑star rated studio
              </div>

              {/* Floating badge — mid right */}
              <div className="ws-float-badge ws-float-badge-mid">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1z"/>
                </svg>
                200+ projects delivered
              </div>

              {/* Main card */}
              <div className="ws-float-card ws-float-card-main">
                <div className="text-center p-4 p-lg-5">
                  <div
                    style={{
                      width: 80, height: 80, borderRadius: '1.25rem',
                      background: 'rgba(99,102,241,.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1rem',
                      fontSize: '2.5rem',
                    }}
                  >
                    🎨
                  </div>
                  <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: '1.125rem' }}>
                    Design Excellence
                  </div>
                  <div style={{ fontSize: '.875rem', color: '#818cf8', marginTop: '.35rem' }}>
                    UI/UX &amp; Development
                  </div>
                  {/* mini metrics */}
                  <div className="d-flex justify-content-center gap-4 mt-4">
                    {[['98%', 'Satisfaction'], ['4.2wk', 'Avg delivery'], ['5★', 'Rating']].map(([val, lbl]) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#4f46e5' }}>{val}</div>
                        <div style={{ fontSize: '.7rem', color: '#818cf8' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom-left card */}
              <div className="ws-float-card ws-float-card-accent">
                <div className="p-3 d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: '.75rem',
                      background: 'rgba(34,197,94,.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', flexShrink: 0,
                    }}
                  >
                    📱
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.9375rem', color: '#166534', lineHeight: 1.2 }}>Mobile First</div>
                    <div style={{ fontSize: '.8125rem', color: '#16a34a', marginTop: '.1rem' }}>Responsive &amp; fast</div>
                  </div>
                </div>
              </div>

              {/* Bottom-right card */}
              <div className="ws-float-card ws-float-card-sm">
                <div className="p-3 d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: '.625rem',
                      background: 'rgba(249,115,22,.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0,
                    }}
                  >
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#9a3412', lineHeight: 1.2 }}>Fast delivery</div>
                    <div style={{ fontSize: '.75rem', color: '#c2410c', marginTop: '.1rem' }}>2–4 weeks</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Partner strip */}
        <div className="ws-partner-strip">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <span className="ws-partner-label">Trusted by</span>
            {PARTNERS.map(name => (
              <span key={name} className="ws-partner-logo">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
