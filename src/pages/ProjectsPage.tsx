import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as staticProjects } from '../data/projects';
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
      <div className="ws-proj-card__header" style={{ background: GRADIENTS[index % GRADIENTS.length] }}>
        <span className="ws-proj-card__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="ws-proj-card__role">{project.role}</div>
      </div>

      <div className="ws-proj-card__body">
        <h3 className="ws-proj-card__title">{project.title}</h3>
        <p className="ws-proj-card__desc">{project.description}</p>

        <div className="ws-proj-card__tech" role="list" aria-label="Technologies">
          {project.tech.map(t => (
            <span key={t} className="ws-tech-pill" role="listitem">{t}</span>
          ))}
        </div>

        <div className="ws-proj-card__links">
          {project.live_url && project.live_url !== '#' && (
            <a href={project.live_url} className="ws-proj-link" target="_blank" rel="noopener noreferrer">↗ Live Demo</a>
          )}
          {project.case_study_url && project.case_study_url !== '#' && (
            <a href={project.case_study_url} className="ws-proj-link" target="_blank" rel="noopener noreferrer">📄 Case Study</a>
          )}
          {project.github_url && project.github_url !== '#' && (
            <a href={project.github_url} className="ws-proj-link" target="_blank" rel="noopener noreferrer">⌥ GitHub</a>
          )}
          {(!project.live_url || project.live_url === '#') &&
           (!project.case_study_url || project.case_study_url === '#') &&
           (!project.github_url || project.github_url === '#') && (
            <span className="ws-proj-link ws-proj-link--dim">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => staticProjects);
  const [filter, setFilter]     = useState<Filter>('all');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    document.title = 'Case Studies | webstudio';
    fetch('/api/projects')
      .then(r => r.ok ? r.json() as Promise<Project[]> : Promise.reject())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => matchesFilter(p, filter));

  return (
    <>
      {/* ── Page hero ── */}
      <section className="ws-pg-hero">
        <div className="container">
          <button
            className="ws-article-back"
            onClick={() => navigate('/')}
            style={{ marginBottom: '1.5rem' }}
          >
            ← Home
          </button>
          <p className="ws-eyebrow">Portfolio</p>
          <h1 className="section-title">Case Studies</h1>
          <p className="ws-pg-hero__sub">
            A selection of case studies spanning UI/UX design, frontend engineering, and design systems.
          </p>
          <div className="ws-pg-hero__stats">
            <div>
              <span className="ws-pg-hero__stat-value">{projects.length}</span>
              <span className="ws-pg-hero__stat-label">Case Studies</span>
            </div>
            <div>
              <span className="ws-pg-hero__stat-value">6+</span>
              <span className="ws-pg-hero__stat-label">Years exp.</span>
            </div>
            <div>
              <span className="ws-pg-hero__stat-value">10+</span>
              <span className="ws-pg-hero__stat-label">Happy clients</span>
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
