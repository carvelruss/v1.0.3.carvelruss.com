import { Link } from 'react-router-dom';
import '../../styles/case-studies-hero.css';

/* ── Types ────────────────────────────────────────────────────── */

type HeroStat = { value: string; label: string };

/* ── Data ─────────────────────────────────────────────────────── */

const STATS: HeroStat[] = [
  { value: '12+',  label: 'Projects Completed' },
  { value: '5+',   label: 'Industries Served'  },
  { value: '100%', label: 'Responsive Design'  },
];

const FOCUS_ITEMS = ['UX Research', 'UI Design', 'Design System'];

const BADGES = ['UX Strategy', 'Responsive UI', 'SaaS Design'];

/* ── Dashboard mockup (CSS-only) ──────────────────────────────── */

function CaseStudyMockup() {
  return (
    <div className="csh__main-card">

      {/* Card header */}
      <div className="csh__card-header">
        <div className="csh__card-header-text">
          <p className="csh__card-project-name">Fintech Dashboard Redesign</p>
          <span className="csh__card-project-type">Dashboard Design</span>
        </div>
        <span className="csh__card-live-badge">Live</span>
      </div>

      {/* Browser chrome */}
      <div className="csh__browser">
        <div className="csh__browser-dots">
          <span className="csh__dot csh__dot--red" />
          <span className="csh__dot csh__dot--yellow" />
          <span className="csh__dot csh__dot--green" />
        </div>
        <div className="csh__browser-bar" />
      </div>

      {/* Dashboard */}
      <div className="csh__dashboard">

        {/* Sidebar */}
        <div className="csh__dash-sidebar">
          <div className="csh__dash-logo" />
          {[true, false, false, false, false].map((active, i) => (
            <div
              key={i}
              className={`csh__dash-nav${active ? ' csh__dash-nav--active' : ''}`}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="csh__dash-main">

          {/* Mini stat cards */}
          <div className="csh__dash-row-stats">
            {[0, 1, 2].map(i => (
              <div key={i} className="csh__dash-mini-stat">
                <span className="csh__dash-mini-val" />
                <span className="csh__dash-mini-lbl" />
              </div>
            ))}
          </div>

          {/* Line chart */}
          <div className="csh__dash-chart">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 56"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="cshChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E4ED8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E4ED8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,46 L28,36 L56,40 L84,22 L112,30 L140,16 L168,10 L200,4 L200,56 L0,56 Z"
                fill="url(#cshChartFill)"
              />
              <polyline
                points="0,46 28,36 56,40 84,22 112,30 140,16 168,10 200,4"
                fill="none"
                stroke="#1E4ED8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Table rows */}
          <div className="csh__dash-table">
            {[80, 55, 70].map((w, i) => (
              <div key={i} className="csh__dash-table-row">
                <span className="csh__dash-table-dot" />
                <span className="csh__dash-table-bar" style={{ width: `${w}%` }} />
                <span className="csh__dash-table-num" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export default function CaseStudiesHero() {
  return (
    <section className="csh" aria-label="Case Studies introduction">
      <div className="container csh__container">
        <div className="csh__grid">

          {/* ── Left: Content ── */}
          <div className="csh__content">

            <span className="csh__eyebrow">Case Studies</span>

            <h1 className="csh__title">
              Selected Projects Built Around Strategy, Usability, and Results
            </h1>

            <p className="csh__description">
              Explore a curated collection of UI/UX projects focused on solving real problems,
              improving digital experiences, and creating interfaces that are clear, scalable,
              and conversion-focused.
            </p>

            <div className="csh__actions">
              <a href="#case-studies-list" className="csh__btn-primary">
                View Featured Work →
              </a>
              <Link to="/contact" className="csh__btn-secondary">
                Start a Project
              </Link>
            </div>

            <div className="csh__stats">
              {STATS.map(({ value, label }) => (
                <div key={value} className="csh__stat">
                  <span className="csh__stat-value">{value}</span>
                  <span className="csh__stat-label">{label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right: Visual ── */}
          <div className="csh__visual" aria-hidden="true">

            <div className="csh__glow" />

            <div className="csh__visual-frame">

              <CaseStudyMockup />

              {/* Focus card — floats top-right */}
              <div className="csh__focus-card">
                <p className="csh__focus-title">Project Focus</p>
                {FOCUS_ITEMS.map(item => (
                  <div key={item} className="csh__focus-item">
                    <span className="csh__focus-dot" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Results card — floats bottom-left */}
              <div className="csh__results-card">
                <span className="csh__results-value">+35%</span>
                <span className="csh__results-label">Improved task completion</span>
                <div className="csh__results-trend">↑ Positive outcome</div>
              </div>

            </div>

            {/* Category badges */}
            <div className="csh__badges-row">
              {BADGES.map(badge => (
                <span key={badge} className="csh__badge">{badge}</span>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
