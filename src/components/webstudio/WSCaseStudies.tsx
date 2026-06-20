import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types';

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
];

const PLACEHOLDERS = [
  { title: 'Fintech Dashboard Redesign', badge: 'Dashboard Design', desc: 'Redesigned a complex financial dashboard to improve usability, clarity and data visualization.' },
  { title: 'E-Commerce Mobile App', badge: 'Mobile App Design', desc: 'Created a modern shopping experience that increased conversions by 36%.' },
  { title: 'SaaS Landing Page', badge: 'Web Design', desc: 'Created a conversion-focused landing page for a B2B SaaS product.' },
];

export default function WSCaseStudies() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    fetch('/api/projects?featured=1')
      .then(r => r.json())
      .then((data: Project[]) => setProjects(data.slice(0, 3)))
      .catch(() => setProjects([]));
  }, []);

  const loading = projects === null;
  const hasFeatured = !loading && projects.length > 0;

  return (
    <section className="pf-section pf-section--gray">
      <div className="container">
        <div className="pf-section-head">
          <div>
            <span className="pf-section-label">FEATURED CASE STUDIES</span>
            <h2 className="pf-section-title">Selected Work</h2>
          </div>
          <Link to="/case-studies" className="pf-view-all">View All Case Studies →</Link>
        </div>

        <div className="pf-cs-grid">
          {hasFeatured
            ? projects.map((p, i) => (
                <article key={p.id} className="pf-cs-card">
                  {p.cover_url ? (
                    <img
                      className="pf-cs-card__img"
                      src={p.cover_url}
                      alt={p.title}
                    />
                  ) : (
                    <div
                      className="pf-cs-card__cover-fallback"
                      style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                    />
                  )}
                  <div className="pf-cs-card__body">
                    <span className="pf-cs-card__badge">
                      {p.project_type ?? p.role}
                    </span>
                    <h3 className="pf-cs-card__title">{p.title}</h3>
                    <p className="pf-cs-card__desc">
                      {p.excerpt ?? p.description}
                    </p>
                    {p.slug && (
                      <Link to={`/case-studies/${p.slug}`} className="pf-cs-card__link">
                        View Case Study →
                      </Link>
                    )}
                  </div>
                </article>
              ))
            : PLACEHOLDERS.map((ph, i) => (
                <article key={ph.title} className="pf-cs-card">
                  <div
                    className="pf-cs-card__cover-fallback"
                    style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                  />
                  <div className="pf-cs-card__body">
                    <span className="pf-cs-card__badge">{ph.badge}</span>
                    <h3 className="pf-cs-card__title">{ph.title}</h3>
                    <p className="pf-cs-card__desc">{ph.desc}</p>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
