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
    padding: '.5rem .75rem',
    borderRadius: '.5rem',
    transition: 'color .2s, background .2s',
    display: 'inline-block',
  });

  return (
    <>
      <header
        className="ws-navbar"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,.08)' : 'none',
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-3">

            {/* Brand */}
            <Link to="/" className="ws-brand">
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
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ws-violet)'; }}
                  onMouseLeave={e => {
                    const active = e.currentTarget.getAttribute('aria-current') === 'page';
                    (e.currentTarget as HTMLElement).style.color = active ? 'var(--ws-violet)' : 'var(--ws-charcoal)';
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
                style={{ background: 'transparent', color: 'var(--ws-charcoal)', cursor: 'pointer', lineHeight: 1 }}
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
          background: 'rgba(0,0,0,.4)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity .3s ease',
        }}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '285px',
          background: '#fff',
          zIndex: 1050,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column',
          padding: '1.5rem',
          boxShadow: '-6px 0 32px rgba(0,0,0,.12)',
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between mb-4 pb-3"
          style={{ borderBottom: '1px solid var(--ws-border)' }}
        >
          <Link to="/" className="ws-brand" onClick={close}>
            Carvel<span> Russ</span>
          </Link>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ws-charcoal)', padding: '4px', lineHeight: 1 }}
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
                padding: '.75rem 1rem',
                marginBottom: '.25rem',
                borderRadius: '.75rem',
                color: isActive ? 'var(--ws-violet)' : 'var(--ws-charcoal)',
                background: isActive ? 'var(--ws-violet-light)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '1rem',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--ws-border)' }}>
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
