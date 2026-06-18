import { FiArrowRight, FiAward, FiStar, FiBriefcase, FiZap } from 'react-icons/fi';

const PARTNERS = ['Clutch', 'Deloitte', 'Vue.js', 'Awwwards', 'Google', 'Stripe'];

export default function WSHero() {
  return (
    <section id="ws-hero" className="ws-hero blob-bg">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* Left: headline + CTAs */}
          <div className="col-lg-6">
            <div className="ws-hero-badge ws-fade-up" aria-label="Award-winning web studio">
              <FiAward size={15} aria-hidden="true" />
              Award‑winning developer
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
                maxWidth: '500px',
                marginTop: '1.5rem',
                marginBottom: '2.25rem',
                fontWeight: 400,
              }}
            >
              We craft premium digital experiences that blend beautiful design with exceptional performance. Every pixel matters.
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
              <div className="ws-hero-bullet">Premium quality delivery</div>
            </div>
          </div>

          {/* Right: floating card composition */}
          <div className="col-lg-6">
            <div className="ws-hero-visual" aria-hidden="true">

              {/* Floating badge — top left */}
              <div className="ws-float-badge ws-float-badge-top">
                <FiStar size={14} aria-hidden="true" style={{ color: '#22c55e' }} />
                5‑star rated studio
              </div>

              {/* Floating badge — mid right */}
              <div className="ws-float-badge ws-float-badge-mid">
                <FiBriefcase size={13} aria-hidden="true" />
                200+ projects delivered
              </div>

              {/* Main card */}
              <div className="ws-float-card ws-float-card-main">
                <div className="text-center p-4 p-lg-5">
                  <div
                    style={{
                      width: 88, height: 88, borderRadius: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontSize: '2.75rem',
                    }}
                  >
                    🎨
                  </div>
                  <div style={{ fontWeight: 700, color: '#1d1d1f', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                    Design Excellence
                  </div>
                  <div style={{ fontSize: '.9375rem', color: '#86868b', marginTop: '.5rem', fontWeight: 500 }}>
                    UI/UX &amp; Development
                  </div>
                  {/* mini metrics */}
                  <div className="d-flex justify-content-center gap-4 mt-4">
                    {[['98%', 'Satisfaction'], ['4.2wk', 'Avg delivery'], ['5★', 'Rating']].map(([val, lbl]) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1d1d1f', letterSpacing: '-0.02em' }}>{val}</div>
                        <div style={{ fontSize: '.75rem', color: '#86868b', fontWeight: 500, marginTop: '.15rem' }}>{lbl}</div>
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
                      width: 48, height: 48, borderRadius: '.875rem',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.625rem', flexShrink: 0,
                    }}
                  >
                    📱
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1d1d1f', lineHeight: 1.2, letterSpacing: '-0.01em' }}>Mobile First</div>
                    <div style={{ fontSize: '.875rem', color: '#86868b', marginTop: '.15rem', fontWeight: 500 }}>Responsive &amp; fast</div>
                  </div>
                </div>
              </div>

              {/* Bottom-right card */}
              <div className="ws-float-card ws-float-card-sm">
                <div className="p-3 d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: '.75rem',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.375rem', flexShrink: 0,
                    }}
                  >
                    <FiZap size={20} style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.9375rem', color: '#1d1d1f', lineHeight: 1.2, letterSpacing: '-0.01em' }}>Fast delivery</div>
                    <div style={{ fontSize: '.8125rem', color: '#86868b', marginTop: '.15rem', fontWeight: 500 }}>2–4 weeks</div>
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
