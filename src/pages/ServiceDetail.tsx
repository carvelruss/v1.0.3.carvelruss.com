import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { api } from '../lib/api';
import type { Service } from '../types';
import '../styles/service-detail.css';

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getServiceBySlug(slug)
      .then(data => {
        setService(data);
        document.title = data.seo_title || `${data.title} — Carvel Russ`;
        if (data.seo_description) {
          const meta = document.querySelector('meta[name="description"]');
          if (meta) meta.setAttribute('content', data.seo_description);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="sv-state sv-state--loading">
      <div className="sv-spinner" />
    </div>
  );

  if (notFound || !service) return (
    <div className="sv-state">
      <h1>Service not found</h1>
      <Link to="/" className="ws-btn-primary">Back to Home</Link>
    </div>
  );

  const ctaLabel = service.cta_label || 'Get a Free Quote';
  const ctaHref  = service.cta_url  || '/contact';

  return (
    <div className="sv-page">

      {/* ── Landing Header ── */}
      <header className="sv-lp-header">
        <div className="sv-lp-header__inner">
          <a href="/" className="sv-lp-header__logo" aria-label="Carvel Russ – Home">
            <img src="/logos/carvelruss-logo.png" alt="Carvel Russ" />
          </a>
          <div className="sv-lp-header__cta-wrap">
            <a
              href={ctaHref}
              className="sv-lp-header__cta-btn"
              target={ctaHref.startsWith('http') ? '_blank' : undefined}
              rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {ctaLabel}
            </a>
            <span className="sv-lp-header__cta-sub">Talk to an expert today</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="sv-hero">
        {service.cover_url && (
          <div className="sv-hero__bg">
            <img src={service.cover_url} alt="" aria-hidden="true" />
          </div>
        )}
        <div className="sv-hero__overlay" />

        <div className="container">
          <div className="sv-hero__inner">
            <Link to="/" className="sv-back">
              <FiArrowLeft size={15} /> Back to Home
            </Link>

            {service.icon_url && (
              <div className="sv-hero__icon">
                <img src={service.icon_url} alt={service.title} />
              </div>
            )}

            <h1 className="sv-hero__title" data-reveal>{service.title}</h1>

            {(service.excerpt || service.description) && (
              <p className="sv-hero__desc" data-reveal data-reveal-delay="100">
                {service.excerpt || service.description}
              </p>
            )}

            {service.tags.length > 0 && (
              <div className="sv-hero__tags" data-reveal data-reveal-delay="150">
                {service.tags.map(t => (
                  <span key={t} className="ws-tech-pill">{t}</span>
                ))}
              </div>
            )}

            {(service.cta_label && service.cta_url) && (
              <div data-reveal data-reveal-delay="200">
                <a
                  href={service.cta_url}
                  className="ws-btn-primary sv-hero__cta"
                  target={service.cta_url.startsWith('http') ? '_blank' : undefined}
                  rel={service.cta_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {service.cta_label} <FiArrowRight size={15} />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="sv-body">
        <div className="container">
          <div className="sv-body__grid">

            {/* Main */}
            <div className="sv-body__main">
              {service.content?.trim() && (
                <div className="sv-prose" data-reveal>
                  {service.content.split(/\n\n+/).filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="sv-body__sidebar">
              {service.features.length > 0 && (
                <div className="sv-card" data-reveal>
                  <h3 className="sv-card__title">What's Included</h3>
                  <ul className="sv-features">
                    {service.features.map((f, i) => (
                      <li key={i} className="sv-features__item">
                        <FiCheckCircle size={15} className="sv-features__icon" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="sv-card sv-card--cta" data-reveal data-reveal-delay="100">
                <h3 className="sv-card__title">Ready to get started?</h3>
                <p className="sv-card__text">Let's talk about your project and how I can help.</p>
                <Link to="/contact" className="ws-btn-primary sv-card__btn">
                  Get in Touch
                </Link>
              </div>
            </aside>

          </div>
        </div>
      </section>

    </div>
  );
}
