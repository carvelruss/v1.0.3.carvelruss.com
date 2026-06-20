import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types';
import '../../styles/featured-case-studies.css';

/* ── Types ──────────────────────────────────────────────────── */

type ThumbnailType = 'dashboard' | 'mobile' | 'landing';

type FeaturedCaseStudy = {
  title: string;
  category: string;
  description: string;
  metadata: string;
  slug: string;
  thumbnailType: ThumbnailType;
};

/* ── Static placeholder data ────────────────────────────────── */

const STATIC_STUDIES: FeaturedCaseStudy[] = [
  {
    title: 'Fintech Dashboard Redesign',
    category: 'Dashboard Design',
    description:
      'Redesigned a complex financial dashboard into a cleaner, more usable interface with stronger visual hierarchy.',
    metadata: 'UX Research · UI Design · Design System',
    slug: 'fintech-dashboard-redesign',
    thumbnailType: 'dashboard',
  },
  {
    title: 'E-Commerce Mobile App',
    category: 'Mobile App Design',
    description:
      'Designed a modern shopping experience focused on smoother product discovery and higher checkout confidence.',
    metadata: 'Mobile UX · Prototyping · Conversion',
    slug: 'ecommerce-mobile-app',
    thumbnailType: 'mobile',
  },
  {
    title: 'SaaS Landing Page',
    category: 'Web Design',
    description:
      'Created a conversion-focused landing page for a SaaS product with clear messaging and polished UI sections.',
    metadata: 'Landing Page · UI Design · CRO',
    slug: 'saas-landing-page',
    thumbnailType: 'landing',
  },
];

/* ── CSS Thumbnail Mockups ──────────────────────────────────── */

function DashboardMockup() {
  return (
    <div className="fcs-mock fcs-mock--dashboard" aria-hidden="true">
      <div className="fcs-mock__sidebar">
        <div className="fcs-mock__sidebar-logo" />
        <div className="fcs-mock__sidebar-icon fcs-mock__sidebar-icon--active" />
        <div className="fcs-mock__sidebar-icon" />
        <div className="fcs-mock__sidebar-icon" />
        <div className="fcs-mock__sidebar-icon" />
        <div className="fcs-mock__sidebar-icon" />
      </div>

      <div className="fcs-mock__main">
        <div className="fcs-mock__topbar">
          <div className="fcs-mock__topbar-title" />
          <div className="fcs-mock__topbar-actions">
            <div className="fcs-mock__topbar-btn" />
            <div className="fcs-mock__topbar-avatar" />
          </div>
        </div>

        <div className="fcs-mock__stats">
          <div className="fcs-mock__stat fcs-mock__stat--accent">
            <div className="fcs-mock__stat-label" />
            <div className="fcs-mock__stat-value" />
            <div className="fcs-mock__stat-trend" />
          </div>
          <div className="fcs-mock__stat">
            <div className="fcs-mock__stat-label" />
            <div className="fcs-mock__stat-value" />
            <div className="fcs-mock__stat-bars">
              {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="fcs-mock__stat">
            <div className="fcs-mock__stat-label" />
            <div className="fcs-mock__stat-ring" />
          </div>
        </div>

        <div className="fcs-mock__chart">
          <svg
            width="100%"
            height="40"
            viewBox="0 0 200 40"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="fcsChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0D215A" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0D215A" stopOpacity="0"   />
              </linearGradient>
            </defs>
            <path
              d="M0,34 C24,28 48,25 72,20 C96,15 120,10 148,12 C168,14 184,6 200,3"
              stroke="#0D215A"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M0,34 C24,28 48,25 72,20 C96,15 120,10 148,12 C168,14 184,6 200,3 L200,40 L0,40 Z"
              fill="url(#fcsChartGrad)"
            />
          </svg>
        </div>

        <div className="fcs-mock__rows">
          <div className="fcs-mock__row" />
          <div className="fcs-mock__row" />
          <div className="fcs-mock__row" />
        </div>
      </div>
    </div>
  );
}

function MobileMockup() {
  return (
    <div className="fcs-mock fcs-mock--mobile" aria-hidden="true">
      <div className="fcs-mock__phone">
        <div className="fcs-mock__phone-notch" />

        <div className="fcs-mock__phone-searchbar">
          <div className="fcs-mock__phone-search-icon" />
          <div className="fcs-mock__phone-search-text" />
        </div>

        <div className="fcs-mock__phone-cats">
          <div className="fcs-mock__phone-cat fcs-mock__phone-cat--active" />
          <div className="fcs-mock__phone-cat" />
          <div className="fcs-mock__phone-cat" />
        </div>

        <div className="fcs-mock__phone-products">
          <div className="fcs-mock__phone-product">
            <div className="fcs-mock__phone-product-img" />
            <div className="fcs-mock__phone-product-name" />
            <div className="fcs-mock__phone-product-price" />
          </div>
          <div className="fcs-mock__phone-product">
            <div className="fcs-mock__phone-product-img" />
            <div className="fcs-mock__phone-product-name" />
            <div className="fcs-mock__phone-product-price" />
          </div>
        </div>

        <div className="fcs-mock__phone-nav">
          <div className="fcs-mock__phone-nav-icon fcs-mock__phone-nav-icon--active" />
          <div className="fcs-mock__phone-nav-icon" />
          <div className="fcs-mock__phone-nav-icon" />
          <div className="fcs-mock__phone-nav-icon" />
        </div>
      </div>
    </div>
  );
}

function LandingMockup() {
  return (
    <div className="fcs-mock fcs-mock--landing" aria-hidden="true">
      <div className="fcs-mock__browser">
        <div className="fcs-mock__browser-chrome">
          <div className="fcs-mock__browser-dot fcs-mock__browser-dot--r" />
          <div className="fcs-mock__browser-dot fcs-mock__browser-dot--y" />
          <div className="fcs-mock__browser-dot fcs-mock__browser-dot--g" />
          <div className="fcs-mock__browser-url" />
        </div>

        <div className="fcs-mock__browser-body">
          <div className="fcs-mock__lp-nav">
            <div className="fcs-mock__lp-nav-logo" />
            <div className="fcs-mock__lp-nav-links">
              <div /><div /><div />
            </div>
            <div className="fcs-mock__lp-nav-btn" />
          </div>

          <div className="fcs-mock__lp-hero">
            <div className="fcs-mock__lp-hero-badge" />
            <div className="fcs-mock__lp-hero-h1" />
            <div className="fcs-mock__lp-hero-h1 fcs-mock__lp-hero-h1--short" />
            <div className="fcs-mock__lp-hero-sub" />
            <div className="fcs-mock__lp-hero-ctas">
              <div className="fcs-mock__lp-hero-btn fcs-mock__lp-hero-btn--primary" />
              <div className="fcs-mock__lp-hero-btn" />
            </div>
          </div>

          <div className="fcs-mock__lp-features">
            <div className="fcs-mock__lp-feat" />
            <div className="fcs-mock__lp-feat" />
            <div className="fcs-mock__lp-feat" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCKUPS: Record<ThumbnailType, () => JSX.Element> = {
  dashboard: DashboardMockup,
  mobile:    MobileMockup,
  landing:   LandingMockup,
};

/* ── Loading skeleton ───────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="fcs__skeleton">
      <div className="fcs__skeleton-media" />
      <div className="fcs__skeleton-body">
        <div className="fcs__skeleton-line fcs__skeleton-line--short" />
        <div className="fcs__skeleton-line fcs__skeleton-line--title" />
        <div className="fcs__skeleton-line fcs__skeleton-line--full" />
        <div className="fcs__skeleton-line fcs__skeleton-line--mid" />
        <div className="fcs__skeleton-line fcs__skeleton-line--short" />
      </div>
    </div>
  );
}

/* ── Case Study Card ────────────────────────────────────────── */

interface CardProps {
  study: FeaturedCaseStudy;
  coverUrl?: string | null;
}

function CaseStudyCard({ study, coverUrl }: CardProps) {
  const Mockup = MOCKUPS[study.thumbnailType];

  return (
    <article className={`cs-card cs-card--${study.thumbnailType}`}>
      <div className="cs-card__media">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={study.title}
            className="cs-card__cover-img"
            loading="lazy"
          />
        ) : (
          <Mockup />
        )}
      </div>

      <div className="cs-card__body">
        <span className="cs-card__category">{study.category}</span>
        <h3 className="cs-card__title">{study.title}</h3>
        <p className="cs-card__description">{study.description}</p>
        <p className="cs-card__meta">{study.metadata}</p>
        <Link
          to={`/case-studies/${study.slug}`}
          className="cs-card__link"
          aria-label={`View case study: ${study.title}`}
        >
          View Case Study
          <span className="cs-card__link-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export default function FeaturedCaseStudies() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    fetch('/api/projects?featured=1')
      .then(r => r.json())
      .then((data: Project[]) => setProjects(data.slice(0, 3)))
      .catch(() => setProjects([]));
  }, []);

  const loading     = projects === null;
  const hasFeatured = !loading && projects.length > 0;

  /* Merge API projects over static placeholders when available */
  const displayStudies: Array<{ study: FeaturedCaseStudy; coverUrl?: string | null }> =
    hasFeatured
      ? projects.map((p, i) => ({
          study: {
            title:         p.title,
            category:      p.project_type ?? p.role,
            description:   p.excerpt ?? p.description,
            metadata:      p.tools ?? '',
            slug:          p.slug,
            thumbnailType: STATIC_STUDIES[i % STATIC_STUDIES.length].thumbnailType,
          },
          coverUrl: p.cover_url,
        }))
      : STATIC_STUDIES.map(study => ({ study }));

  return (
    <section className="fcs" aria-labelledby="fcs-title">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="fcs__head">
          <div className="fcs__head-left">
            <span className="fcs__eyebrow">Featured Case Studies</span>
            <h2 className="fcs__title" id="fcs-title">Selected Work</h2>
            <p className="fcs__description">
              A curated collection of UI/UX projects focused on clarity, usability,
              and measurable design impact.
            </p>
          </div>

          <Link to="/case-studies" className="fcs__view-all">
            View All Case Studies →
          </Link>
        </div>

        {/* ── Card Grid ── */}
        {loading ? (
          <div className="fcs__loading" aria-busy="true" aria-label="Loading case studies">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="fcs__grid">
            {displayStudies.map(({ study, coverUrl }) => (
              <CaseStudyCard key={study.slug} study={study} coverUrl={coverUrl} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
