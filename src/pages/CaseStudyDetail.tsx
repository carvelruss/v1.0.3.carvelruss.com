import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiGlobe, FiGithub, FiChevronRight, FiArrowLeft,
  FiUser, FiLayers, FiClock, FiBriefcase,
} from 'react-icons/fi';
import '../styles/case-study-detail.css';
import { api } from '../lib/api';
import type { Project } from '../types';
import { parseBuilderData, type BuilderData } from '../admin/components/CaseStudyBuilder';

// ── Structured content renderer ────────────────────────────────

function renderText(text: string) {
  return text.split(/\n\n+/).filter(s => s.trim()).map((para, i) => (
    <p key={i}>
      {para.split('\n').map((line, j) =>
        j === 0 ? line : [<br key={j} />, line]
      )}
    </p>
  ));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cs-section">
      <h2 className="cs-section__title">{title}</h2>
      <div className="cs-section__body">{children}</div>
    </section>
  );
}

function TextBlock({ text }: { text: string }) {
  if (!text?.trim()) return null;
  return <>{renderText(text)}</>;
}

function SubHeading({ label }: { label: string }) {
  return <h3 className="cs-section__subhead">{label}</h3>;
}

function TechTags({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  return (
    <div className="cs-dev-row">
      <span className="cs-dev-label">{label}</span>
      <div className="cs-dev-tags">
        {items.map(t => <span key={t} className="ws-tech-pill">{t}</span>)}
      </div>
    </div>
  );
}

function CaseStudySections({ content }: { content: string }) {
  const d: BuilderData = parseBuilderData(content);
  const sections: React.ReactElement[] = [];

  // 1. Overview
  if (d.overview.trim()) {
    sections.push(
      <Section key="overview" title="Overview">
        <TextBlock text={d.overview} />
      </Section>
    );
  }

  // 2. Background
  if (d.about_client || d.target_audience || d.business_context || d.existing_situation) {
    sections.push(
      <Section key="background" title="Background">
        <TextBlock text={d.about_client} />
        {d.target_audience && <><SubHeading label="Target Audience" /><TextBlock text={d.target_audience} /></>}
        {d.business_context && <><SubHeading label="Business Context" /><TextBlock text={d.business_context} /></>}
        {d.existing_situation && <><SubHeading label="Existing Situation" /><TextBlock text={d.existing_situation} /></>}
      </Section>
    );
  }

  // 3. The Challenge
  if (d.main_challenge || d.pain_points.length || d.business_impact || d.why_new_solution) {
    sections.push(
      <Section key="challenge" title="The Challenge">
        <TextBlock text={d.main_challenge} />
        {d.pain_points.filter(p => p.trim()).length > 0 && (
          <ul className="cs-objectives">
            {d.pain_points.filter(p => p.trim()).map((p, i) => (
              <li key={i} className="cs-objectives__item">{p}</li>
            ))}
          </ul>
        )}
        {d.business_impact && <><SubHeading label="Business Impact" /><TextBlock text={d.business_impact} /></>}
        {d.why_new_solution && <><SubHeading label="Why a New Solution" /><TextBlock text={d.why_new_solution} /></>}
      </Section>
    );
  }

  // 4. Objectives
  if (d.objectives.filter(o => o.trim()).length > 0) {
    sections.push(
      <Section key="objectives" title="Objectives">
        <ul className="cs-objectives">
          {d.objectives.filter(o => o.trim()).map((o, i) => (
            <li key={i} className="cs-objectives__item">{o}</li>
          ))}
        </ul>
      </Section>
    );
  }

  // 5. Approach
  if (d.discovery || d.research || d.competitor_analysis || d.planning || d.strategy || d.technical_considerations) {
    sections.push(
      <Section key="approach" title="Approach">
        {d.discovery && <><SubHeading label="Discovery" /><TextBlock text={d.discovery} /></>}
        {d.research && <><SubHeading label="Research" /><TextBlock text={d.research} /></>}
        {d.competitor_analysis && <><SubHeading label="Competitor Analysis" /><TextBlock text={d.competitor_analysis} /></>}
        {d.planning && <><SubHeading label="Planning" /><TextBlock text={d.planning} /></>}
        {d.strategy && <><SubHeading label="Strategy" /><TextBlock text={d.strategy} /></>}
        {d.technical_considerations && <><SubHeading label="Technical Considerations" /><TextBlock text={d.technical_considerations} /></>}
      </Section>
    );
  }

  // 6. Solution
  if (d.solution_summary || d.how_solved || d.ux_improvements || d.technical_improvements || d.business_improvements) {
    sections.push(
      <Section key="solution" title="Solution">
        <TextBlock text={d.solution_summary} />
        {d.how_solved && <><SubHeading label="How We Solved It" /><TextBlock text={d.how_solved} /></>}
        {d.ux_improvements && <><SubHeading label="UX Improvements" /><TextBlock text={d.ux_improvements} /></>}
        {d.technical_improvements && <><SubHeading label="Technical Improvements" /><TextBlock text={d.technical_improvements} /></>}
        {d.business_improvements && <><SubHeading label="Business Improvements" /><TextBlock text={d.business_improvements} /></>}
      </Section>
    );
  }

  // 7. Key Features
  if (d.key_features.filter(f => f.title || f.description).length > 0) {
    sections.push(
      <Section key="key_features" title="Key Features">
        <div className="cs-features">
          {d.key_features.filter(f => f.title || f.description).map((f, i) => (
            <div key={i} className="cs-feature-card">
              {f.title && <h3 className="cs-feature-card__title">{f.title}</h3>}
              {f.description && <p className="cs-feature-card__desc">{f.description}</p>}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // 8. Development Process
  const hasDev = d.frontend_tech.length || d.backend_tech.length || d.database_tech.length ||
    d.apis_integrations || d.architecture || d.security || d.performance || d.scalability || d.deployment;
  if (hasDev) {
    sections.push(
      <Section key="dev_process" title="Development Process">
        <div className="cs-dev-tech">
          <TechTags items={d.frontend_tech} label="Frontend" />
          <TechTags items={d.backend_tech}  label="Backend"  />
          <TechTags items={d.database_tech} label="Database" />
        </div>
        {d.apis_integrations && <><SubHeading label="APIs & Integrations" /><TextBlock text={d.apis_integrations} /></>}
        {d.architecture      && <><SubHeading label="Architecture"        /><TextBlock text={d.architecture}      /></>}
        {d.security          && <><SubHeading label="Security"            /><TextBlock text={d.security}          /></>}
        {d.performance       && <><SubHeading label="Performance"         /><TextBlock text={d.performance}       /></>}
        {d.scalability       && <><SubHeading label="Scalability"         /><TextBlock text={d.scalability}       /></>}
        {d.deployment        && <><SubHeading label="Deployment"          /><TextBlock text={d.deployment}        /></>}
      </Section>
    );
  }

  // 9. Challenges & Solutions
  if (d.challenges_solutions.filter(c => c.challenge || c.solution || c.result).length > 0) {
    sections.push(
      <Section key="challenges" title="Challenges & Solutions">
        <div className="cs-challenges">
          {d.challenges_solutions.filter(c => c.challenge || c.solution || c.result).map((c, i) => (
            <div key={i} className="cs-challenge-block">
              {c.challenge && (
                <div className="cs-challenge-block__row cs-challenge-block__row--challenge">
                  <span className="cs-challenge-block__label">Challenge</span>
                  <p>{c.challenge}</p>
                </div>
              )}
              {c.solution && (
                <div className="cs-challenge-block__row cs-challenge-block__row--solution">
                  <span className="cs-challenge-block__label">Solution</span>
                  <p>{c.solution}</p>
                </div>
              )}
              {c.result && (
                <div className="cs-challenge-block__row cs-challenge-block__row--result">
                  <span className="cs-challenge-block__label">Result</span>
                  <p>{c.result}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // 10. Results
  if (d.project_outcomes || d.performance_improvements || d.business_benefits || d.client_feedback || d.achievements.filter(a => a.trim()).length) {
    sections.push(
      <Section key="results" title="Results & Outcomes">
        <TextBlock text={d.project_outcomes} />
        {d.performance_improvements && <><SubHeading label="Performance" /><TextBlock text={d.performance_improvements} /></>}
        {d.business_benefits        && <><SubHeading label="Business Benefits" /><TextBlock text={d.business_benefits} /></>}
        {d.achievements.filter(a => a.trim()).length > 0 && (
          <ul className="cs-objectives">
            {d.achievements.filter(a => a.trim()).map((a, i) => (
              <li key={i} className="cs-objectives__item">{a}</li>
            ))}
          </ul>
        )}
        {d.client_feedback && (
          <blockquote className="cs-quote">{d.client_feedback}</blockquote>
        )}
      </Section>
    );
  }

  // 11. Screenshots
  if (d.screenshots.filter(s => s.url).length > 0) {
    sections.push(
      <Section key="screenshots" title="Screenshots">
        <div className="cs-screenshots">
          {d.screenshots.filter(s => s.url).map((s, i) => (
            <figure key={i} className="cs-screenshot">
              <img src={s.url} alt={s.caption || `Screenshot ${i + 1}`} className="cs-screenshot__img" />
              {s.caption && <figcaption className="cs-screenshot__caption">{s.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </Section>
    );
  }

  // 12. Key Takeaways
  if (d.lessons_learned || d.technical_insights || d.ux_insights || d.business_insights || d.future_improvements) {
    sections.push(
      <Section key="takeaways" title="Key Takeaways">
        <TextBlock text={d.lessons_learned} />
        {d.technical_insights  && <><SubHeading label="Technical Insights"  /><TextBlock text={d.technical_insights}  /></>}
        {d.ux_insights         && <><SubHeading label="UX Insights"         /><TextBlock text={d.ux_insights}         /></>}
        {d.business_insights   && <><SubHeading label="Business Insights"   /><TextBlock text={d.business_insights}   /></>}
        {d.future_improvements && <><SubHeading label="Future Improvements" /><TextBlock text={d.future_improvements} /></>}
      </Section>
    );
  }

  if (sections.length === 0) return <p className="ws-empty-state">No case study content yet.</p>;
  return <div className="cs-sections">{sections}</div>;
}

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
              {project.content
                ? <CaseStudySections content={project.content} />
                : <p className="ws-empty-state">No case study content yet.</p>
              }
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
