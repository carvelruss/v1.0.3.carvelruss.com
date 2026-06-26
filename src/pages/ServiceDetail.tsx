import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiAward, FiShield, FiZap } from 'react-icons/fi';
import { api } from '../lib/api';
import type { Service } from '../types';
import '../styles/service-detail.css';

const FEAT_ICONS = [
  <FiAward  size={22} aria-hidden="true" />,
  <FiShield size={22} aria-hidden="true" />,
  <FiZap    size={22} aria-hidden="true" />,
];

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
  const isExternal = ctaHref.startsWith('http');

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
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              {ctaLabel}
            </a>
            <span className="sv-lp-header__cta-sub">Talk to an expert today</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="sv-hero">

        {/* Right-side photo */}
        {service.cover_url && (
          <div className="sv-hero__photo">
            <img src={service.cover_url} alt={service.title} />
          </div>
        )}
        <div className="sv-hero__gradient" />

        {/* Content panel */}
        <div className="sv-hero__wrap">
          <div className="sv-hero__inner">

            {/* Heading */}
            <h1 className="sv-hero__title">{service.title}</h1>

            {/* Sub-Heading */}
            {service.excerpt && (
              <p className="sv-hero__subtitle">{service.excerpt}</p>
            )}

            {/* Feature icon grid (first 3) */}
            {service.features.length > 0 && (
              <div className="sv-hero__features">
                {service.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="sv-hero__feat">
                    <div className="sv-hero__feat-icon">
                      {FEAT_ICONS[i % FEAT_ICONS.length]}
                    </div>
                    <span className="sv-hero__feat-label">{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Large CTA button */}
            <a
              href={ctaHref}
              className="sv-hero__cta-btn"
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              <span className="sv-hero__cta-sub-text">Talk to an expert today</span>
              <span className="sv-hero__cta-main-text">{ctaLabel}</span>
            </a>

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
                <a
                  href={ctaHref}
                  className="ws-btn-primary sv-card__btn"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {ctaLabel}
                </a>
              </div>
            </aside>

          </div>
        </div>
      </section>

    </div>
  );
}
