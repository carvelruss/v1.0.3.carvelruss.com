import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_COL = [
  { label: 'Home',         href: '/',             type: 'route' },
  { label: 'About',        href: '/#about',       type: 'hash'  },
  { label: 'Skills',       href: '/#skills',      type: 'hash'  },
  { label: 'Case Studies', href: '/case-studies', type: 'route' },
  { label: 'Blog',         href: '/blog',         type: 'route' },
  { label: 'Contact',      href: '/#contact',     type: 'hash'  },
];

const SERVICES_COL = [
  'UI/UX Design',
  'Frontend Development',
  'Design Systems',
  'Prototyping',
  'User Research',
  'Responsive Design',
];

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string, type: string) => {
    if (type === 'route') {
      navigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (window.location.pathname !== '/') {
        navigate('/');
        const id = href.slice(2);
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <footer className="footer" role="contentinfo">
        {/* ── Main grid ── */}
        <div className="container-site footer__main">

          {/* Col 1: Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              dev<span>folio</span><span className="footer__logo-dot">.</span>
            </div>
            <p className="footer__tagline">
              UI/UX Developer crafting clean, user-focused digital experiences from pixel-perfect design to production-ready code.
            </p>
            <div className="footer__socials">
              <a href="https://github.com/yourname" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com/in/yourname" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="mailto:hello@carvelruss.com" className="footer__social" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigate */}
          <div className="footer__col">
            <h4 className="footer__col-title">Navigate</h4>
            <ul className="footer__col-list">
              {NAV_COL.map(link => (
                <li key={link.href}>
                  <button
                    className="footer__col-link"
                    onClick={() => handleNavClick(link.href, link.type)}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="footer__col">
            <h4 className="footer__col-title">Services</h4>
            <ul className="footer__col-list">
              {SERVICES_COL.map(s => (
                <li key={s}><span className="footer__col-link">{s}</span></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__col-list footer__col-list--contact">
              <li>
                <span className="footer__contact-label">Email</span>
                <a href="mailto:hello@carvelruss.com" className="footer__contact-value">hello@carvelruss.com</a>
              </li>
              <li>
                <span className="footer__contact-label">Availability</span>
                <span className="footer__contact-value footer__available">Open to work</span>
              </li>
              <li>
                <span className="footer__contact-label">Based in</span>
                <span className="footer__contact-value">Philippines</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="footer__bottom">
          <div className="container-site footer__bottom-inner">
            <p className="footer__copy">© {year} Carvel Russ. All rights reserved.</p>
            <nav className="footer__bottom-links" aria-label="Legal links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
            </nav>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <button
        className={`footer__scroll-top${showTop ? ' is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </>
  );
}
