import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/blogs-section.css';

/* ── Types ────────────────────────────────────────────────────── */

type BlogThumbType = 'editorial' | 'system' | 'color' | 'web';

type BlogPost = {
  id?: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  created_at: string;
  content?: string;
  cover_image_url?: string;
  reading_time?: string;
  thumbnailType: BlogThumbType;
};

/* ── Helpers ──────────────────────────────────────────────────── */

function getReadTime(content?: string, readingTime?: string): string {
  if (readingTime) return `${readingTime} read`;
  const words = (content ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function thumbnailTypeFor(post: { category?: string; slug: string }, index: number): BlogThumbType {
  const cat = (post.category ?? '').toLowerCase();
  const slug = post.slug.toLowerCase();
  if (cat.includes('system') || slug.includes('design-system') || slug.includes('system')) return 'system';
  if (cat.includes('color') || cat.includes('visual') || slug.includes('color') || slug.includes('psychology')) return 'color';
  if (cat.includes('web') || cat.includes('dev') || cat.includes('responsive') || slug.includes('responsive') || slug.includes('web')) return 'web';
  const fallback: BlogThumbType[] = ['editorial', 'system', 'color', 'web'];
  if (!cat && !slug) return fallback[index % fallback.length];
  return 'editorial';
}

/* ── Static fallback data ─────────────────────────────────────── */

const STATIC_POSTS: BlogPost[] = [
  {
    title: 'The 10 UI/UX Principles Every Designer Should Know',
    category: 'UI/UX Design',
    excerpt:
      'A practical guide to creating clear, usable, and visually effective digital interfaces that actually convert.',
    slug: 'uiux-principles-every-designer-should-know',
    created_at: '2026-01-15',
    reading_time: '7 min',
    thumbnailType: 'editorial',
  },
  {
    title: 'Building a Design System from Scratch',
    category: 'Design Systems',
    excerpt:
      'How to create a scalable, consistent design system that grows with your product and speeds up your team.',
    slug: 'building-design-system-from-scratch',
    created_at: '2026-02-03',
    reading_time: '9 min',
    thumbnailType: 'system',
  },
  {
    title: 'Color Psychology in UI Design',
    category: 'Visual Design',
    excerpt:
      'Understanding how color choices affect user emotions, trust, behavior, and ultimately conversion rates.',
    slug: 'color-psychology-in-ui-design',
    created_at: '2026-02-20',
    reading_time: '6 min',
    thumbnailType: 'color',
  },
  {
    title: 'Responsive Design Best Practices for 2026',
    category: 'Web Development',
    excerpt:
      'Modern techniques and patterns for building websites that look and perform great on every device and screen size.',
    slug: 'responsive-design-best-practices',
    created_at: '2026-03-10',
    reading_time: '8 min',
    thumbnailType: 'web',
  },
];

const ITEMS_PER_PAGE = 8;

/* ── Thumbnail: Editorial ─────────────────────────────────────── */

function EditorialThumb() {
  return (
    <div className="bpl-thumb bpl-thumb--editorial" aria-hidden="true">
      {/* Dot grid overlay via CSS ::before */}
      <div className="bpl-thumb__editorial-card">
        <div className="bpl-thumb__ed-pill" />
        <div className="bpl-thumb__ed-h1 bpl-thumb__ed-h1--xl" />
        <div className="bpl-thumb__ed-h1 bpl-thumb__ed-h1--lg" />
        <div className="bpl-thumb__ed-h1 bpl-thumb__ed-h1--md" />
        <div className="bpl-thumb__ed-divider" />
        {[100, 88, 94, 72].map((w, i) => (
          <div key={i} className="bpl-thumb__ed-line" style={{ width: `${w}%` }} />
        ))}
        {/* Quote block */}
        <div className="bpl-thumb__ed-quote">
          <div className="bpl-thumb__ed-quote-bar" />
          <div className="bpl-thumb__ed-quote-text">
            <div style={{ width: '88%' }} className="bpl-thumb__ed-qline" />
            <div style={{ width: '70%' }} className="bpl-thumb__ed-qline" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Thumbnail: Design System ─────────────────────────────────── */

function SystemThumb() {
  const SWATCHES = ['#0D215A', '#1E4ED8', '#3b82f6', '#93c5fd', '#E0EAFF'];
  return (
    <div className="bpl-thumb bpl-thumb--system" aria-hidden="true">
      {/* Swatches row */}
      <div className="bpl-thumb__sys-swatches">
        {SWATCHES.map((color, i) => (
          <div
            key={i}
            className="bpl-thumb__sys-swatch"
            style={{ background: color }}
          />
        ))}
      </div>
      {/* Type scale */}
      <div className="bpl-thumb__sys-type">
        <div className="bpl-thumb__sys-type-label" />
        {[72, 52, 38, 28].map((h, i) => (
          <div
            key={i}
            className="bpl-thumb__sys-type-row"
          >
            <div className="bpl-thumb__sys-type-bar" style={{ height: `${Math.max(h * 0.14, 7)}px`, width: `${100 - i * 12}%` }} />
          </div>
        ))}
      </div>
      {/* Token grid */}
      <div className="bpl-thumb__sys-tokens">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bpl-thumb__sys-token">
            <div className="bpl-thumb__sys-token-swatch" style={{ background: SWATCHES[i % SWATCHES.length] }} />
            <div className="bpl-thumb__sys-token-name" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Thumbnail: Color ─────────────────────────────────────────── */

function ColorThumb() {
  const ORBS = [
    { size: 100, bg: 'rgba(30,78,216,0.45)',  top: '-20px', left: '-20px'  },
    { size: 80,  bg: 'rgba(255,255,255,0.18)', top: '30px',  right: '-10px' },
    { size: 60,  bg: 'rgba(30,78,216,0.30)',  bottom: '20px', left: '30%'  },
  ];
  const PALETTE = ['#0D215A', '#1635a0', '#1E4ED8', '#60a5fa', '#bfdbfe', '#ffffff'];
  return (
    <div className="bpl-thumb bpl-thumb--color" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="bpl-thumb__color-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.bg,
            top: orb.top,
            right: (orb as { right?: string }).right,
            left: (orb as { left?: string }).left,
            bottom: (orb as { bottom?: string }).bottom,
          }}
        />
      ))}
      {/* Palette strip */}
      <div className="bpl-thumb__color-palette">
        {PALETTE.map((color, i) => (
          <div
            key={i}
            className="bpl-thumb__color-swatch"
            style={{ background: color }}
          />
        ))}
      </div>
      {/* Dark label card */}
      <div className="bpl-thumb__color-label">
        <div className="bpl-thumb__color-label-title" />
        <div className="bpl-thumb__color-label-sub" />
      </div>
    </div>
  );
}

/* ── Thumbnail: Web/Responsive ────────────────────────────────── */

function WebThumb() {
  return (
    <div className="bpl-thumb bpl-thumb--web" aria-hidden="true">
      {/* Desktop browser */}
      <div className="bpl-thumb__web-desktop">
        <div className="bpl-thumb__web-desktop-chrome">
          <div className="bpl-thumb__web-dots">
            <span className="bpl-thumb__dot bpl-thumb__dot--r" />
            <span className="bpl-thumb__dot bpl-thumb__dot--y" />
            <span className="bpl-thumb__dot bpl-thumb__dot--g" />
          </div>
          <div className="bpl-thumb__web-urlbar" />
        </div>
        <div className="bpl-thumb__web-desktop-screen">
          <div className="bpl-thumb__web-nav" />
          <div className="bpl-thumb__web-hero" />
          <div className="bpl-thumb__web-cols">
            <div /><div /><div />
          </div>
        </div>
      </div>
      {/* Tablet */}
      <div className="bpl-thumb__web-tablet">
        <div className="bpl-thumb__web-tablet-screen">
          <div className="bpl-thumb__web-nav" />
          <div className="bpl-thumb__web-hero bpl-thumb__web-hero--sm" />
          <div className="bpl-thumb__web-cols bpl-thumb__web-cols--two">
            <div /><div />
          </div>
        </div>
      </div>
      {/* Phone */}
      <div className="bpl-thumb__web-phone">
        <div className="bpl-thumb__web-phone-notch" />
        <div className="bpl-thumb__web-phone-screen">
          <div className="bpl-thumb__web-nav" />
          <div className="bpl-thumb__web-hero bpl-thumb__web-hero--xs" />
          <div className="bpl-thumb__web-phone-block" />
        </div>
        <div className="bpl-thumb__web-phone-home" />
      </div>
    </div>
  );
}

/* ── Thumbnail dispatcher ─────────────────────────────────────── */

const THUMBS: Record<BlogThumbType, () => JSX.Element> = {
  editorial: EditorialThumb,
  system:    SystemThumb,
  color:     ColorThumb,
  web:       WebThumb,
};

/* ── Blog card ────────────────────────────────────────────────── */

function BlogCard({ post }: { post: BlogPost }) {
  const Thumb = THUMBS[post.thumbnailType];

  return (
    <article className="bpl-card">
      <Link
        to={`/blogs/${post.slug}`}
        className="bpl-card__media text-decoration-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            className="bpl-card__cover-img"
          />
        ) : (
          <Thumb />
        )}
      </Link>

      <div className="bpl-card__body">
        <span className="bpl-card__category">{post.category || 'General'}</span>

        <h3 className="bpl-card__title">{post.title}</h3>

        {post.excerpt && (
          <p className="bpl-card__excerpt">{post.excerpt}</p>
        )}

        <div className="bpl-card__meta">
          <span>{formatDate(post.created_at)}</span>
          <span className="bpl-card__meta-sep" aria-hidden="true">·</span>
          <span>{getReadTime(post.content, post.reading_time)}</span>
        </div>

        <Link
          to={`/blogs/${post.slug}`}
          className="bpl-card__link text-decoration-none"
        >
          Read Article →
        </Link>
      </div>
    </article>
  );
}

/* ── Search icon ──────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg
      className="bpl__search-icon"
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

/* ── Main component ───────────────────────────────────────────── */

export default function BlogsSection() {
  const [posts, setPosts]       = useState<BlogPost[]>(STATIC_POSTS);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage]         = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.any(
      ['/api/posts', '/api/blogs'].map(url =>
        fetch(url).then(r => {
          if (!r.ok) throw new Error('not ok');
          return r.json() as Promise<unknown>;
        })
      )
    )
      .then((data: unknown) => {
        const arr = Array.isArray(data)
          ? data
          : (data as { data?: unknown[] }).data ?? [];
        if (arr.length > 0) {
          setPosts(
            (arr as Array<Record<string, unknown>>).map((p, i) => ({
              id: p.id as string | number,
              title: (p.title as string) ?? '',
              slug: (p.slug as string) ?? '',
              excerpt: (p.excerpt as string | undefined),
              category: (p.category as string | undefined),
              created_at: (p.created_at as string) ?? new Date().toISOString(),
              content: (p.content as string | undefined),
              cover_image_url: (p.cover_image_url as string | undefined) ?? (p.og_image as string | undefined),
              reading_time: (p.reading_time as string | undefined),
              thumbnailType: thumbnailTypeFor(
                { category: p.category as string | undefined, slug: (p.slug as string) ?? '' },
                i
              ),
            }))
          );
        }
      })
      .catch(() => { /* keep static data */ })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach(p => { if (p.category) seen.add(p.category); });
    return Array.from(seen).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter(p => {
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.excerpt ?? '').toLowerCase().includes(term) ||
        (p.category ?? '').toLowerCase().includes(term);
      const matchCat = category === 'all' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [posts, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleSearch(val: string) { setSearch(val); setPage(1); }
  function handleCategory(val: string) { setCategory(val); setPage(1); }
  function clearFilters() { setSearch(''); setCategory('all'); setPage(1); }

  return (
    <section
      className="bpl"
      id="blogs-list"
      aria-labelledby="bpl-heading"
    >
      <h2 id="bpl-heading" className="bpl__visually-hidden">Blog Articles</h2>

      <div className="container bpl__container">

        {/* ── Filter toolbar ── */}
        <div className="bpl__toolbar" role="search">
          <label htmlFor="bpl-search" className="bpl__visually-hidden">
            Search articles
          </label>
          <div className="bpl__search-wrap">
            <SearchIcon />
            <input
              id="bpl-search"
              type="search"
              className="bpl__search-input"
              placeholder="Search articles..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              aria-label="Search articles"
            />
          </div>

          <label htmlFor="bpl-category" className="bpl__visually-hidden">
            Filter by category
          </label>
          <select
            id="bpl-category"
            className="bpl__select"
            value={category}
            onChange={e => handleCategory(e.target.value)}
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
          <div className="bpl__loading" aria-live="polite">
            <span className="bpl__spinner" aria-hidden="true" />
            Loading articles…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bpl__empty" role="status">
            <div className="bpl__empty-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="bpl__empty-title">No articles found</h3>
            <p className="bpl__empty-desc">
              Try adjusting your search or selecting a different category.
            </p>
            <button type="button" className="bpl__empty-reset" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="bpl__grid">
              {paginated.map(post => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="bpl__pagination" aria-label="Article pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`bpl__page-btn${p === currentPage ? ' bpl__page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    type="button"
                    className="bpl__page-btn"
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Next page"
                  >
                    →
                  </button>
                )}
              </nav>
            )}
          </>
        )}

      </div>
    </section>
  );
}
