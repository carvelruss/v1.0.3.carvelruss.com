import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',         to: '/'              },
  { label: 'Case Studies', to: '/case-studies'  },
  { label: 'Blog',         to: '/blog'          },
  { label: 'Skills',       to: '/skills'        },
];

export default function WSHeader() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 992) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--ws-violet)' : 'var(--ws-charcoal)',
    fontWeight: isActive ? 600 : 500,
    fontSize: '.9375rem',
    textDecoration: 'none',
    padding: '.5rem .875rem',
    borderRadius: '.5rem',
    transition: 'color .25s cubic-bezier(0.4, 0, 0.2, 1), background .25s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
  });

  return (
    <>
      <header
        className="ws-navbar"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.72)',
          backdropFilter: 'saturate(180%) blur(24px) brightness(1.02)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px) brightness(1.02)',
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)' : 'none',
          transition: 'background .4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter .4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-3">

            {/* Brand */}
            <Link to="/" className="ws-brand" style={{ transition: 'opacity .25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              Carvel<span> Russ</span>
            </Link>

            {/* Desktop nav */}
            <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  style={navLinkStyle}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--ws-violet)';
                    el.style.background = 'rgba(99, 102, 241, 0.06)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    const active = el.getAttribute('aria-current') === 'page';
                    el.style.color = active ? 'var(--ws-violet)' : 'var(--ws-charcoal)';
                    el.style.background = 'transparent';
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA + mobile toggle */}
            <div className="d-flex align-items-center gap-3">
              <Link to="/contact" className="ws-btn-primary d-none d-lg-inline-flex">
                Let's Talk
              </Link>
              <button
                className="d-lg-none border-0 p-1"
                style={{ background: 'transparent', color: 'var(--ws-charcoal)', cursor: 'pointer', lineHeight: 1, transition: 'color .25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <FiMenu size={24} aria-hidden="true" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 1040,
          background: 'rgba(0,0,0,.35)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity .3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '300px',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1050,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          padding: '1.75rem',
          boxShadow: '-8px 0 40px rgba(0,0,0,.12)',
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between mb-5 pb-4"
          style={{ borderBottom: '1px solid var(--ws-border)' }}
        >
          <Link to="/" className="ws-brand" onClick={close}>
            Carvel<span> Russ</span>
          </Link>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ws-charcoal)', padding: '6px', lineHeight: 1, borderRadius: '8px', transition: 'background .25s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onClick={close}
            aria-label="Close navigation menu"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        <nav style={{ flex: 1 }} aria-label="Mobile navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              onClick={close}
              style={({ isActive }) => ({
                display: 'block',
                padding: '.875rem 1.125rem',
                marginBottom: '.375rem',
                borderRadius: '.875rem',
                color: isActive ? 'var(--ws-violet)' : 'var(--ws-charcoal)',
                background: isActive ? 'var(--ws-violet-light)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '1rem',
                transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--ws-border)' }}>
          <Link
            to="/contact"
            className="ws-btn-primary"
            onClick={close}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Let's Talk
          </Link>
        </div>
      </div>
    </>
  );
}
