import { FormEvent, useState } from 'react';

const COMPANY_LINKS = ['Home', 'Services', 'Projects', 'Blog'];
const SUPPORT_LINKS = ['Help center', 'Terms of service', 'Legal', 'Privacy policy'];

export default function WSFooter() {
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);

  function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim()) setSubbed(true);
  }

  return (
    <footer className="ws-footer" role="contentinfo" aria-label="Site footer">
      <div className="container">
        <div className="row g-5">

          {/* Brand + description + subscribe */}
          <div className="col-lg-4">
            <a href="#ws-hero" className="ws-footer-brand">
              Carvel<span> Russ</span>
            </a>
            <p className="ws-footer-desc">
              We design and build digital products that people love.
              Based globally, shipping everywhere — on time, on budget.
            </p>

            {subbed ? (
              <div
                style={{
                  background: 'rgba(99,102,241,.15)',
                  border: '1px solid rgba(99,102,241,.3)',
                  borderRadius: '999px',
                  padding: '.65rem 1.25rem',
                  fontSize: '.9rem',
                  color: '#a5b4fc',
                  fontWeight: 500,
                }}
              >
                ✓ You're subscribed — thanks!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} aria-label="Newsletter subscribe">
                <div className="ws-subscribe-wrap">
                  <input
                    type="email"
                    className="ws-subscribe-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    aria-label="Email address for newsletter"
                  />
                  <button type="submit" className="ws-subscribe-btn">
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Company links */}
          <div className="col-6 col-sm-4 col-lg-2 offset-lg-1">
            <h6>Company</h6>
            <nav aria-label="Company links">
              {COMPANY_LINKS.map(link => (
                <a key={link} href="#ws-hero" className="ws-footer-link">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Support links */}
          <div className="col-6 col-sm-4 col-lg-2">
            <h6>Support</h6>
            <nav aria-label="Support links">
              {SUPPORT_LINKS.map(link => (
                <a key={link} href="#ws-hero" className="ws-footer-link">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="col-sm-4 col-lg-3">
            <h6>Contact us</h6>
            <a href="mailto:development@astraresults.com" className="ws-footer-link">
              development@astraresults.com
            </a>
            <a href="tel:+14155551234" className="ws-footer-link">
              +1 (415) 555-1234
            </a>
            <a href="tel:+14155555678" className="ws-footer-link">
              +1 (415) 555-5678
            </a>

            {/* Social icons */}
            <div className="d-flex gap-3 mt-3">
              {[
                { label: 'Twitter / X', symbol: '𝕏' },
                { label: 'LinkedIn', symbol: 'in' },
                { label: 'GitHub', symbol: '<>' },
                { label: 'Dribbble', symbol: '◎' },
              ].map(s => (
                <a
                  key={s.label}
                  href="#ws-hero"
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(255,255,255,.08)',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: '.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '.875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background .2s, color .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,.3)';
                    e.currentTarget.style.color = '#a5b4fc';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.08)';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  {s.symbol}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Divider + copyright */}
        <hr className="ws-footer-divider" />
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <p className="ws-footer-copy">
            © {new Date().getFullYear()} Carvel Russ. All rights reserved.
          </p>
          <div className="d-flex gap-4">
            {['Privacy', 'Terms', 'Cookies'].map(link => (
              <a key={link} href="#ws-hero" className="ws-footer-link" style={{ fontSize: '.875rem', marginBottom: 0 }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
