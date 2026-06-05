import { useState } from 'react';

const ITEMS = [
  {
    title: 'UI/UX Design',
    desc: 'User-centered design that balances aesthetics with functionality. From wireframes and high-fidelity prototypes to polished interfaces that delight users and drive conversions.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="64" height="64" rx="14" fill="url(#cg1)" opacity="0.12"/>
        <rect x="16" y="20" width="28" height="20" rx="4" stroke="url(#cg1)" strokeWidth="2.5"/>
        <rect x="16" y="46" width="12" height="12" rx="3" stroke="url(#cg1)" strokeWidth="2.5"/>
        <rect x="32" y="46" width="12" height="12" rx="3" stroke="url(#cg1)" strokeWidth="2.5"/>
        <rect x="48" y="20" width="16" height="38" rx="4" stroke="url(#cg1)" strokeWidth="2.5"/>
        <circle cx="56" cy="29" r="4" fill="url(#cg1)" opacity="0.5"/>
      </svg>
    ),
  },
  {
    title: 'Frontend Development',
    desc: 'Clean, performant React applications built with TypeScript, SCSS, and modern tooling. Responsive by default, accessible by design, and built to scale.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="64" height="64" rx="14" fill="url(#cg2)" opacity="0.12"/>
        <polyline points="26,28 14,40 26,52" stroke="url(#cg2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="54,28 66,40 54,52" stroke="url(#cg2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="44" y1="22" x2="36" y2="58" stroke="url(#cg2)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Design Systems',
    desc: 'Scalable component libraries with design tokens, documentation, and developer handoff that keeps teams aligned, reduces inconsistency, and speeds up delivery.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cg3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="64" height="64" rx="14" fill="url(#cg3)" opacity="0.12"/>
        <rect x="16" y="16" width="20" height="20" rx="5" stroke="url(#cg3)" strokeWidth="2.5"/>
        <rect x="44" y="16" width="20" height="20" rx="5" stroke="url(#cg3)" strokeWidth="2.5"/>
        <rect x="16" y="44" width="20" height="20" rx="5" stroke="url(#cg3)" strokeWidth="2.5"/>
        <rect x="44" y="44" width="20" height="20" rx="5" stroke="url(#cg3)" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    title: 'Prototyping & Research',
    desc: 'Rapid Figma prototypes, usability testing, and user interviews that validate ideas before a single line of code is written — saving time and reducing rework.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cg4" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="64" height="64" rx="14" fill="url(#cg4)" opacity="0.12"/>
        <circle cx="40" cy="36" r="14" stroke="url(#cg4)" strokeWidth="2.5"/>
        <line x1="50" y1="46" x2="62" y2="58" stroke="url(#cg4)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="34" y1="36" x2="40" y2="30" stroke="url(#cg4)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="40" cy="36" r="3" fill="url(#cg4)"/>
      </svg>
    ),
  },
  {
    title: 'Performance & Accessibility',
    desc: 'Core Web Vitals optimisation, WCAG 2.1 compliance, and semantic HTML that makes every experience fast, inclusive, and search-engine friendly.',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cg5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="64" height="64" rx="14" fill="url(#cg5)" opacity="0.12"/>
        <path d="M16 52 A24 24 0 0 1 64 52" stroke="url(#cg5)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="52" x2="52" y2="34" stroke="url(#cg5)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="40" cy="52" r="4" fill="url(#cg5)"/>
        <circle cx="24" cy="52" r="2.5" stroke="url(#cg5)" strokeWidth="2"/>
        <circle cx="56" cy="52" r="2.5" stroke="url(#cg5)" strokeWidth="2"/>
      </svg>
    ),
  },
];

const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Competencies() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? -1 : i));

  return (
    <section className="competencies" aria-label="Our competencies">
      <div className="container-site">

        <div className="competencies__header">
          <h2 className="competencies__heading">My Competencies</h2>
          <p className="competencies__sub">
            A full-stack design and engineering skill set — from early research and wireframes
            to production-ready code and accessible interfaces.
          </p>
        </div>

        <div className="competencies__list">
          {ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.title} className={`competencies__item${isOpen ? ' is-open' : ''}`}>
                <button
                  className="competencies__row"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="competencies__title">{item.title}</span>
                  <span className={`competencies__chevron${isOpen ? ' is-open' : ''}`}>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </button>

                <div className={`competencies__body${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
                  <div className="competencies__body-inner">
                    <div className="competencies__icon">{item.icon}</div>
                    <p className="competencies__desc">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
