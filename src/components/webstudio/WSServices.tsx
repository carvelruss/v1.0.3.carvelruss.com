import { ReactNode } from 'react';
import { FiCode, FiSmartphone, FiPenTool } from 'react-icons/fi';

interface Service {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  tags: string[];
}

const SERVICES: Service[] = [
  {
    icon: <FiCode size={22} aria-hidden="true" />,
    iconBg: '#eef2ff',
    iconColor: '#6366f1',
    title: 'Web development',
    description:
      'We craft scalable, performant web applications using modern frameworks and proven patterns. From landing pages to complex SaaS platforms — built to last.',
    tags: ['React', 'TypeScript', 'Node.js'],
  },
  {
    icon: <FiSmartphone size={22} aria-hidden="true" />,
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
    title: 'Mobile development',
    description:
      'Native and cross-platform mobile apps that deliver seamless experiences on iOS and Android. Built with React Native, optimized for app store success.',
    tags: ['React Native', 'iOS', 'Android'],
  },
  {
    icon: <FiPenTool size={22} aria-hidden="true" />,
    iconBg: '#fdf4ff',
    iconColor: '#c026d3',
    title: 'Graphic design',
    description:
      'Brand identity, UI/UX design, and visual communication that resonates with your audience. Every pixel crafted with purpose and aesthetic intentionality.',
    tags: ['Figma', 'Branding', 'UI/UX'],
  },
];

export default function WSServices() {
  return (
    <section id="ws-services" className="ws-section ws-bg-soft">
      <div className="container">
        {/* Section header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6 text-center">
            <p className="ws-eyebrow">What we do</p>
            <h2 className="section-title">Our services</h2>
            <p style={{ color: 'var(--ws-body)', fontSize: '1.0625rem', marginTop: '.75rem', marginBottom: 0 }}>
              End-to-end digital services that take your product from concept to launch.
            </p>
          </div>
        </div>

        {/* Service cards */}
        <div className="row g-4">
          {SERVICES.map(svc => (
            <div className="col-lg-4 col-md-6" key={svc.title}>
              <article className="soft-card hover-lift h-100 p-4 p-xl-5">
                {/* Icon */}
                <div
                  className="ws-icon-circle mb-4"
                  style={{ background: svc.iconBg, color: svc.iconColor }}
                >
                  {svc.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--ws-navy)',
                    marginBottom: '.75rem',
                  }}
                >
                  {svc.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: 'var(--ws-body)',
                    lineHeight: 1.7,
                    fontSize: '.9375rem',
                    marginBottom: '1.5rem',
                    flexGrow: 1,
                  }}
                >
                  {svc.description}
                </p>

                {/* Tags */}
                <div className="d-flex flex-wrap gap-2">
                  {svc.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-block',
                        background: '#fff',
                        border: '1px solid var(--ws-border)',
                        borderRadius: '999px',
                        padding: '.2rem .7rem',
                        fontSize: '.78rem',
                        fontWeight: 600,
                        color: 'var(--ws-charcoal)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-5">
          <a href="#ws-contact" className="ws-btn-outline">
            Talk about your project
          </a>
        </div>
      </div>
    </section>
  );
}
