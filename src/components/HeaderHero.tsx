import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BsSunFill,
  BsMoonFill,
  BsPersonFill,
  BsArrowRight,
  BsCalendarCheck,
  BsFolderFill,
  BsPeopleFill,
  BsGraphUp,
} from 'react-icons/bs';
import './HeaderHero.css';

// ── Types ──────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
  type: 'route' | 'hash';
}

// ── Static data ────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { label: 'Home',         href: '/',             type: 'route' },
  { label: 'About',        href: '/#about',       type: 'hash'  },
  { label: 'Skills',       href: '/#skills',      type: 'hash'  },
  { label: 'Case Studies', href: '/case-studies', type: 'route' },
  { label: 'Blog',         href: '/blog',         type: 'route' },
  { label: 'Contact',      href: '/#contact',     type: 'hash'  },
];

const HASH_SECTIONS = ['about', 'skills', 'contact'] as const;

const STATS = [
  { icon: <BsCalendarCheck />, value: '6+',  label: 'Years Experience', color: '#1877f2' },
  { icon: <BsFolderFill />,    value: '20+', label: 'Case Studies',     color: '#7c3aed' },
  { icon: <BsPeopleFill />,    value: '10+', label: 'Happy Clients',    color: '#059669' },
];

// Sparkline points — fits a 176×44 viewBox
const CHART_PTS = '0,38 22,30 44,34 66,18 88,26 110,10 132,15 154,6 176,10';

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark((v) => !v)];
}

function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Usage in App.tsx (Portfolio layout):
 *   import HeaderHero from './components/HeaderHero';
 *   // Replace <Header /> + <Hero /> with:
 *   <HeaderHero />
 *
 * Other layouts (ProjectsLayout, BlogListLayout, etc.) keep using <Header />.
 */
export default function HeaderHero() {
  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [dark, toggleDark]               = useDarkMode();
  const scrolled                         = useScrolled();
  const navigate                         = useNavigate();
  const location                         = useLocation();

  // Track which hash section is intersecting
  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(''); return; }

    const observers = HASH_SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.35 },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = useCallback(
    (href: string, type: string) => {
      setMenuOpen(false);
      if (type === 'route') {
        navigate(href);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const id = href.slice(2); // strip '/#'
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [navigate, location.pathname],
  );

  const isActive = (href: string, type: string): boolean => {
    if (type === 'route') {
      return href === '/'
        ? location.pathname === '/' && activeSection === ''
        : location.pathname === href;
    }
    return activeSection === href.slice(2);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      {/* ════════════════════════════════ HEADER ════════════════════════════════ */}
      <header
        className={`hh-header${scrolled ? ' is-scrolled' : ''}`}
        role="banner"
      >
        <div className="hh-container hh-header__inner">

          {/* Logo */}
          <button
            className="hh-header__logo"
            onClick={() => handleNavClick('/', 'route')}
            aria-label="Go to home page"
          >
            <span className="hh-header__logo-mark" aria-hidden="true">CR</span>
            dev<span className="hh-header__logo-accent">folio</span>
          </button>

          {/* Centre nav — hidden on mobile, replaced by slide-down overlay */}
          <nav
            className={`hh-header__nav${menuOpen ? ' is-open' : ''}`}
            id="hh-main-nav"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                className={`hh-header__nav-link${isActive(link.href, link.type) ? ' is-active' : ''}`}
                onClick={() => handleNavClick(link.href, link.type)}
                aria-current={isActive(link.href, link.type) ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions — theme toggle + hire me CTA */}
          <div className="hh-header__actions">
            <button
              className="hh-header__theme-btn"
              onClick={toggleDark}
              aria-pressed={dark}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark
                ? <BsSunFill  size={14} aria-hidden="true" />
                : <BsMoonFill size={14} aria-hidden="true" />
              }
              <span>{dark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              className="hh-header__hire-btn"
              onClick={() => handleNavClick('/#contact', 'hash')}
            >
              <BsPersonFill size={13} aria-hidden="true" />
              Hire Me
            </button>
          </div>

          {/* Hamburger — visible on mobile only */}
          <button
            className={`hh-header__hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="hh-main-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

        </div>
      </header>

      {/* ════════════════════════════════ HERO ══════════════════════════════════ */}
      <section id="home" className="hh-hero" aria-label="Profile introduction">

        {/* Background layers */}
        <div className="hh-hero__dots"   aria-hidden="true" />
        <div className="hh-hero__glow-a" aria-hidden="true" />
        <div className="hh-hero__glow-b" aria-hidden="true" />

        <div className="hh-container hh-hero__wrap">
          <div className="hh-hero__layout">

            {/* ── Left: text content ───────────────────────────────────────── */}
            <div className="hh-hero__left">

              <span className="hh-hero__badge">
                Available for work
              </span>

              <h1 className="hh-hero__heading">
                Hi, I'm{' '}
                <span className="hh-hero__name">Carvel<br />Russ</span>
              </h1>

              <p className="hh-hero__role">
                UI/UX Developer &amp; Design Engineer
              </p>

              <p className="hh-hero__desc">
                I design and build clean, conversion-focused digital experiences —
                from polished interfaces to production-ready React applications.
              </p>

              <p className="hh-hero__stack-line">
                ReactJS &nbsp;•&nbsp; TypeScript &nbsp;•&nbsp; Bootstrap &nbsp;•&nbsp; UI Systems
              </p>

              <div className="hh-hero__actions">
                <button
                  className="hh-hero__btn-primary"
                  onClick={() => navigate('/case-studies')}
                >
                  View Case Studies
                  <BsArrowRight size={15} aria-hidden="true" />
                </button>
                <button
                  className="hh-hero__btn-ghost"
                  onClick={() => scrollTo('contact')}
                >
                  Let's Talk
                </button>
              </div>

              {/* Stats bar */}
              <div className="hh-hero__stats-bar" role="list" aria-label="Career highlights">
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="hh-hero__stat"
                    role="listitem"
                    style={i < STATS.length - 1
                      ? { borderRight: '1px solid rgba(255,255,255,0.07)' }
                      : {}}
                  >
                    <span
                      className="hh-hero__stat-icon"
                      style={{ background: `${s.color}22`, color: s.color }}
                      aria-hidden="true"
                    >
                      {s.icon}
                    </span>
                    <strong className="hh-hero__stat-val">{s.value}</strong>
                    <span className="hh-hero__stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* ── Right: layered floating cards ────────────────────────────── */}
            <div className="hh-hero__showcase" aria-hidden="true">

              {/* Profile card — top left */}
              <div className="hh-card hh-card--profile hh-float-a">
                <div className="hh-card__head">
                  <span className="hh-card__avatar">CR</span>
                  <div className="hh-card__info">
                    <span className="hh-card__name">Carvel Russ</span>
                    <span className="hh-card__role-label">Design Engineer</span>
                  </div>
                  <div className="hh-card__avail">
                    <span className="hh-card__pulse" />
                    Available
                  </div>
                </div>
                <p className="hh-card__quote">
                  Designing digital experiences that are intuitive,
                  beautiful and built to perform.
                </p>
                <div className="hh-card__tech-tags">
                  <span className="hh-tag hh-tag--react">⚛ React</span>
                  <span className="hh-tag hh-tag--ts">TS</span>
                  <span className="hh-tag hh-tag--bs">BS</span>
                </div>
              </div>

              {/* Analytics card — centre right */}
              <div className="hh-card hh-card--analytics hh-float-b">
                <div className="hh-analytics__top">
                  <div>
                    <p className="hh-analytics__lbl">Total Users</p>
                    <div className="hh-analytics__row">
                      <strong className="hh-analytics__val">24,580</strong>
                      <span className="hh-analytics__badge">
                        <BsGraphUp size={9} aria-hidden="true" />
                        &thinsp;12.5%
                      </span>
                    </div>
                  </div>
                  <span className="hh-analytics__icon-wrap">
                    <BsGraphUp size={16} aria-hidden="true" />
                  </span>
                </div>
                <svg
                  className="hh-analytics__chart"
                  viewBox="0 0 176 44"
                  preserveAspectRatio="none"
                  focusable="false"
                >
                  <defs>
                    <linearGradient id="hh-chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#1877f2" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#1877f2" stopOpacity="0"    />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#hh-chart-fill)"
                    points={`${CHART_PTS} 176,44 0,44`}
                  />
                  <polyline
                    fill="none"
                    stroke="#1877f2"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={CHART_PTS}
                  />
                </svg>
                <div className="hh-analytics__days">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Project card — bottom left */}
              <div className="hh-card hh-card--project hh-float-c">
                <div className="hh-project__top">
                  <span className="hh-project__eyebrow">Featured Project</span>
                  <span className="hh-project__live-pill">● Live</span>
                </div>
                <p className="hh-project__title">E-Commerce Platform</p>
                <div className="hh-project__thumbnail">🛍</div>
                <div className="hh-project__prog-row">
                  <span>Completion</span>
                  <span className="hh-project__prog-pct">75%</span>
                </div>
                <div className="hh-project__track">
                  <div className="hh-project__fill" style={{ width: '75%' }} />
                </div>
                <div className="hh-project__stack">
                  {['#61DAFB','#3178C6','#38BDF8','#764ABC'].map((c) => (
                    <span key={c} className="hh-project__dot" style={{ background: c }} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
