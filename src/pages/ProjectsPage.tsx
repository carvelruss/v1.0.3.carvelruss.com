import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import CTABanner from '../components/CTABanner';

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
  'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
];

type Filter = 'all' | 'design' | 'frontend' | 'mobile';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  design: 'Design',
  frontend: 'Frontend',
  mobile: 'Mobile',
};

function matchesFilter(project: Project, filter: Filter): boolean {
  if (filter === 'all') return true;
  const tech = project.tech.map(t => t.toLowerCase()).join(' ');
  if (filter === 'design')   return /figma|adobe|xd|wireframe|prototype|ux|ui/i.test(tech + ' ' + project.role);
  if (filter === 'frontend') return /react|typescript|javascript|html|css|scss|vite|bootstrap/i.test(tech);
  if (filter === 'mobile')   return /react native|mobile|ios|android|flutter/i.test(tech + ' ' + project.description);
  return true;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="ws-proj-card" aria-label={`Project: ${project.title}`}>
      {project.logo_url ? (
        <div
          className="ws-proj-card__header"
          style={{
            background: '#f8f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.75rem 2rem',
          }}
        >
          <img
            src={project.logo_url}
            alt={`${project.title} logo`}
            style={{ maxHeight: '2rem', maxWidth: '80%', objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div className="ws-proj-card__header" style={{ background: GRADIENTS[index % GRADIENTS.length] }}>
          <span className="ws-proj-card__num" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="ws-proj-card__role">{project.role}</div>
        </div>
      )}

      <div className="ws-proj-card__body">
        <h3 className="ws-proj-card__title">{project.title}</h3>
        <p className="ws-proj-card__desc">{project.description}</p>

        <div className="ws-proj-card__tech" role="list" aria-label="Technologies">
          {project.tech.map(t => (
            <span key={t} className="ws-tech-pill" role="listitem">{t}</span>
          ))}
        </div>

        <div className="ws-proj-card__links">
          {project.slug && (
            <Link to={`/case-studies/${project.slug}`} className="ws-proj-link ws-proj-link--primary">
              View Case Study →
            </Link>
          )}
          {project.live_url && project.live_url !== '#' && (
            <a href={project.live_url} className="ws-proj-link" target="_blank" rel="noopener noreferrer">↗ Live Demo</a>
          )}
          {project.github_url && project.github_url !== '#' && (
            <a href={project.github_url} className="ws-proj-link" target="_blank" rel="noopener noreferrer">⌥ GitHub</a>
          )}
          {!project.slug && (!project.live_url || project.live_url === '#') && (!project.github_url || project.github_url === '#') && (
            <span className="ws-proj-link ws-proj-link--dim">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter]     = useState<Filter>('all');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    document.title = 'Case Studies | Carvel Russ';
    fetch('/api/projects')
      .then(r => r.ok ? r.json() as Promise<Project[]> : Promise.reject())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => matchesFilter(p, filter));

  /* Preview cards for the hero right side — use real projects or fallback tiles */
  const previewTiles = projects.length >= 3
    ? projects.slice(0, 3).map((p, i) => ({ label: p.role || 'Project', title: p.title, gradient: GRADIENTS[i] }))
    : [
        { label: 'UI/UX Design',    title: 'Product Design',   gradient: GRADIENTS[0] },
        { label: 'Frontend Dev',    title: 'Web Application',  gradient: GRADIENTS[2] },
        { label: 'Design Systems',  title: 'Component Library',gradient: GRADIENTS[4] },
      ];

  return (
    <>
      {/* ── Page hero ── */}
      <section className="ws-pg-hero ws-pg-hero--split">
        <div className="container">
          <div className="ws-pg-hero__inner">

            {/* Left: text + stats */}
            <div className="ws-pg-hero__content">
              <p className="ws-eyebrow">Portfolio</p>
              <h1 className="ws-pg-hero__title">Case Studies</h1>
              <p className="ws-pg-hero__sub">
                A curated selection of case studies spanning UI/UX design, frontend engineering, and design systems.
              </p>
              <div className="ws-pg-hero__stats">
                {[
                  { value: projects.length.toString(), label: 'Case Studies', icon: '🗂' },
                  { value: '6+',  label: 'Years Experience', icon: '⚡' },
                  { value: '10+', label: 'Happy Clients',    icon: '🤝' },
                ].map(s => (
                  <div key={s.label} className="ws-pg-hero__stat">
                    <span className="ws-pg-hero__stat-icon" aria-hidden="true">{s.icon}</span>
                    <span className="ws-pg-hero__stat-value">{s.value}</span>
                    <span className="ws-pg-hero__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: decorative stacked cards */}
            <div className="ws-pg-hero__visual" aria-hidden="true">
              {previewTiles.map((tile, i) => (
                <div
                  key={i}
                  className={`ws-pg-hero__preview-card ws-pg-hero__preview-card--${i}`}
                  style={{ background: tile.gradient }}
                >
                  <span className="ws-pg-hero__preview-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ws-pg-hero__preview-tag">{tile.label}</span>
                  <div className="ws-pg-hero__preview-title">{tile.title}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Filter bar + grid ── */}
      <section className="ws-section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="ws-filter-bar" role="tablist" aria-label="Filter projects">
            {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`ws-filter-btn${filter === f ? ' ws-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
                {f === 'all' && (
                  <span className="ws-filter-count">{projects.length}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ws-loading-state">Loading projects…</div>
          ) : filtered.length === 0 ? (
            <div className="ws-empty-state">No projects in this category yet.</div>
          ) : (
            <div className="row g-4">
              {filtered.map((project, i) => (
                <div key={project.id} className="col-sm-6 col-lg-4">
                  <ProjectCard project={project} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <CTABanner
          heading="Like what you see?"
          subtext="I'm available for new projects. Let's discuss your idea."
          primaryLabel="Start a Conversation"
          primaryHref="/contact"
          secondaryLabel="Read My Blog"
          secondaryHref="/blog"
        />
      </div>
    </>
  );
}
