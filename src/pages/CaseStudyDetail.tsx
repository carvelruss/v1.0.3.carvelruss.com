import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { Project } from '../types';

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getProjectBySlug(slug)
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="cs-loading">
        <div className="container-site">Loading…</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="cs-not-found">
        <div className="container-site">
          <h1>Case study not found</h1>
          <button className="btn btn-primary" onClick={() => navigate('/case-studies')}>
            ← Back to Case Studies
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="cs-detail">

      {/* Hero */}
      <div className="cs-detail__hero">
        <div className="container-site">
          <button className="cs-detail__back" onClick={() => navigate('/case-studies')}>
            ← Back to Case Studies
          </button>
          <div className="cs-detail__meta">
            <span className="section__eyebrow">Case Study</span>
          </div>
          <h1 className="cs-detail__title">{project.title}</h1>
          <p className="cs-detail__description">{project.description}</p>
          <div className="cs-detail__tech">
            {project.tech.map(t => (
              <span key={t} className="skill-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-site cs-detail__body">
        <div className="cs-detail__layout">

          {/* Main content */}
          <main className="cs-detail__content">
            {project.content ? (
              <div
                className="cs-detail__prose"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(project.content) }}
              />
            ) : (
              <p className="cs-detail__empty">No case study content yet.</p>
            )}
          </main>

          {/* Sidebar */}
          <aside className="cs-detail__sidebar">
            <div className="cs-detail__sidebar-card">
              <h3>Project Details</h3>

              {project.role && (
                <div className="cs-detail__sidebar-row">
                  <span className="cs-detail__sidebar-label">Role</span>
                  <span>{project.role}</span>
                </div>
              )}

              {project.tech.length > 0 && (
                <div className="cs-detail__sidebar-row">
                  <span className="cs-detail__sidebar-label">Tech Stack</span>
                  <span>{project.tech.join(', ')}</span>
                </div>
              )}

              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-detail__sidebar-link"
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
