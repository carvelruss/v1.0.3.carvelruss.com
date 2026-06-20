import { Fragment } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiTarget,
  FiLayout,
  FiTrendingUp,
  FiHome,
  FiGrid,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiCalendar,
  FiPlus,
  FiBell,
} from 'react-icons/fi';
import '../../styles/hero.css';

/* ── Data ─────────────────────────────────────────────────── */

interface FeatureItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ComponentType<any>;
  title: string;
  desc: string;
}

interface ToolItem {
  name: string;
  abbr: string;
  color: string;
  bg: string;
}

interface ScheduleItem {
  name: string;
  time: string;
  color: string;
}

const FEATURES: FeatureItem[] = [
  { Icon: FiTarget,      title: 'User-Centered', desc: 'Designs based on real user needs and goals.'  },
  { Icon: FiLayout,      title: 'Clean & Modern', desc: 'Simple, beautiful and purposeful interfaces.' },
  { Icon: FiTrendingUp,  title: 'Results Driven', desc: 'Designs that improve engagement and growth.'  },
];

const TOOLS: ToolItem[] = [
  { name: 'Figma',         abbr: 'Fg', color: '#F24E1E', bg: '#fff0ed' },
  { name: 'VSCode',        abbr: 'VS', color: '#007ACC', bg: '#e8f4ff' },
  { name: 'ReactJS',       abbr: 'Rx', color: '#0d9ab5', bg: '#e8faff' },
  { name: 'TypeScript',    abbr: 'TS', color: '#3178C6', bg: '#eef3fc' },
  { name: 'Bootstrap',     abbr: 'Bs', color: '#7952B3', bg: '#f3eeff' },
  { name: 'Vanilla JS',    abbr: 'JS', color: '#a08800', bg: '#fffde8' },
  { name: 'HTML',          abbr: 'H5', color: '#E44D26', bg: '#fff1ee' },
  { name: 'CSS',           abbr: 'C3', color: '#264DE4', bg: '#eef0ff' },
  { name: 'WordPress CMS', abbr: 'WP', color: '#21759B', bg: '#e8f4fa' },
];

const SCHEDULE: ScheduleItem[] = [
  { name: 'Client Call',         time: '10:00 AM', color: '#22c55e' },
  { name: 'Wireframe Review',    time: '01:30 PM', color: '#5b35f5' },
  { name: 'Design Presentation', time: '03:00 PM', color: '#ef4444' },
  { name: 'Usability Testing',   time: '04:30 PM', color: '#22c55e' },
];

const BAR_HEIGHTS: number[] = [30, 55, 40, 75, 58, 85, 68];

/* Ring: r=22, circumference = 2π×22 ≈ 138.2, 85% ≈ 117.5 */
const RING_CIRC = 2 * Math.PI * 22;
const RING_FILL = 0.85 * RING_CIRC;

/* ── Component ────────────────────────────────────────────── */

export default function HeroSection() {
  return (
    <section className="hs" aria-labelledby="hs-title">

      {/* Decorative dot grid */}
      <div className="hs__dots" aria-hidden="true" />

      <div className="container hs__container">
        <div className="row align-items-center hs__row">

          {/* ────────── LEFT: CONTENT ────────── */}
          <div className="col-lg-7 hs__content">

            {/* Badge */}
            <div className="hs__badge">
              <span className="hs__badge-dot" aria-hidden="true" />
              UI/UX DEVELOPER
            </div>

            {/* Headline */}
            <h1 className="hs__title" id="hs-title">
              Designing Meaningful
              <span className="hs__title-grad">Digital Experiences</span>
            </h1>

            {/* Subtitle */}
            <p className="hs__subtitle">
              I create clean, user-centered interfaces that solve problems and drive results.
            </p>

            {/* CTA buttons */}
            <div className="hs__actions">
              <Link to="/case-studies" className="hs__btn-primary">
                View Case Studies&nbsp;
                <FiArrowRight size={17} aria-hidden={true} />
              </Link>
              <Link to="/contact" className="hs__btn-secondary">
                Contact Me
              </Link>
            </div>

            {/* Feature points */}
            <div className="hs__features">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="hs__feature">
                  <span className="hs__feature-icon">
                    <Icon size={18} aria-hidden={true} />
                  </span>
                  <div>
                    <strong className="hs__feature-title">{title}</strong>
                    <p className="hs__feature-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ────────── RIGHT: VISUAL ────────── */}
          <div className="col-lg-5 hs__visual">
            <div className="hs__visual-wrap" aria-hidden="true">

              {/* Soft purple orb behind cards */}
              <div className="hs__card-blob" />

              {/* ── DASHBOARD CARD ───────────── */}
              <div className="hs__dash-card">

                {/* Browser chrome dots */}
                <div className="hs__dash-browser">
                  <span className="hs__dash-dot hs__dash-dot--r" />
                  <span className="hs__dash-dot hs__dash-dot--y" />
                  <span className="hs__dash-dot hs__dash-dot--g" />
                </div>

                {/* Sidebar + main content */}
                <div className="hs__dash-body">
                  <div className="hs__dash-sidebar">
                    <span className="hs__dash-sidebar-icon"><FiHome size={12} /></span>
                    <span className="hs__dash-sidebar-icon hs__dash-sidebar-icon--active"><FiGrid size={12} /></span>
                    <span className="hs__dash-sidebar-icon"><FiBarChart2 size={12} /></span>
                    <span className="hs__dash-sidebar-icon"><FiUsers size={12} /></span>
                    <span className="hs__dash-sidebar-icon"><FiSettings size={12} /></span>
                  </div>

                  <div className="hs__dash-content">
                    <p className="hs__dash-title">Dashboard</p>

                    <div className="hs__dash-stats">

                      {/* Stat 1 — Total Projects (purple, line chart) */}
                      <div className="hs__stat-card hs__stat-card--purple">
                        <div className="hs__stat-label">Total Projects</div>
                        <div className="hs__stat-value">24</div>
                        <div className="hs__stat-trend">↑ 18.2% vs last month</div>
                        <svg className="hs__mini-line" viewBox="0 0 80 36" fill="none">
                          <defs>
                            <linearGradient id="hsLineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor="white" stopOpacity="0.30" />
                              <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,30 C14,22 26,20 38,17 C50,14 64,8 80,3"
                            stroke="rgba(255,255,255,0.88)"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M0,30 C14,22 26,20 38,17 C50,14 64,8 80,3 L80,36 L0,36 Z"
                            fill="url(#hsLineGrad)"
                          />
                        </svg>
                      </div>

                      {/* Stat 2 — Profile Views (white, bar chart) */}
                      <div className="hs__stat-card hs__stat-card--white">
                        <div className="hs__stat-label">Profile Views</div>
                        <div className="hs__stat-value">8.6K</div>
                        <div className="hs__stat-trend">↑ 12.5% vs last month</div>
                        <div className="hs__mini-bars">
                          {BAR_HEIGHTS.map((h, i) => (
                            <div
                              key={i}
                              className={`hs__mini-bar${i === 5 ? ' hs__mini-bar--active' : ''}`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Stat 3 — Completion Rate (white, ring) */}
                      <div className="hs__stat-card hs__stat-card--white">
                        <div className="hs__stat-label">Completion Rate</div>
                        <div className="hs__ring-wrap">
                          <div style={{ position: 'relative', width: 60, height: 60 }}>
                            <svg
                              width="60"
                              height="60"
                              viewBox="0 0 60 60"
                              style={{ transform: 'rotate(-90deg)' }}
                            >
                              <circle
                                cx="30" cy="30" r="22"
                                fill="none"
                                stroke="#eef2ff"
                                strokeWidth="6"
                              />
                              <circle
                                cx="30" cy="30" r="22"
                                fill="none"
                                stroke="#5b35f5"
                                strokeWidth="6"
                                strokeDasharray={`${RING_FILL.toFixed(1)} ${RING_CIRC.toFixed(1)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#0f172a',
                              lineHeight: 1,
                            }}>
                              85%
                            </span>
                          </div>
                          <div className="hs__ring-label">Completed</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* ── SCHEDULE CARD ─────────────── */}
              <div className="hs__schedule-card">
                <div className="hs__schedule-header">
                  <span className="hs__schedule-title">Schedule</span>
                  <span className="hs__schedule-viewall">View all</span>
                </div>

                <div className="hs__schedule-list">
                  {SCHEDULE.map(item => (
                    <div key={item.name} className="hs__schedule-item">
                      <span
                        className="hs__schedule-dot"
                        style={{ background: item.color }}
                      />
                      <span className="hs__schedule-name">{item.name}</span>
                      <span className="hs__schedule-time">{item.time}</span>
                    </div>
                  ))}
                </div>

                <div className="hs__schedule-footer">
                  <span className="hs__schedule-btn">
                    <FiPlus size={13} />
                  </span>
                  <span className="hs__schedule-cal">
                    <FiCalendar size={12} />
                  </span>
                </div>
              </div>

              {/* ── PHONE / APP CARD ──────────── */}
              <div className="hs__phone-card">
                <div className="hs__phone-topbar">
                  <span className="hs__phone-back">‹‹</span>
                  <div className="hs__phone-icons">
                    <FiBell size={11} />
                    <span className="hs__phone-avatar-sm">CR</span>
                  </div>
                </div>

                <div className="hs__phone-content">
                  <div className="hs__phone-app-title">E-Commerce App</div>
                  <div className="hs__phone-badge">In Progress</div>

                  <div className="hs__phone-img">
                    <div className="hs__phone-img-inner" />
                  </div>

                  <div className="hs__phone-progress-label">
                    <span className="hs__phone-progress-text">Progress</span>
                    <span className="hs__phone-progress-pct">75%</span>
                  </div>
                  <div className="hs__phone-bar-bg">
                    <div className="hs__phone-bar-fill" />
                  </div>

                  <div className="hs__phone-team-label">Team</div>
                  <div className="hs__phone-avatars">
                    <span className="hs__phone-avatar hs__phone-avatar--a">JD</span>
                    <span className="hs__phone-avatar hs__phone-avatar--b">AM</span>
                    <span className="hs__phone-avatar hs__phone-avatar--c">SK</span>
                    <span className="hs__phone-avatar hs__phone-avatar--extra">+2</span>
                  </div>
                </div>

                <div className="hs__phone-nav">
                  <FiHome size={13} />
                  <FiBarChart2 size={13} />
                  <FiSettings size={13} />
                </div>
              </div>

              {/* ── TYPOGRAPHY / DESIGN CARD ──── */}
              <div className="hs__type-card">
                <div className="hs__type-aa">Aa</div>
                <div className="hs__type-name">Inter</div>
                <div className="hs__type-tagline">Clean &amp; Readable</div>
                <div className="hs__swatches">
                  <span className="hs__swatch" style={{ background: '#5b35f5' }} />
                  <span className="hs__swatch" style={{ background: '#f9a8d4' }} />
                  <span className="hs__swatch" style={{ background: '#c4b5fd' }} />
                  <span className="hs__swatch" style={{ background: '#e2e8f0' }} />
                </div>
                <div className="hs__type-hex">#5B35F5</div>
              </div>

            </div>
          </div>

        </div>{/* end .row */}

        {/* ────────── BOTTOM STRIP ────────── */}
        <div className="hs__bottom">

          {/* Tools I Use */}
          <div className="hs__tools-strip">
            <span className="hs__tools-label">Tools I Use</span>
            {TOOLS.map((tool, i) => (
              <Fragment key={tool.name}>
                {i > 0 && <span className="hs__tool-sep" />}
                <div className="hs__tool">
                  <span
                    className="hs__tool-icon"
                    style={{ background: tool.bg, color: tool.color }}
                  >
                    {tool.abbr}
                  </span>
                  <span className="hs__tool-name">{tool.name}</span>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Happy Clients */}
          <div className="hs__clients">
            <div className="hs__client-avatars">
              <span className="hs__client-avatar hs__client-avatar--a">JD</span>
              <span className="hs__client-avatar hs__client-avatar--b">AM</span>
              <span className="hs__client-avatar hs__client-avatar--c">SK</span>
              <span className="hs__client-avatar hs__client-avatar--plus">+</span>
            </div>
            <div className="hs__client-text">
              <strong>10+ Happy Clients</strong>
              <span>Worldwide</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
