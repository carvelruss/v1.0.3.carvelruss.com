import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects as staticProjects } from '../data/projects';
import type { Project } from '../types';
import CTABanner from '../components/CTABanner';

const GRADIENTS = [
  'linear-gradient(135deg, #1877f2 0%, #42a1f5 100%)',
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
  if (filter === 'design') return /figma|adobe|xd|wireframe|prototype|ux|ui/i.test(tech + ' ' + project.role);
  if (filter === 'frontend') return /react|typescript|javascript|html|css|scss|vite|bootstrap/i.test(tech);
  if (filter === 'mobile') return /react native|mobile|ios|android|flutter/i.test(tech + ' ' + project.description);
  return true;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <article className="proj-card" aria-label={`Project: ${project.title}`}>
      <div className="proj-card__header" style={{ background: gradient }}>
        <span className="proj-card__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="proj-card__role-badge">{project.role}</div>
      </div>

      <div className="proj-card__body">
        <h3 className="proj-card__title">{project.title}</h3>
        <p className="proj-card__desc">{project.description}</p>

        <div className="proj-card__tech" role="list" aria-label="Technologies">
          {project.tech.map(t => (
            <span key={t} className="tech-tag" role="listitem">{t}</span>
          ))}
        </div>

        <div className="proj-card__actions">
          {project.live_url && project.live_url !== '#' && (
            <a href={project.live_url} className="proj-card__link" target="_blank" rel="noopener noreferrer">
              ↗ Live Demo
            </a>
          )}
          {project.case_study_url && project.case_study_url !== '#' && (
            <a href={project.case_study_url} className="proj-card__link" target="_blank" rel="noopener noreferrer">
              📄 Case Study
            </a>
          )}
          {project.github_url && project.github_url !== '#' && (
            <a href={project.github_url} className="proj-card__link" target="_blank" rel="noopener noreferrer">
              ⌥ GitHub
            </a>
          )}
          {(!project.live_url || project.live_url === '#') &&
           (!project.case_study_url || project.case_study_url === '#') &&
           (!project.github_url || project.github_url === '#') && (
            <span className="proj-card__link" style={{ opacity: 0.5, cursor: 'default' }}>Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => staticProjects);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Case Studies | devfolio';
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
      <section className="page-hero">
        <div className="container-site page-hero__inner">
          <button className="page-hero__back" onClick={() => navigate('/')} aria-label="Back to home">
            ← Home
          </button>
          <div className="page-hero__content">
            <span className="page-hero__eyebrow">Portfolio</span>
            <h1 className="page-hero__heading">Case Studies</h1>
            <p className="page-hero__sub">
              A selection of case studies spanning UI/UX design, frontend engineering, and design systems.
            </p>
          </div>
          <div className="page-hero__stat-row">
            <div className="page-hero__stat">
              <span className="page-hero__stat-value">{projects.length}</span>
              <span className="page-hero__stat-label">Case Studies</span>
            </div>
            <div className="page-hero__stat">
              <span className="page-hero__stat-value">6+</span>
              <span className="page-hero__stat-label">Years exp.</span>
            </div>
            <div className="page-hero__stat">
              <span className="page-hero__stat-value">10+</span>
              <span className="page-hero__stat-label">Happy clients</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="container-site" style={{ marginTop: '2rem' }}>
        <div className="proj-filters" role="tablist" aria-label="Filter projects">
          {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`proj-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {f === 'all' && (
                <span className="proj-filter-btn__count">{projects.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects grid ── */}
      <div className="container-site" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#65676b' }}>Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#65676b' }}>
            No projects in this category yet.
          </div>
        ) : (
          <div className="proj-grid">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="container-site" style={{ paddingBottom: '3rem' }}>
        <CTABanner
          heading="Like what you see?"
          subtext="I'm available for new projects. Let's discuss your idea."
          primaryLabel="Start a Conversation"
          primaryHref="/#contact"
          secondaryLabel="Read My Blog"
          secondaryHref="/blog"
        />
      </div>
    </>
  );
}
