const HIGHLIGHTS = [
  'UI/UX Design', 'Frontend Development', 'User Research',
  'Prototyping', 'Design Systems', 'Responsive Interfaces',
  'Accessibility', 'Agile Workflows',
];

const STATS = [
  { value: '6+',  label: 'Years of experience' },
  { value: '20+', label: 'Projects delivered'  },
  { value: '10+', label: 'Happy clients'        },
  { value: '3+',  label: 'Design systems built' },
];

export default function About() {
  return (
    <section id="about" className="section about-section" aria-label="About me">
      <div className="container-site">

        <p className="section__eyebrow" data-reveal>About Me</p>
        <h2 className="section__title" data-reveal>Designing with purpose,<br />building with precision</h2>

        <div className="about__grid">
          {/* Left: text */}
          <div className="about__text-col" data-reveal>
            <p className="about__text">
              I'm a UI/UX Developer who sits at the intersection of design and engineering. With a
              background spanning user research, visual design, and frontend implementation, I help
              teams ship products that are both beautiful and genuinely usable.
            </p>
            <p className="about__text">
              I care deeply about the details — from the spacing of a button to the clarity of an
              error message. Great digital experiences come from deeply understanding people, then
              building with precision and care.
            </p>
            <p className="about__text">
              When I'm not pushing pixels or writing TypeScript, I contribute to open-source design
              systems, explore interaction design trends, and mentor junior developers.
            </p>

            <div className="about__highlights" role="list" aria-label="Areas of expertise">
              {HIGHLIGHTS.map(item => (
                <span key={item} className="skill-pill" role="listitem">{item}</span>
              ))}
            </div>
          </div>

          {/* Right: stats panel */}
          <div className="about__stats-panel" data-reveal data-reveal-delay="120">
            <p className="about__stats-label">By the numbers</p>
            <div className="about__stats-grid">
              {STATS.map(s => (
                <div key={s.label} className="about__stat">
                  <span className="about__stat-value">{s.value}</span>
                  <span className="about__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="about__availability">
              <span className="about__avail-dot" aria-hidden="true" />
              Available for new projects
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
