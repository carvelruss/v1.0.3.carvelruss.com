import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',         to: '/'             },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Blogs',        to: '/blogs'        },
  { label: 'Skills',       to: '/skills'       },
  { label: 'Contact',      to: '/contact'      },
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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    'pf-nav-link' + (isActive ? ' active' : '');

  const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
    'pf-nav-drawer__link' + (isActive ? ' active' : '');

  return (
    <>
      <header
        className="ws-navbar"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,1)',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,.08)' : 'none',
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">

            {/* Brand */}
            <Link to="/" className="ws-brand">
              Carvel<span> Russ</span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation">
              <ul className="pf-nav-links d-none d-lg-flex">
                {NAV_ITEMS.map(item => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={navLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop CTA + mobile hamburger */}
            <div className="d-flex align-items-center gap-3">
              <Link to="/contact" className="pf-nav-cta d-none d-lg-flex">
                Work With Me
              </Link>
              <button
                className="pf-nav-ham d-lg-none"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <FiMenu size={22} aria-hidden="true" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`pf-nav-backdrop${mobileOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={close}
      />

      {/* Mobile drawer */}
      <div
        className={`pf-nav-drawer${mobileOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="pf-nav-drawer-head">
          <Link to="/" className="ws-brand" onClick={close}>
            Carvel<span> Russ</span>
          </Link>
          <button
            className="pf-nav-drawer__close"
            onClick={close}
            aria-label="Close navigation menu"
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              onClick={close}
              className={drawerLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="pf-nav-drawer-footer">
          <Link to="/contact" className="ws-btn-primary" onClick={close}>
            Work With Me
          </Link>
        </div>
      </div>
    </>
  );
}
