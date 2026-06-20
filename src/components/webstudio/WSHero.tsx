import { Link } from 'react-router-dom';

export default function WSHero() {
  return (
    <section className="pf-hero">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* Left column */}
          <div className="col-lg-6">
            <div className="pf-hero__eyebrow">UI/UX DEVELOPER</div>

            <h1 className="pf-hero__title">
              Designing Meaningful<br />
              <em>Digital Experiences</em>
            </h1>

            <p className="pf-hero__sub">
              I create clean, user-centered interfaces that solve problems and drive results.
            </p>

            <div className="pf-hero__ctas">
              <Link to="/case-studies" className="ws-btn-primary">View Case Studies</Link>
              <Link to="/contact" className="ws-btn-secondary">Contact Me</Link>
            </div>
          </div>

          {/* Right column — decorative */}
          <div className="col-lg-6" aria-hidden="true">
            <div className="pf-hero__visual">
              <div className="pf-hero__preview">

                {/* Floating typography card */}
                <div className="pf-hero__type-card">
                  <span className="pf-hero__type-sample">Aa</span>
                  <span className="pf-hero__type-label">Typography</span>
                </div>

                {/* Main dark dashboard card */}
                <div className="pf-hero__card">
                  <div className="pf-hero__card-header">
                    <span className="pf-hero__card-dot"></span>
                    <span className="pf-hero__card-dot"></span>
                    <span className="pf-hero__card-dot"></span>
                    <span className="pf-hero__card-title">DASHBOARD</span>
                  </div>

                  <div className="pf-hero__card-body">
                    {/* Stats row */}
                    <div className="pf-hero__card-stat">
                      <span className="pf-hero__card-stat-label">Visitors</span>
                      <span className="pf-hero__card-stat-value">8,392</span>
                      <span className="pf-hero__card-stat-delta">+12%</span>
                    </div>
                    <div className="pf-hero__card-stat">
                      <span className="pf-hero__card-stat-label">Conversion</span>
                      <span className="pf-hero__card-stat-value">3.2%</span>
                      <span className="pf-hero__card-stat-delta">+8%</span>
                    </div>

                    {/* Bar chart */}
                    <div className="pf-hero__bar-group">
                      <div className="pf-hero__bar-item">
                        <span className="pf-hero__bar-label">UI</span>
                        <div className="pf-hero__bar-track">
                          <div className="pf-hero__bar-fill" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div className="pf-hero__bar-item">
                        <span className="pf-hero__bar-label">UX</span>
                        <div className="pf-hero__bar-track">
                          <div className="pf-hero__bar-fill" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div className="pf-hero__bar-item">
                        <span className="pf-hero__bar-label">Dev</span>
                        <div className="pf-hero__bar-track">
                          <div className="pf-hero__bar-fill" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating color swatch card */}
                <div className="pf-hero__swatch-card">
                  <span className="pf-hero__swatch" style={{ background: '#6366f1' }}></span>
                  <span className="pf-hero__swatch" style={{ background: '#818cf8' }}></span>
                  <span className="pf-hero__swatch" style={{ background: '#1d1d1f' }}></span>
                  <span className="pf-hero__swatch" style={{ background: '#f5f5f7' }}></span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
