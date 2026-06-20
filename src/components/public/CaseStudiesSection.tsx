import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types';
import '../../styles/case-studies-section.css';

/* ── Types ────────────────────────────────────────────────────── */

type ThumbnailType = 'agency' | 'marketplace' | 'dashboard' | 'mobile';

type CaseStudy = {
  id?: number;
  title: string;
  category: string;
  description: string;
  slug: string;
  thumbnailType: ThumbnailType;
  cover_url?: string | null;
};

/* ── Static fallback data ─────────────────────────────────────── */

const STATIC_STUDIES: CaseStudy[] = [
  {
    title: 'Smash Interactive Agency',
    category: 'UI/UX Developer',
    description: 'A boutique agency with tailored solutions focused on your revenue growth.',
    slug: 'smash-interactive-agency',
    thumbnailType: 'agency',
  },
  {
    title: 'Scoutlify',
    category: 'Full Stack Developer',
    description:
      'A modern real estate marketplace connecting property seekers, brokers, agents, agencies, and developers through a streamlined platform.',
    slug: 'scoutlify',
    thumbnailType: 'marketplace',
  },
  {
    title: 'Fintech Dashboard Redesign',
    category: 'Dashboard Design',
    description:
      'Redesigned a complex financial dashboard into a clearer, faster, and more usable product experience.',
    slug: 'fintech-dashboard-redesign',
    thumbnailType: 'dashboard',
  },
  {
    title: 'E-Commerce Mobile App',
    category: 'Mobile App Design',
    description:
      'Designed a mobile shopping experience focused on product discovery, trust, and checkout confidence.',
    slug: 'ecommerce-mobile-app',
    thumbnailType: 'mobile',
  },
];

/* ── API → CaseStudy mapping ──────────────────────────────────── */

function thumbnailTypeFor(p: Project): ThumbnailType {
  const slug = (p.slug ?? '').toLowerCase();
  const type = (p.project_type ?? p.role ?? '').toLowerCase();
  if (slug.includes('smash') || slug.includes('agency') || type.includes('agency')) return 'agency';
  if (slug.includes('scoutlify') || type.includes('real estate') || type.includes('marketplace')) return 'marketplace';
  if (slug.includes('ecommerce') || slug.includes('mobile') || type.includes('mobile')) return 'mobile';
  return 'dashboard';
}

function mapProject(p: Project): CaseStudy {
  return {
    id: p.id,
    title: p.title,
    category: p.project_type || p.role || 'Project',
    description: (p.excerpt || p.description || '').slice(0, 180),
    slug: p.slug,
    thumbnailType: thumbnailTypeFor(p),
    cover_url: p.cover_url,
  };
}

/* ── Thumbnail: Agency ────────────────────────────────────────── */

function AgencyThumb() {
  return (
    <div className="csl-thumb csl-thumb--agency" aria-hidden="true">
      <div className="csl-thumb__agency-glow" />
      <div className="csl-thumb__agency-browser">
        {/* Chrome */}
        <div className="csl-thumb__agency-chrome">
          <div className="csl-thumb__agency-dots">
            <span className="csl-thumb__dot csl-thumb__dot--r" />
            <span className="csl-thumb__dot csl-thumb__dot--y" />
            <span className="csl-thumb__dot csl-thumb__dot--g" />
          </div>
          <div className="csl-thumb__agency-urlbar" />
        </div>
        {/* Page content */}
        <div className="csl-thumb__agency-body">
          {/* Navbar */}
          <div className="csl-thumb__agency-nav">
            <div className="csl-thumb__agency-logo" />
            <div className="csl-thumb__agency-nav-links">
              <span /><span /><span />
            </div>
            <div className="csl-thumb__agency-cta" />
          </div>
          {/* Hero block */}
          <div className="csl-thumb__agency-hero">
            <div className="csl-thumb__agency-hero-text">
              <div className="csl-thumb__agency-h1" />
              <div className="csl-thumb__agency-sub" />
            </div>
          </div>
          {/* Feature cards */}
          <div className="csl-thumb__agency-cards">
            {[0, 1, 2].map(i => (
              <div key={i} className="csl-thumb__agency-card">
                <div className="csl-thumb__agency-card-icon" />
                <div className="csl-thumb__agency-card-title" />
                <div className="csl-thumb__agency-card-body" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating badge */}
      <div className="csl-thumb__agency-badge">Agency</div>
    </div>
  );
}

/* ── Thumbnail: Marketplace ───────────────────────────────────── */

function MarketplaceThumb() {
  return (
    <div className="csl-thumb csl-thumb--marketplace" aria-hidden="true">
      {/* Search bar */}
      <div className="csl-thumb__mkt-search">
        <div className="csl-thumb__mkt-search-icon" />
        <div className="csl-thumb__mkt-search-text" />
        <div className="csl-thumb__mkt-search-btn" />
      </div>
      {/* Property cards 2×2 */}
      <div className="csl-thumb__mkt-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="csl-thumb__mkt-card">
            <div className={`csl-thumb__mkt-img csl-thumb__mkt-img--${i}`} />
            <div className="csl-thumb__mkt-info">
              <div className="csl-thumb__mkt-price" />
              <div className="csl-thumb__mkt-addr" />
            </div>
          </div>
        ))}
      </div>
      {/* Map pin */}
      <div className="csl-thumb__mkt-pin" aria-hidden="true">
        <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
          <path
            d="M10 0C4.5 0 0 4.5 0 10C0 17.5 10 26 10 26C10 26 20 17.5 20 10C20 4.5 15.5 0 10 0Z"
            fill="#fff"
            opacity="0.9"
          />
          <circle cx="10" cy="10" r="4" fill="#0D215A" />
        </svg>
      </div>
    </div>
  );
}

/* ── Thumbnail: Dashboard ─────────────────────────────────────── */

function DashboardThumb() {
  return (
    <div className="csl-thumb csl-thumb--dashboard" aria-hidden="true">
      <div className="csl-thumb__dash-card">
        {/* Browser chrome */}
        <div className="csl-thumb__dash-chrome">
          <div className="csl-thumb__dash-dots">
            <span className="csl-thumb__dot csl-thumb__dot--r" />
            <span className="csl-thumb__dot csl-thumb__dot--y" />
            <span className="csl-thumb__dot csl-thumb__dot--g" />
          </div>
          <div className="csl-thumb__dash-urlbar" />
        </div>
        {/* Dashboard layout */}
        <div className="csl-thumb__dash-layout">
          {/* Sidebar */}
          <div className="csl-thumb__dash-sidebar">
            <div className="csl-thumb__dash-logo" />
            {[true, false, false, false, false].map((active, i) => (
              <div
                key={i}
                className={`csl-thumb__dash-nav${active ? ' csl-thumb__dash-nav--on' : ''}`}
              />
            ))}
          </div>
          {/* Main content */}
          <div className="csl-thumb__dash-main">
            {/* Stats row */}
            <div className="csl-thumb__dash-stats">
              {[0, 1, 2].map(i => (
                <div key={i} className="csl-thumb__dash-stat">
                  <div className="csl-thumb__dash-stat-val" />
                  <div className="csl-thumb__dash-stat-lbl" />
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="csl-thumb__dash-chart">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 260 60"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,52 36,40 72,46 108,26 144,34 180,18 216,10 260,4"
                  fill="none"
                  stroke="#1E4ED8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Table rows */}
            <div className="csl-thumb__dash-rows">
              {[78, 54, 88].map((w, i) => (
                <div key={i} className="csl-thumb__dash-row">
                  <span className="csl-thumb__dash-row-dot" />
                  <span className="csl-thumb__dash-row-bar" style={{ width: `${w}%` }} />
                  <span className="csl-thumb__dash-row-val" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Thumbnail: Mobile ────────────────────────────────────────── */

function MobileThumb() {
  return (
    <div className="csl-thumb csl-thumb--mobile" aria-hidden="true">
      <div className="csl-thumb__phone">
        {/* Notch */}
        <div className="csl-thumb__phone-notch" />
        {/* Screen */}
        <div className="csl-thumb__phone-screen">
          {/* Search */}
          <div className="csl-thumb__phone-search" />
          {/* Category pills */}
          <div className="csl-thumb__phone-pills">
            <span className="csl-thumb__phone-pill csl-thumb__phone-pill--on" />
            <span className="csl-thumb__phone-pill" />
            <span className="csl-thumb__phone-pill" />
          </div>
          {/* Product grid */}
          <div className="csl-thumb__phone-grid">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="csl-thumb__phone-product">
                <div className={`csl-thumb__phone-img csl-thumb__phone-img--${i}`} />
                <div className="csl-thumb__phone-name" />
                <div className="csl-thumb__phone-price" />
              </div>
            ))}
          </div>
        </div>
        {/* Home indicator */}
        <div className="csl-thumb__phone-home" />
      </div>
    </div>
  );
}

/* ── Thumbnail dispatcher ─────────────────────────────────────── */

const THUMBS: Record<ThumbnailType, () => JSX.Element> = {
  agency:      AgencyThumb,
  marketplace: MarketplaceThumb,
  dashboard:   DashboardThumb,
  mobile:      MobileThumb,
};

/* ── Individual card ──────────────────────────────────────────── */

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const Thumb = THUMBS[study.thumbnailType];

  return (
    <article className="csl-card">
      <Link
        to={`/case-studies/${study.slug}`}
        className="csl-card__media text-decoration-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {study.cover_url ? (
          <img
            src={study.cover_url}
            alt=""
            className="csl-card__cover-img"
          />
        ) : (
          <Thumb />
        )}
      </Link>

      <div className="csl-card__body">
        <span className="csl-card__category">{study.category}</span>

        <h3 className="csl-card__title">{study.title}</h3>

        <p className="csl-card__description">{study.description}</p>

        <Link
          to={`/case-studies/${study.slug}`}
          className="csl-card__link text-decoration-none"
        >
          View Case Study →
        </Link>
      </div>
    </article>
  );
}

/* ── Search icon SVG ──────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg
      className="csl__search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── Main Component ───────────────────────────────────────────── */

export default function CaseStudiesSection() {
  const [studies, setStudies]   = useState<CaseStudy[]>(STATIC_STUDIES);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch('/api/projects')
      .then(r => (r.ok ? (r.json() as Promise<Project[]>) : Promise.reject()))
      .then(data => {
        if (data.length > 0) setStudies(data.map(mapProject));
      })
      .catch(() => { /* keep static data */ })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    studies.forEach(s => seen.add(s.category));
    return Array.from(seen).sort();
  }, [studies]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return studies.filter(s => {
      const matchSearch =
        !term ||
        s.title.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term);
      const matchCat = category === 'all' || s.category === category;
      return matchSearch && matchCat;
    });
  }, [studies, search, category]);

  function clearFilters() {
    setSearch('');
    setCategory('all');
  }

  return (
    <section
      className="csl"
      id="case-studies-list"
      aria-labelledby="csl-heading"
    >
      <h2 id="csl-heading" className="csl__visually-hidden">Case Studies</h2>

      <div className="container csl__container">

        {/* ── Filter bar ── */}
        <div className="csl__toolbar" role="search">
          <label htmlFor="csl-search" className="csl__visually-hidden">
            Search case studies
          </label>
          <div className="csl__search-wrap">
            <SearchIcon />
            <input
              id="csl-search"
              type="search"
              className="csl__search-input"
              placeholder="Search case studies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search case studies"
            />
          </div>

          <label htmlFor="csl-category" className="csl__visually-hidden">
            Filter by category
          </label>
          <select
            id="csl-category"
            className="csl__select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="csl__loading" aria-live="polite">
            <span className="csl__spinner" aria-hidden="true" />
            Loading case studies…
          </div>
        ) : filtered.length === 0 ? (
          <div className="csl__empty" role="status">
            <div className="csl__empty-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="csl__empty-title">No case studies found</h3>
            <p className="csl__empty-desc">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              type="button"
              className="csl__empty-reset"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="csl__grid">
            {filtered.map(study => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
