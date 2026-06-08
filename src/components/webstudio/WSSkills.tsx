interface Skill {
  name: string;
  emoji: string;
  logoBg: string;
  logoColor: string;
  description: string;
  quote: string;
  quoteName: string;
  partner: string;
}

const SKILLS: Skill[] = [
  {
    name: 'Figma',
    emoji: '🎨',
    logoBg: '#fff7ed',
    logoColor: '#ea580c',
    description:
      'Our design process lives in Figma — collaborative, iterative, and pixel-perfect. Every component, prototype, and dev handoff is crafted inside a shared design system that scales with your product.',
    quote:
      '"Their Figma prototypes saved us weeks of back-and-forth. The design system handed off to dev was impeccably organized."',
    quoteName: 'Marketplace Co.',
    partner: 'Design Systems',
  },
  {
    name: 'CSS3',
    emoji: '🌊',
    logoBg: '#eff6ff',
    logoColor: '#3b82f6',
    description:
      'From fluid grid layouts to sophisticated micro-animations and glassmorphism — we master CSS3 to create interfaces that feel native to every screen size and browser.',
    quote:
      '"Every hover state, every transition felt intentional and polished. The attention to CSS detail was remarkable throughout."',
    quoteName: 'FinTech Labs',
    partner: 'Frontend Excellence',
  },
  {
    name: 'Bootstrap',
    emoji: '⚡',
    logoBg: '#f5f3ff',
    logoColor: '#7c3aed',
    description:
      'We use Bootstrap 5 as our utility-first foundation, customizing every design token to match brand guidelines while leveraging the grid and component system for fast, consistent delivery.',
    quote:
      '"They built our entire admin interface in just 3 weeks — responsive, accessible, and perfectly on-brand. Remarkable."',
    quoteName: 'SaaS Platform X',
    partner: 'Rapid Delivery',
  },
  {
    name: 'Python',
    emoji: '🐍',
    logoBg: '#f0fdf4',
    logoColor: '#16a34a',
    description:
      'Backend APIs, data pipelines, automation scripts — our Python expertise powers everything from simple REST services to complex ML-driven applications deployed at scale.',
    quote:
      '"The Python API they built handles over 100k requests daily without a hiccup. Performance was a top priority and they delivered."',
    quoteName: 'DataFlow Inc.',
    partner: 'Backend Engineering',
  },
];

export default function WSSkills() {
  return (
    <section id="ws-skills" className="ws-section ws-bg-soft">
      <div className="container">
        {/* Section header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6 text-center">
            <p className="ws-eyebrow">What we master</p>
            <h2 className="section-title">Our skills</h2>
            <p style={{ color: 'var(--ws-body)', fontSize: '1.0625rem', marginTop: '.75rem', marginBottom: 0 }}>
              Deep expertise across the full design-to-deployment stack.
            </p>
          </div>
        </div>

        {/* Skill cards — alternating layout */}
        <div className="d-flex flex-column gap-4">
          {SKILLS.map((skill, i) => (
            <article key={skill.name} className="ws-skill-card">
              <div className={`row g-0 align-items-stretch${i % 2 === 1 ? ' flex-lg-row-reverse' : ''}`}>

                {/* Content side */}
                <div className="col-lg-5 p-4 p-xl-5 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="ws-skill-logo"
                      style={{ background: skill.logoBg, color: skill.logoColor }}
                      aria-hidden="true"
                    >
                      {skill.emoji}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ws-navy)', marginBottom: 0 }}>
                      {skill.name}
                    </h3>
                  </div>

                  <p style={{ color: 'var(--ws-body)', lineHeight: 1.75, fontSize: '.9375rem', marginBottom: 0 }}>
                    {skill.description}
                  </p>

                  <blockquote className="ws-skill-quote" cite="#">
                    {skill.quote}
                  </blockquote>

                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <span className="ws-skill-partner">
                      <span aria-hidden="true" style={{ fontSize: '.7rem', opacity: .6 }}>✦</span>
                      {skill.partner}
                    </span>
                    <span style={{ fontSize: '.875rem', color: '#94a3b8' }}>
                      — {skill.quoteName}
                    </span>
                  </div>
                </div>

                {/* Visual side */}
                <div className="col-lg-7 d-flex">
                  <div
                    style={{
                      flex: 1,
                      minHeight: '260px',
                      background: `linear-gradient(135deg, ${skill.logoBg} 0%, #ffffff 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1.5rem',
                      padding: '2rem',
                    }}
                    aria-hidden="true"
                  >
                    {/* Big emoji */}
                    <div style={{ fontSize: '4.5rem', opacity: .35 }}>{skill.emoji}</div>

                    {/* Mini card strip */}
                    <div className="d-flex gap-3 flex-wrap justify-content-center">
                      {['Speed', 'Quality', 'Scale'].map(label => (
                        <div
                          key={label}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--ws-border)',
                            borderRadius: '.625rem',
                            padding: '.4rem .9rem',
                            fontSize: '.8125rem',
                            fontWeight: 600,
                            color: skill.logoColor,
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
