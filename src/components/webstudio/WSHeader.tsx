import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

interface NavItem {
  label: string;
  hasDropdown?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Landings', hasDropdown: true },
  { label: 'Pages', hasDropdown: true },
  { label: 'Account', hasDropdown: true },
  { label: 'UI Kit' },
  { label: 'Docs' },
];

export default function WSHeader() {
  const [scrolled, setScrolled] = useState(false);
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

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
            <a href="#ws-hero" className="ws-brand">
              web<span>studio</span>
            </a>

            {/* Desktop nav */}
            <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map(item => (
                <a
                  key={item.label}
                  href="#ws-hero"
                  className="nav-link d-flex align-items-center gap-1"
                  style={{ color: 'var(--ws-charcoal)', fontWeight: 500, fontSize: '.9375rem' }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <FiChevronDown size={13} style={{ opacity: .55, marginTop: 1 }} aria-hidden="true" />
                  )}
                </a>
              ))}
            </nav>

            {/* Desktop CTA + Mobile toggle */}
            <div className="d-flex align-items-center gap-3">
              <a href="#ws-contact" className="ws-btn-primary d-none d-lg-inline-flex">
                Let's Talk
              </a>
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
        onClick={() => setMobileOpen(false)}
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
        {/* Drawer header */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3"
             style={{ borderBottom: '1px solid var(--ws-border)' }}>
          <a href="#ws-hero" className="ws-brand" onClick={() => setMobileOpen(false)}>
            web<span>studio</span>
          </a>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ws-charcoal)', padding: '4px', lineHeight: 1 }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Drawer links */}
        <nav style={{ flex: 1 }} aria-label="Mobile navigation">
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href="#ws-hero"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.75rem 1rem',
                marginBottom: '.25rem',
                borderRadius: '.75rem',
                color: 'var(--ws-charcoal)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                transition: 'background .2s, color .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--ws-violet-light)';
                e.currentTarget.style.color = 'var(--ws-violet)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--ws-charcoal)';
              }}
            >
              {item.label}
              {item.hasDropdown && <FiChevronDown size={14} style={{ opacity: .5 }} aria-hidden="true" />}
            </a>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--ws-border)' }}>
          <a
            href="#ws-contact"
            className="ws-btn-primary"
            onClick={() => setMobileOpen(false)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Let's Talk
          </a>
        </div>
      </div>
    </>
  );
}
