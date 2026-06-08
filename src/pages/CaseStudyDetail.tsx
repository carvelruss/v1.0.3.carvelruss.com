import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { Project } from '../types';

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project,  setProject]  = useState<Project | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getProjectBySlug(slug)
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="ws-loading-state" style={{ paddingTop: '6rem' }}>Loading…</div>;
  }

  if (notFound || !project) {
    return (
      <div className="ws-pg-hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <h1 className="section-title">Case study not found</h1>
          <button className="ws-btn-primary" onClick={() => navigate('/case-studies')}>
            ← Back to Case Studies
          </button>
        </div>
      </div>
    );
  }

  return (
    <article>

      {/* Hero */}
      <div className="ws-cs-hero">
        <div className="container">
          <button className="ws-article-back" onClick={() => navigate('/case-studies')}>
            ← Back to Case Studies
          </button>
          <p className="ws-eyebrow">Case Study</p>
          <h1 className="ws-cs-title">{project.title}</h1>
          <p className="ws-cs-desc">{project.description}</p>
          <div className="ws-proj-card__tech">
            {project.tech.map(t => (
              <span key={t} className="ws-tech-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '4rem' }}>
        <div className="row g-5 align-items-start">

          <main className="col-lg-8">
            {project.content ? (
              <div
                className="ws-article-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(project.content) }}
              />
            ) : (
              <div className="ws-empty-state">No case study content yet.</div>
            )}
          </main>

          <aside className="col-lg-4">
            <div className="ws-cs-sidebar-card">
              <h3>Project Details</h3>

              {project.role && (
                <div className="ws-cs-sidebar-row">
                  <span className="ws-cs-sidebar-label">Role</span>
                  <span className="ws-cs-sidebar-value">{project.role}</span>
                </div>
              )}

              {project.tech.length > 0 && (
                <div className="ws-cs-sidebar-row">
                  <span className="ws-cs-sidebar-label">Tech Stack</span>
                  <span className="ws-cs-sidebar-value">{project.tech.join(', ')}</span>
                </div>
              )}

              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ws-btn-primary"
                  style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem' }}
                >
                  View Live Site →
                </a>
              )}
            </div>
          </aside>

        </div>
      </div>
    </article>
  );
}
