import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import '../../styles/header.css';

const NAV_ITEMS = [
  { label: 'Home',         to: '/'             },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Blogs',        to: '/blogs'        },
  { label: 'Skills',       to: '/skills'       },
] as const;

export default function Header() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cardRef   = useRef<HTMLElement>(null);
  const location  = useLocation();

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Scroll state for shadow tightening
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close when clicking outside the header card
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Collapse on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1200) setIsOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sh__nav-link${isActive ? ' is-active' : ''}`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sh__mobile-link${isActive ? ' is-active' : ''}`;

  return (
    <header
      ref={cardRef}
      className={[
        'sh',
        scrolled  ? 'sh--scrolled' : '',
        isOpen    ? 'sh--open'     : '',
      ].filter(Boolean).join(' ')}
      aria-label="Site header"
    >

        {/* ── Top row ─────────────────────────────────────────── */}
        <div className="sh__inner">

          {/* Brand */}
          <Link to="/" className="sh__brand" onClick={close} aria-label="Home">
            <span className="sh__logo" aria-hidden="true">
              {/* @ mark — matches the mockup's circular logo with white symbol */}
              <svg
                width="24" height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
              </svg>
            </span>
            <span className="sh__brand-name">Your Name</span>
          </Link>

          {/* Desktop / Tablet Nav */}
          <nav className="sh__nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={navLinkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: CTA + Hamburger */}
          <div className="sh__end">
            <Link to="/contact" className="sh__cta" onClick={close}>
              <span>Work With Me</span>
              <FiArrowRight className="sh__cta-icon" size={16} aria-hidden="true" />
            </Link>

            <button
              className="sh__ham"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="sh-mobile-panel"
              onClick={toggle}
            >
              {isOpen
                ? <FiX    size={21} aria-hidden="true" />
                : <FiMenu size={21} aria-hidden="true" />
              }
            </button>
          </div>

        </div>

        {/* ── Mobile Panel ────────────────────────────────────── */}
        <div
          id="sh-mobile-panel"
          className={`sh__mobile${isOpen ? ' is-open' : ''}`}
          aria-hidden={!isOpen}
          role="region"
          aria-label="Mobile navigation"
        >
          <nav className="sh__mobile-nav" aria-label="Mobile navigation links">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={mobileNavLinkClass}
                onClick={close}
              >
                {label}
              </NavLink>
            ))}
          </nav>

        </div>

    </header>
  );
}
