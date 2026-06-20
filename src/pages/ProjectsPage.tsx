import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import CaseStudiesHero from '../components/public/CaseStudiesHero';

const GRADIENTS = [
  'linear-gradient(135deg,#6366f1 0%,#818cf8 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)',
  'linear-gradient(135deg,#0d9488 0%,#2dd4bf 100%)',
  'linear-gradient(135deg,#ea580c 0%,#fb923c 100%)',
  'linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)',
  'linear-gradient(135deg,#be185d 0%,#f472b6 100%)',
];

function truncate(text: string, max = 120): string {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const badge = project.project_type || project.role || 'Project';
  const desc = truncate(project.excerpt || project.description || '');

  return (
    <div className="pf-cs-card" style={{ height: '100%' }}>
      {project.cover_url ? (
        <img
          className="pf-cs-card__img"
          src={project.cover_url}
          alt={`${project.title} cover`}
        />
      ) : (
        <div
          className="pf-cs-card__cover-fallback"
          style={{ background: GRADIENTS[index % GRADIENTS.length] }}
        />
      )}
      <div className="pf-cs-card__body">
        <span className="pf-cs-card__badge">{badge}</span>
        <h3 className="pf-cs-card__title">{project.title}</h3>
        {desc && <p className="pf-cs-card__desc">{desc}</p>}
        {project.slug && (
          <Link className="pf-cs-card__link" to={`/case-studies/${project.slug}`}>
            View Case Study →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    document.title = 'Case Studies | Carvel Russ';
    fetch('/api/projects')
      .then(r => (r.ok ? (r.json() as Promise<Project[]>) : Promise.reject()))
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    projects.forEach(p => {
      const cat = p.project_type || p.role;
      if (cat) seen.add(cat);
    });
    return Array.from(seen).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter(p => {
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.excerpt || '').toLowerCase().includes(term);
      const matchCat =
        category === 'all' ||
        (p.project_type || p.role) === category;
      return matchSearch && matchCat;
    });
  }, [projects, search, category]);

  return (
    <>
      <CaseStudiesHero />

      {/* Filter bar + project grid */}
      <section id="case-studies-list" className="pf-section pf-section--sm">
        <div className="container">

          <div className="pf-filter-bar">
            <div className="pf-search-wrap">
              <svg
                className="pf-search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="pf-search"
                type="search"
                placeholder="Search case studies…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search case studies"
              />
            </div>

            <select
              className="pf-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="ws-loading-state">
              <span className="pf-spinner" aria-hidden="true" />
              Loading case studies…
            </div>
          ) : filtered.length === 0 ? (
            <div className="ws-empty-state">
              {search || category !== 'all'
                ? 'No case studies match your filters.'
                : 'No case studies yet — check back soon.'}
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((project, i) => (
                <div key={project.id} className="col-md-6">
                  <ProjectCard project={project} index={i} />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
