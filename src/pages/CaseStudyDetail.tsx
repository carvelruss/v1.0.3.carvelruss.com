import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/case-study-detail.css';
import {
  FiGlobe, FiGithub, FiChevronRight, FiArrowLeft,
  FiUser, FiLayers, FiClock, FiBriefcase, FiTool,
} from 'react-icons/fi';
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
      .then(p => { setProject(p); document.title = `${p.title} | Carvel Russ`; })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div className="pf-spinner" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="pf-page-hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <p className="pf-eyebrow">404</p>
          <h1 className="pf-page-hero__title">Case study not found</h1>
          <p className="pf-page-hero__sub">The project you're looking for doesn't exist or may have been moved.</p>
          <button className="ws-btn-primary" onClick={() => navigate('/case-studies')} style={{ marginTop: '1.5rem' }}>
            <FiArrowLeft size={15} /> Back to Case Studies
          </button>
        </div>
      </div>
    );
  }

  const metaItems = [
    project.project_type && { icon: FiLayers,   label: 'Project Type', value: project.project_type  },
    project.role         && { icon: FiUser,      label: 'Role',         value: project.role           },
    project.client_name  && { icon: FiBriefcase, label: 'Client',       value: project.client_name   },
    project.timeline     && { icon: FiClock,     label: 'Timeline',     value: project.timeline       },
    project.tools        && { icon: FiTool,      label: 'Tools',        value: project.tools          },
  ].filter(Boolean) as { icon: React.ComponentType<{size?: number}>, label: string; value: string }[];

  return (
    <article>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="pf-cs-detail__hero">
        <div className="container">

          {/* Breadcrumb */}
          <nav className="cs-breadcrumb" aria-label="Breadcrumb">
            <button className="cs-breadcrumb__item" onClick={() => navigate('/')}>Home</button>
            <FiChevronRight size={12} className="cs-breadcrumb__sep" />
            <button className="cs-breadcrumb__item" onClick={() => navigate('/case-studies')}>Case Studies</button>
            <FiChevronRight size={12} className="cs-breadcrumb__sep" />
            <span className="cs-breadcrumb__item cs-breadcrumb__item--active">{project.title}</span>
          </nav>

          {/* Eyebrow badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.5rem' }}>
            <span className="cs-hero-badge">Case Study</span>
            {project.project_type && (
              <span className="cs-hero-badge cs-hero-badge--accent">{project.project_type}</span>
            )}
          </div>

          {/* Logo */}
          {project.logo_url && (
            <div style={{ marginBottom: '1.25rem' }}>
              <img
                src={project.logo_url}
                alt={`${project.title} logo`}
                style={{ height: 44, maxWidth: 180, objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Title */}
          <h1 className="cs-hero-title">{project.title}</h1>

          {/* Description */}
          <p className="cs-hero-desc">
            {project.excerpt || project.description}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center' }}>
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn-primary"
              >
                <FiGlobe size={15} /> View Live Site
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn-ghost"
              >
                <FiGithub size={15} /> GitHub
              </a>
            )}
            <button className="cs-back-link" onClick={() => navigate('/case-studies')}>
              <FiArrowLeft size={14} /> All Case Studies
            </button>
          </div>

        </div>
      </div>

      {/* ── Cover image ─────────────────────────────────────────── */}
      {project.cover_url && (
        <div className="cs-cover-wrap">
          <div className="container">
            <img
              src={project.cover_url}
              alt={`${project.title} cover`}
              className="cs-cover-img"
            />
          </div>
        </div>
      )}

      {/* ── Meta grid ───────────────────────────────────────────── */}
      {metaItems.length > 0 && (
        <div className="cs-meta-band">
          <div className="container">
            <div className="cs-meta-grid">
              {metaItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="cs-meta-item">
                  <Icon size={14} />
                  <div>
                    <div className="cs-meta-item__label">{label}</div>
                    <div className="cs-meta-item__value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content + Sidebar ───────────────────────────────────── */}
      <div className="container cs-body">
        <div className="row g-5 align-items-start">

          {/* Content */}
          <main className="col-lg-8">
            {project.content ? (
              <div
                className="pf-prose"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(project.content) }}
              />
            ) : (
              <div className="ws-empty-state">No case study content yet.</div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="col-lg-4">
            <div className="cs-sidebar">

              {/* Tech Stack */}
              {project.tech.length > 0 && (
                <div className="cs-sidebar__section">
                  <div className="cs-sidebar__label">Tech Stack</div>
                  <div className="cs-sidebar__tags">
                    {project.tech.map(t => (
                      <span key={t} className="ws-tech-pill">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(project.live_url || project.github_url) && (
                <div className="cs-sidebar__section cs-sidebar__links">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ws-btn-primary"
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      <FiGlobe size={15} /> View Live Site
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ws-btn-secondary"
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      <FiGithub size={15} /> View on GitHub
                    </a>
                  )}
                </div>
              )}

              {/* Back */}
              <button className="cs-sidebar__back" onClick={() => navigate('/case-studies')}>
                <FiArrowLeft size={14} /> All Case Studies
              </button>

            </div>
          </aside>

        </div>
      </div>

    </article>
  );
}
