import { FiArrowRight } from 'react-icons/fi';

interface CaseStudy {
  category: string;
  client: string;
  title: string;
  description: string;
  bullets: string[];
  gradient: string;
  emoji: string;
  awards: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    category: 'Banking · UX Design',
    client: 'NationalBank Corp',
    title: 'Development of an application for a national bank',
    description:
      "A complete redesign and rebuild of a major national bank's mobile and web platforms, handling millions of secure transactions daily for their 2M+ customers.",
    bullets: [
      'React Native mobile app for iOS and Android',
      'Real-time transaction tracking via WebSocket',
      'Biometric authentication & fraud detection UI',
      'WCAG 2.2 AA accessibility compliance',
    ],
    gradient: 'linear-gradient(145deg, #f5f5f7 0%, #e8e8ed 100%)',
    emoji: '🏦',
    awards: ['Clutch Top 500', 'CSS Design Awards'],
  },
  {
    category: 'Dashboard · Data Analytics',
    client: 'DataViz Enterprise',
    title: 'Design and development of a dashboard for data management',
    description:
      'A sophisticated analytics dashboard for managing and visualizing complex datasets. Built for enterprise clients who needed insights at a glance without data-science expertise.',
    bullets: [
      'D3.js + recharts interactive visualizations',
      'Real-time WebSocket data pipelines',
      'Export to CSV, PDF, and Excel formats',
      'Role-based access control and audit logs',
    ],
    gradient: 'linear-gradient(145deg, #f0f0f5 0%, #e5e5ea 100%)',
    emoji: '📊',
    awards: ['Awwwards Honorable Mention'],
  },
  {
    category: 'Marketing · Landing Page',
    client: 'Boost Agency',
    title: 'Landing page for a marketing agency Boost',
    description:
      'A high-conversion landing page for the Boost agency that increased their lead generation by 340% in the first quarter post-launch. Every element was A/B tested.',
    bullets: [
      'A/B tested hero section variants',
      'CSS-only micro-animations for delight',
      'Core Web Vitals score: 98/100',
      'Multilingual (EN, ES, FR) with i18n routing',
    ],
    gradient: 'linear-gradient(145deg, #ebebf0 0%, #dcdce1 100%)',
    emoji: '🚀',
    awards: ['Google Best of Web'],
  },
];

export default function WSCaseStudies() {
  return (
    <section id="ws-case-studies" className="ws-section">
      <div className="container">
        {/* Section header */}
        <div className="row align-items-end mb-5">
          <div className="col-lg-7">
            <p className="ws-eyebrow">Portfolio</p>
            <h2 className="section-title">Recent case studies</h2>
            <p style={{ color: 'var(--ws-body)', fontSize: '1.0625rem', marginTop: '.75rem', marginBottom: 0 }}>
              Below you'll find handpicked recent projects we are most proud of
            </p>
          </div>
          <div className="col-lg-5 d-none d-lg-flex justify-content-end align-items-end">
            <a href="#ws-contact" className="ws-btn-outline">
              View all projects
              <FiArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Case study cards */}
        <div className="d-flex flex-column gap-5">
          {CASE_STUDIES.map((cs, i) => (
            <article key={cs.title} className="ws-case-card">
              <div className={`row g-0 align-items-stretch${i % 2 === 1 ? ' flex-lg-row-reverse' : ''}`}>

                {/* Image / visual side */}
                <div className="col-lg-5">
                  <div className="ws-case-img-wrap" style={{ height: '100%', minHeight: '280px' }}>
                    <div
                      className="ws-case-img"
                      style={{
                        background: cs.gradient,
                        height: '100%',
                        minHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                      }}
                      role="img"
                      aria-label={`Visual for ${cs.title}`}
                    >
                      <div style={{ fontSize: '4.5rem' }} aria-hidden="true">{cs.emoji}</div>
                      <div
                        style={{
                          background: 'rgba(255,255,255,.7)',
                          borderRadius: '.75rem',
                          padding: '.5rem 1rem',
                          fontSize: '.8125rem',
                          fontWeight: 700,
                          color: 'var(--ws-charcoal)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        {cs.client}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div className="col-lg-7 p-4 p-lg-5 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="ws-category-badge">{cs.category}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                      fontWeight: 700,
                      color: 'var(--ws-navy)',
                      lineHeight: 1.3,
                      marginBottom: '1rem',
                    }}
                  >
                    {cs.title}
                  </h3>

                  <p style={{ color: 'var(--ws-body)', lineHeight: 1.7, fontSize: '.9375rem', marginBottom: '1.25rem' }}>
                    {cs.description}
                  </p>

                  <ul
                    style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}
                    aria-label="Project highlights"
                  >
                    {cs.bullets.map(b => (
                      <li
                        key={b}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '.6rem',
                          color: 'var(--ws-body)',
                          fontSize: '.9rem',
                          marginBottom: '.4rem',
                          lineHeight: 1.55,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 7, height: 7,
                            borderRadius: '50%',
                            background: 'var(--ws-violet)',
                            flexShrink: 0,
                            display: 'inline-block',
                            marginTop: '.38rem',
                          }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <a href="#ws-contact" className="ws-read-more">
                      Read the full story
                      <FiArrowRight size={15} aria-hidden="true" />
                    </a>

                    {/* Award badges */}
                    <div className="d-flex gap-2 flex-wrap">
                      {cs.awards.map(award => (
                        <span
                          key={award}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '.25rem',
                            background: '#f5f5f7',
                            border: '1px solid #d2d2d7',
                            borderRadius: '999px',
                            padding: '.2rem .65rem',
                            fontSize: '.72rem',
                            fontWeight: 600,
                            color: '#1d1d1f',
                          }}
                        >
                          🏆 {award}
                        </span>
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
