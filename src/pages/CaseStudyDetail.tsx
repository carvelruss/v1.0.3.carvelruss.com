import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiGlobe, FiGithub, FiChevronRight, FiArrowLeft,
  FiUser, FiLayers, FiClock, FiBriefcase,
} from 'react-icons/fi';
import '../styles/case-study-detail.css';
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
      <div className="cs-loading">
        <div className="pf-spinner" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="cs-not-found">
        <div className="container">
          <p className="pf-eyebrow">404</p>
          <h1>Case study not found</h1>
          <p style={{ color: 'var(--pf-muted)', marginTop: '.5rem', marginBottom: '1.5rem' }}>
            The project you're looking for doesn't exist or may have been moved.
          </p>
          <button className="ws-btn-primary" onClick={() => navigate('/case-studies')}>
            <FiArrowLeft size={15} /> Back to Case Studies
          </button>
        </div>
      </div>
    );
  }

  const sidebarMeta = [
    project.project_type && { icon: FiLayers,   label: 'Project Type', value: project.project_type },
    project.role         && { icon: FiUser,      label: 'Role',         value: project.role          },
    project.client_name  && { icon: FiBriefcase, label: 'Client',       value: project.client_name   },
    project.timeline     && { icon: FiClock,     label: 'Timeline',     value: project.timeline      },
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number }>, label: string; value: string }[];

  return (
    <article className="cs-page">

      {/* ── Dark hero ───────────────────────────────────────────── */}
      <div className="cs-hero">
        <div className="container">

          {/* Breadcrumb */}
          <nav className="cs-breadcrumb" aria-label="Breadcrumb">
            <button className="cs-breadcrumb__btn" onClick={() => navigate('/')}>Home</button>
            <FiChevronRight size={12} aria-hidden />
            <button className="cs-breadcrumb__btn" onClick={() => navigate('/case-studies')}>Case Studies</button>
            <FiChevronRight size={12} aria-hidden />
            <span>{project.title}</span>
          </nav>

          <div className="cs-hero__inner">

            {/* Badges */}
            <div className="cs-badges">
              <span className="cs-badge">Case Study</span>
              {project.project_type && (
                <span className="cs-badge cs-badge--blue">{project.project_type}</span>
              )}
            </div>

            {/* Logo */}
            {project.logo_url && (
              <img
                src={project.logo_url}
                alt={`${project.title} logo`}
                className="cs-hero__logo"
              />
            )}

            {/* Title */}
            <h1 className="cs-hero__title">{project.title}</h1>

            {/* Description */}
            <p className="cs-hero__desc">
              {project.excerpt || project.description}
            </p>

            {/* CTAs */}
            <div className="cs-hero__ctas">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="cs-cta-primary">
                  <FiGlobe size={15} /> View Live Site
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="cs-cta-outline">
                  <FiGithub size={15} /> GitHub
                </a>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="cs-body">
        <div className="container">
          <div className="row g-5 align-items-start">

            {/* Content */}
            <main className="col-lg-8">
              {project.cover_url && (
                <div className="cs-cover">
                  <img
                    src={project.cover_url}
                    alt={`${project.title} preview`}
                    className="cs-cover__img"
                  />
                </div>
              )}
              {project.content ? (
                <div
                  className="pf-prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(project.content) }}
                />
              ) : (
                <p className="ws-empty-state">No case study content yet.</p>
              )}
            </main>

            {/* Sidebar */}
            <aside className="col-lg-4">
              <div className="cs-sidebar">

                {/* Project details */}
                {sidebarMeta.length > 0 && (
                  <div className="cs-sidebar__block">
                    <div className="cs-sidebar__heading">Project Details</div>
                    <ul className="cs-meta-list">
                      {sidebarMeta.map(({ icon: Icon, label, value }) => (
                        <li key={label} className="cs-meta-list__item">
                          <div className="cs-meta-list__icon">
                            <Icon size={13} />
                          </div>
                          <div>
                            <div className="cs-meta-list__label">{label}</div>
                            <div className="cs-meta-list__value">{value}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech stack */}
                {project.tech.length > 0 && (
                  <div className="cs-sidebar__block">
                    <div className="cs-sidebar__heading">Tech Stack</div>
                    <div className="cs-sidebar__pills">
                      {project.tech.map(t => (
                        <span key={t} className="ws-tech-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                )}



              </div>
            </aside>

          </div>
        </div>
      </div>

    </article>
  );
}
