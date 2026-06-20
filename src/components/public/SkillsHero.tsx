import { Link } from 'react-router-dom';
import '../../styles/skills-hero.css';

/* ── Data ─────────────────────────────────────────────────────── */

type HeroStat = { value: string; label: string };

const STATS: HeroStat[] = [
  { value: '3+',   label: 'Years of Experience' },
  { value: '12+',  label: 'Projects Delivered'  },
  { value: '100%', label: 'Responsive Delivery'  },
];

type SkillBar = { label: string; pct: number };

const SKILL_BARS: SkillBar[] = [
  { label: 'UI Design',       pct: 95 },
  { label: 'UX Research',     pct: 88 },
  { label: 'Frontend Dev',    pct: 80 },
  { label: 'Design Systems',  pct: 90 },
];

const TOP_SKILLS = ['Figma', 'React', 'TypeScript'];

/* ── Skills profile card ──────────────────────────────────────── */

function SkillProfileCard() {
  return (
    <div className="skh__profile-card">

      {/* Header */}
      <div className="skh__profile-header">
        <div className="skh__profile-avatar">
          <span className="skh__profile-avatar-initials">CR</span>
        </div>
        <div className="skh__profile-info">
          <div className="skh__profile-name" />
          <div className="skh__profile-title" />
          <div className="skh__profile-available">
            <span className="skh__available-dot" />
            Available for projects
          </div>
        </div>
      </div>

      {/* Skill bars */}
      <div className="skh__bars-section">
        <p className="skh__bars-label">Core Competencies</p>
        <div className="skh__bars-list">
          {SKILL_BARS.map(({ label, pct }) => (
            <div key={label} className="skh__bar-row">
              <span className="skh__bar-name">{label}</span>
              <div className="skh__bar-track">
                <div
                  className="skh__bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool tags */}
      <div className="skh__tool-tags">
        {['Figma', 'Adobe XD', 'React', 'TypeScript', 'Notion'].map(t => (
          <span key={t} className="skh__tool-tag">{t}</span>
        ))}
      </div>

    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export default function SkillsHero() {
  return (
    <section className="skh" aria-label="Skills introduction">
      <div className="container skh__container">
        <div className="skh__grid">

          {/* ── Left: Content ── */}
          <div className="skh__content">

            <span className="skh__eyebrow">Skills</span>

            <h1 className="skh__title">
              Design, Research &amp; Frontend Expertise That Delivers Results
            </h1>

            <p className="skh__description">
              A combination of design thinking, technical skills and creative expertise —
              built to turn ideas into clean, strategic, and high-performing digital products.
            </p>

            <div className="skh__actions">
              <a href="#skills-list" className="skh__btn-primary">
                Explore Skills →
              </a>
              <Link to="/contact" className="skh__btn-secondary">
                Work Together
              </Link>
            </div>

            <div className="skh__stats">
              {STATS.map(({ value, label }) => (
                <div key={value} className="skh__stat">
                  <span className="skh__stat-value">{value}</span>
                  <span className="skh__stat-label">{label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right: Visual ── */}
          <div className="skh__visual" aria-hidden="true">

            <div className="skh__glow" />

            <div className="skh__visual-frame">

              <SkillProfileCard />

              {/* Floating experience card — top-right */}
              <div className="skh__exp-card">
                <span className="skh__exp-value">3+</span>
                <span className="skh__exp-label">Years of expertise</span>
              </div>

              {/* Floating top-skills card — bottom-left */}
              <div className="skh__top-card">
                <p className="skh__top-label">Top Skills</p>
                <div className="skh__top-pills">
                  {TOP_SKILLS.map(s => (
                    <span key={s} className="skh__top-pill">{s}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
