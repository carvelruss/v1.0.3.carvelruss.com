import { useState, useEffect } from 'react';
import { projects as staticProjects } from '../data/projects';
import type { Project } from '../types';

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="projects__card card" aria-label={`Project: ${project.title}`}>
      <div className="projects__card-header">
        <h3 className="projects__card-title">{project.title}</h3>
        <span className="projects__card-role">{project.role}</span>
      </div>

      <p className="projects__card-desc">{project.description}</p>

      <div className="projects__tech" role="list" aria-label="Technologies used">
        {project.tech.map((t) => (
          <span key={t} className="tech-tag" role="listitem">{t}</span>
        ))}
      </div>

      <div className="projects__card-actions">
        {project.live_url && project.live_url !== '#' && (
          <a href={project.live_url} className="btn-ghost-custom" target="_blank" rel="noopener noreferrer" aria-label={`Live demo for ${project.title}`}>
            ↗ Live Demo
          </a>
        )}
        {project.case_study_url && project.case_study_url !== '#' && (
          <a href={project.case_study_url} className="btn-ghost-custom" target="_blank" rel="noopener noreferrer" aria-label={`Case study for ${project.title}`}>
            📄 Case Study
          </a>
        )}
        {project.github_url && project.github_url !== '#' && (
          <a href={project.github_url} className="btn-ghost-custom" target="_blank" rel="noopener noreferrer" aria-label={`GitHub repository for ${project.title}`}>
            ⌥ GitHub
          </a>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(() =>
    staticProjects.map(p => ({
      ...p,
      live_url: p.liveUrl,
      case_study_url: p.caseStudyUrl,
      github_url: p.githubUrl,
      sort_order: p.id,
    }))
  );

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() as Promise<Project[]> : Promise.reject())
      .then(setProjects)
      .catch(() => { /* keep static fallback */ });
  }, []);

  return (
    <section id="projects" className="section" aria-label="Projects">
      <div className="container-site">
        <h2 className="section__title">Projects</h2>
        <div className="projects__grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
