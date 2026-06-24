import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/track';

const STATS = [
  {
    color: '#1877f2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    value: '6+',  label: 'Years Experience',
  },
  {
    color: '#7c3aed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    value: '20+', label: 'Case Studies',
  },
  {
    color: '#059669',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    value: '10+', label: 'Happy Clients',
  },
];

const CHART_POINTS = '0,38 22,30 44,34 66,18 88,26 110,10 132,15 154,6 176,10';

export default function Hero() {
  const navigate = useNavigate();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="hero-section" aria-label="Profile hero">
      {/* Background layers */}
      <div className="hero-section__dots"   aria-hidden="true" />
      <div className="hero-section__glow"   aria-hidden="true" />

      <div className="container-site hero-section__wrap">
        <div className="hero-section__layout">

          {/* ── Left column ── */}
          <div className="hero-section__left">
            <span className="hero-section__badge">Available for work</span>

            <h1 className="hero-section__heading">
              Hi, I'm{' '}
              <span>Carvel<br />Russ</span>
            </h1>

            <p className="hero-section__role">UI/UX Developer &amp; Design Engineer</p>

            <p className="hero-section__tagline">
              I design and build clean, conversion-focused digital experiences —
              from polished interfaces to production-ready projects.
            </p>

            <div className="hero-section__actions">
              <button
                className="hero-section__btn-primary"
                onClick={() => { trackEvent('cta_click', 'view_case_studies'); navigate('/case-studies'); }}
              >
                View Case Studies →
              </button>
              <button
                className="hero-section__btn-ghost"
                onClick={() => { trackEvent('cta_click', 'get_in_touch'); scrollTo('contact'); }}
              >
                Get in Touch
              </button>
            </div>

            {/* Stats bar */}
            <div className="hero-section__stats-bar" role="list" aria-label="Career stats">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="hero-section__stat-card"
                  role="listitem"
                  style={i < STATS.length - 1 ? { borderRight: '1px solid rgba(255,255,255,0.06)' } : {}}
                >
                  <span
                    className="hero-section__stat-icon"
                    style={{ background: `${s.color}22`, color: s.color }}
                  >
                    {s.icon}
                  </span>
                  <strong className="hero-section__stat-value">{s.value}</strong>
                  <span className="hero-section__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: mock UI showcase ── */}
          <div className="hero-section__showcase" aria-hidden="true">

            {/* Profile card */}
            <div className="hm-profile">
              <div className="hm-profile__header">
                <span className="hm-profile__avatar">CR</span>
                <span className="hm-profile__status">
                  <span className="hm-profile__dot" />Available
                </span>
                <span className="hm-profile__menu">•••</span>
              </div>
              <div className="hm-profile__photo" />
              <div className="hm-profile__body">
                <p className="hm-profile__quote">
                  Designing digital experiences that are intuitive, beautiful and built to perform.
                </p>
                <div className="hm-profile__tech">
                  <span className="hm-tech hm-tech--react">⚛ React</span>
                  <span className="hm-tech hm-tech--ts">TS TypeScript</span>
                  <span className="hm-tech hm-tech--tw">~ Tailwind</span>
                </div>
              </div>
            </div>

            {/* Dashboard analytics card */}
            <div className="hm-dashboard">
              <div className="hm-dashboard__sidebar">
                <span className="hm-dashboard__logo">//</span>
                {['Overview', 'Analytics', 'Projects', 'Messages', 'Settings'].map((item, i) => (
                  <span key={item} className={`hm-dashboard__nav${i === 0 ? ' active' : ''}`}>{item}</span>
                ))}
              </div>
              <div className="hm-dashboard__content">
                <p className="hm-dashboard__metric-lbl">Total Users</p>
                <div className="hm-dashboard__metric-row">
                  <strong className="hm-dashboard__metric-val">24,580</strong>
                  <span className="hm-dashboard__badge">↑ 12.5%</span>
                </div>
                <svg className="hm-dashboard__chart" viewBox="0 0 176 44" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1877f2" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#1877f2" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon fill="url(#chart-fill)" points={`${CHART_POINTS} 176,44 0,44`} />
                  <polyline fill="none" stroke="#1877f2" strokeWidth="2" strokeLinejoin="round" points={CHART_POINTS} />
                </svg>
                <div className="hm-dashboard__days">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>

            {/* Project card */}
            <div className="hm-project">
              <div className="hm-project__top">
                <span className="hm-project__lbl">Projects</span>
                <span className="hm-project__menu">•••</span>
              </div>
              <p className="hm-project__title">E-Commerce Platform</p>
              <div className="hm-project__img">🛍</div>
              <div className="hm-project__prog-row">
                <span>Progress</span><span>75%</span>
              </div>
              <div className="hm-project__prog-track">
                <div className="hm-project__prog-fill" style={{ width: '75%' }} />
              </div>
              <p className="hm-project__stack-lbl">Tech Stack</p>
              <div className="hm-project__stack">
                {['#61DAFB','#3178C6','#38BDF8','#764ABC'].map(c => (
                  <span key={c} className="hm-project__stack-dot" style={{ background: c }} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
