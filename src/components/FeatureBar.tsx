const FEATURES = [
  {
    title: 'Creative Solutions',
    desc: 'Designing intuitive, user-centered experiences that balance beauty with function.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#fb-grad-1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <defs>
          <linearGradient id="fb-grad-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
        <line x1="12" y1="18" x2="12" y2="21"/>
        <line x1="12" y1="1" x2="12" y2="2"/>
        <line x1="4.22" y1="4.22" x2="5.05" y2="5.05"/>
        <line x1="1" y1="12" x2="2" y2="12"/>
        <line x1="19.78" y1="4.22" x2="18.95" y2="5.05"/>
        <line x1="23" y1="12" x2="22" y2="12"/>
      </svg>
    ),
  },
  {
    title: 'Award-Winning Quality',
    desc: 'Polished, pixel-perfect interfaces built with precision and attention to detail.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#fb-grad-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <defs>
          <linearGradient id="fb-grad-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
  {
    title: 'Collaborative Approach',
    desc: 'Working with you through every stage — from concept to final delivery.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#fb-grad-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <defs>
          <linearGradient id="fb-grad-3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function FeatureBar() {
  return (
    <section className="feature-bar" aria-label="Key features">
      <div className="container-site feature-bar__inner">
        {FEATURES.map(({ title, desc, icon }) => (
          <div key={title} className="feature-bar__item">
            <div className="feature-bar__icon">{icon}</div>
            <h3 className="feature-bar__title">{title}</h3>
            <p className="feature-bar__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
