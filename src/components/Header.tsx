import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(v => !v)] as const;
}

const NAV_LINKS = [
  { label: 'Home',         href: '/',             type: 'route' },
  { label: 'About',        href: '/#about',       type: 'hash'  },
  { label: 'Skills',       href: '/#skills',      type: 'hash'  },
  { label: 'Case Studies', href: '/case-studies', type: 'route' },
  { label: 'Blog',         href: '/blog',         type: 'route' },
  { label: 'Contact',      href: '/contact',      type: 'route' },
];

const HASH_SECTIONS = ['about', 'skills'];

export default function Header() {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [dark, toggleDark]               = useDarkMode();
  const navigate  = useNavigate();
  const location  = useLocation();

  // IntersectionObserver — track which section is in view
  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(''); return; }

    const observers = HASH_SECTIONS.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, [location.pathname]);

  const handleNavClick = useCallback((href: string, type: string) => {
    setMenuOpen(false);
    if (type === 'route') {
      navigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = href.slice(2);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [navigate, location.pathname]);

  const isActive = (href: string, type: string) => {
    if (type === 'route') {
      if (href === '/') return location.pathname === '/' && activeSection === '';
      return location.pathname === href;
    }
    // hash link — active only when that section is in the viewport
    return activeSection === href.slice(2);
  };

  return (
    <header className="header" role="banner">
      <div className="container-site header__inner">

        {/* Logo */}
        <button
          className="header__logo"
          onClick={() => handleNavClick('/', 'route')}
          aria-label="Go to home"
        >
          <span className="header__logo-icon" aria-hidden="true">CR</span>
          dev<span className="header__logo-accent">folio</span>
        </button>

        {/* Center nav */}
        <nav
          className={`header__nav${menuOpen ? ' is-open' : ''}`}
          role="navigation"
          aria-label="Main navigation"
          id="main-nav"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              className={`header__nav-link${isActive(link.href, link.type) ? ' active' : ''}`}
              onClick={() => handleNavClick(link.href, link.type)}
              aria-current={isActive(link.href, link.type) ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="header__actions">
          {/* Light / Dark toggle */}
          <div className="header__theme-toggle" role="group" aria-label="Color theme">
            <span className={`header__theme-label${!dark ? ' active' : ''}`}>Light</span>
            <button
              className={`header__toggle-switch${dark ? ' is-dark' : ''}`}
              onClick={toggleDark}
              aria-pressed={dark}
              aria-label="Toggle dark mode"
            />
            <span className={`header__theme-label${dark ? ' active' : ''}`}>Dark</span>
          </div>

          <button className="header__btn-solid" onClick={() => handleNavClick('/#contact', 'hash')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Hire Me
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`header__menu-btn${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

      </div>
    </header>
  );
}
