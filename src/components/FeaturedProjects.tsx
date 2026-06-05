import { useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';

const COVERS = [
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #0a7a80 0%, #00c2c2 60%, #005f6b 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #6b35c9 55%, #1a0f3c 100%)',
];

export default function FeaturedProjects() {
  const navigate = useNavigate();
  const featured = projects.slice(0, 4);

  return (
    <section className="featured-projects" aria-label="Featured projects">
      <div className="container-site">

        {/* Header */}
        <div className="featured-projects__header">
          <h2 className="featured-projects__heading">Featured Projects</h2>
          <p className="featured-projects__sub">
            <span className="featured-projects__sub-accent">UI/UX design</span>,{' '}
            <span className="featured-projects__sub-accent">frontend engineering</span>,{' '}
            design systems, and end-to-end digital product delivery.
          </p>
        </div>

        {/* Mosaic grid */}
        <div className="featured-projects__grid">
          {featured.map((project, i) => (
            <div
              key={project.slug}
              className={`featured-projects__card featured-projects__card--${i + 1}`}
              style={{ background: COVERS[i] }}
              onClick={() => navigate(`/case-studies/${project.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/case-studies/${project.slug}`)}
              aria-label={`View case study: ${project.title}`}
            >
              {/* Decorative dot pattern */}
              <div className="featured-projects__card-dots" aria-hidden="true" />

              {/* Info overlay on hover */}
              <div className="featured-projects__card-overlay">
                <span className="featured-projects__card-role">{project.role}</span>
                <h3 className="featured-projects__card-title">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="featured-projects__cta">
          <button className="featured-projects__btn" onClick={() => navigate('/case-studies')}>
            Explore all
          </button>
        </div>

      </div>
    </section>
  );
}
