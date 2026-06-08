import { skillCategories } from '../data/skills';

export default function SkillsPage() {
  return (
    <>
      {/* Hero */}
      <section className="ws-pg-hero ws-pg-hero--dark">
        <div className="container">
          <p className="ws-eyebrow">Full-stack skillset</p>
          <h1 className="section-title">Skills &amp; Expertise</h1>
          <p className="ws-pg-hero__sub">
            A complete breakdown of the tools, technologies, and disciplines I use to take
            a product from idea to a polished, production-ready experience.
          </p>
          <div className="ws-pg-hero__stats" aria-label="Skill counts">
            {skillCategories.map(cat => (
              <div key={cat.label}>
                <span className="ws-pg-hero__stat-value">{cat.skills.length}</span>
                <span className="ws-pg-hero__stat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category sections */}
      {skillCategories.map((cat, ci) => (
        <section
          key={cat.label}
          className="ws-section"
          style={{ background: ci % 2 === 1 ? 'var(--ws-bg-soft)' : '#fff' }}
          aria-label={`${cat.label} skills`}
        >
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-7 text-center">
                <span
                  className="ws-skill-cat-badge"
                  style={{
                    background: `${cat.accent}18`,
                    color: cat.accent,
                    borderColor: `${cat.accent}30`,
                  }}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </span>
                <h2 className="section-title">{cat.label} Skills</h2>
                <p style={{ color: 'var(--ws-body)', fontSize: '1.0625rem', marginTop: '.5rem', marginBottom: 0 }}>
                  {ci === 0 && 'Design thinking and tools I use to create clear, user-centred experiences from first sketch to final handoff.'}
                  {ci === 1 && 'The technologies I write every day to build fast, accessible, and maintainable frontend applications.'}
                  {ci === 2 && 'The workflow tools and platforms I rely on to ship quality work reliably and collaborate without friction.'}
                </p>
              </div>
            </div>

            <div className="row g-4" role="list">
              {cat.skills.map((skill, si) => (
                <div key={skill.name} className="col-sm-6 col-md-4 col-lg-3" role="listitem">
                  <article
                    className="ws-skill-item"
                    style={{ '--sp-accent': cat.accent } as React.CSSProperties}
                    data-reveal
                    data-reveal-delay={si * 50}
                  >
                    <h3 className="ws-skill-item__name">{skill.name}</h3>
                    <p className="ws-skill-item__desc">{skill.description}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
