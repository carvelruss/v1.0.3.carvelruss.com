import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUser, FiCode, FiGlobe, FiGithub, FiChevronRight, FiExternalLink } from 'react-icons/fi';
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

          {/* Breadcrumb */}
          <nav className="ws-cs-breadcrumb" aria-label="Breadcrumb">
            <button className="ws-cs-breadcrumb__item" onClick={() => navigate('/')}>Home</button>
            <FiChevronRight className="ws-cs-breadcrumb__sep" size={13} />
            <button className="ws-cs-breadcrumb__item" onClick={() => navigate('/case-studies')}>Case Studies</button>
            <FiChevronRight className="ws-cs-breadcrumb__sep" size={13} />
            <span className="ws-cs-breadcrumb__item ws-cs-breadcrumb__item--current">{project.title}</span>
          </nav>

          <p className="ws-eyebrow">Case Study</p>

          {project.logo_url && (
            <div className="ws-cs-hero-logo-wrap">
              <img
                src={project.logo_url}
                alt={`${project.title} logo`}
                className="ws-cs-hero-logo"
              />
            </div>
          )}

          <h1 className="ws-cs-title">{project.title}</h1>
          <p className="ws-cs-desc">{project.description}</p>

          {/* Meta strip */}
          <div className="ws-cs-meta-strip">
            {project.role && (
              <div className="ws-cs-meta-item">
                <FiUser size={14} className="ws-cs-meta-icon" />
                <span>{project.role}</span>
              </div>
            )}
            {project.tech.length > 0 && (
              <div className="ws-cs-meta-item">
                <FiCode size={14} className="ws-cs-meta-icon" />
                <span>{project.tech.length} {project.tech.length === 1 ? 'Technology' : 'Technologies'}</span>
              </div>
            )}
            {project.live_url && (
              <div className="ws-cs-meta-item">
                <FiGlobe size={14} className="ws-cs-meta-icon" />
                <span>Live Project</span>
              </div>
            )}
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

              {project.logo_url && (
                <div className="ws-cs-sidebar-logo-wrap">
                  <img
                    src={project.logo_url}
                    alt={`${project.title} logo`}
                    className="ws-cs-sidebar-logo"
                  />
                </div>
              )}

              <div className="ws-cs-sidebar-body">
                <h3 className="ws-cs-sidebar-heading">Project at a Glance</h3>

                <ul className="ws-cs-includes">
                  {project.role && (
                    <li className="ws-cs-includes-item">
                      <FiUser size={15} className="ws-cs-includes-icon" />
                      <div>
                        <span className="ws-cs-sidebar-label">Role</span>
                        <span className="ws-cs-sidebar-value">{project.role}</span>
                      </div>
                    </li>
                  )}
                  {project.tech.length > 0 && (
                    <li className="ws-cs-includes-item">
                      <FiCode size={15} className="ws-cs-includes-icon" />
                      <div>
                        <span className="ws-cs-sidebar-label">Tech Stack</span>
                        <span className="ws-cs-sidebar-value">{project.tech.join(', ')}</span>
                      </div>
                    </li>
                  )}
                </ul>

                <div className="ws-cs-sidebar-ctas">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ws-btn-primary ws-cs-sidebar-btn"
                    >
                      <FiExternalLink size={15} />
                      View Live Site
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ws-btn-outline ws-cs-sidebar-btn"
                    >
                      <FiGithub size={15} />
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </article>
  );
}
