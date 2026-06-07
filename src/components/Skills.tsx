import { skillCategories } from '../data/skills';

const PILL_STYLES = [
  { pillBg: '#ede9fe', pillText: '#5b21b6' },
  { pillBg: '#dbeafe', pillText: '#1d4ed8' },
  { pillBg: '#d1fae5', pillText: '#065f46' },
];

export default function Skills() {
  return (
    <section id="skills" className="section skills-section" aria-label="Skills">
      <div className="container-site">

        <p className="section__eyebrow" data-reveal>What I bring</p>
        <h2 className="section__title" data-reveal>Skills &amp; Expertise</h2>

        <div className="skills__grid">
          {skillCategories.map((category, i) => {
            const ps = PILL_STYLES[i % PILL_STYLES.length];
            return (
              <article
                key={category.label}
                className="skills__category-card card"
                aria-label={`${category.label} skills`}
                data-reveal
                data-reveal-delay={i * 100}
                style={{ '--cat-accent': category.accent, '--cat-bg': category.bg } as React.CSSProperties}
              >
                <div className="skills__category-header">
                  <span className="skills__category-icon" aria-hidden="true">{category.icon}</span>
                  <h3 className="skills__category-label">{category.label}</h3>
                </div>

                <ul className="skills__pills" role="list">
                  {category.skills.map(skill => (
                    <li
                      key={skill.name}
                      className="skill-pill"
                      role="listitem"
                      style={{ background: ps.pillBg, color: ps.pillText }}
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
