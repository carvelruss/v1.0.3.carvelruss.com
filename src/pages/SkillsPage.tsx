import { skillCategories } from '../data/skills';
import './SkillsPage.css';

export default function SkillsPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <div className="sp-hero" role="banner">
        <div className="sp-hero__dots" aria-hidden="true" />
        <div className="sp-hero__glow"  aria-hidden="true" />
        <div className="container-site sp-hero__inner">
          <span className="sp-hero__eyebrow">Full-stack skillset</span>
          <h1 className="sp-hero__heading">Skills &amp; Expertise</h1>
          <p className="sp-hero__sub">
            A complete breakdown of the tools, technologies, and disciplines
            I use to take a product from idea to a polished, production-ready experience.
          </p>
          <div className="sp-hero__stats" aria-label="Skill counts">
            {skillCategories.map(cat => (
              <div key={cat.label} className="sp-hero__stat">
                <strong
                  className="sp-hero__stat-num"
                  style={{ color: cat.accent }}
                >
                  {cat.skills.length}
                </strong>
                <span className="sp-hero__stat-lbl">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category sections ─────────────────────────────────────────────── */}
      {skillCategories.map((cat, ci) => (
        <section
          key={cat.label}
          className={`sp-section${ci % 2 === 1 ? ' sp-section--alt' : ''}`}
          aria-label={`${cat.label} skills`}
        >
          <div className="container-site">

            {/* Category header */}
            <div className="sp-cat-header">
              <span
                className="sp-cat-badge"
                style={{ background: `${cat.accent}18`, color: cat.accent, borderColor: `${cat.accent}30` }}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
              </span>
              <h2 className="sp-cat-title">{cat.label} Skills</h2>
              <p className="sp-cat-sub">
                {ci === 0 && 'Design thinking and tools I use to create clear, user-centred experiences from first sketch to final handoff.'}
                {ci === 1 && 'The technologies I write every day to build fast, accessible, and maintainable frontend applications.'}
                {ci === 2 && 'The workflow tools and platforms I rely on to ship quality work reliably and collaborate without friction.'}
              </p>
            </div>

            {/* Skills grid */}
            <div className="sp-grid" role="list">
              {cat.skills.map((skill, si) => (
                <article
                  key={skill.name}
                  className="sp-skill"
                  role="listitem"
                  style={{ '--sp-accent': cat.accent } as React.CSSProperties}
                  data-reveal
                  data-reveal-delay={si * 50}
                >
                  <h3 className="sp-skill__name">{skill.name}</h3>
                  <p className="sp-skill__desc">{skill.description}</p>
                </article>
              ))}
            </div>

          </div>
        </section>
      ))}
    </>
  );
}
