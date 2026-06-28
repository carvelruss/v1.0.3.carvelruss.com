import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/blogs-section.css';

/* ── Types ────────────────────────────────────────────────────── */

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
  author?: string;
};

/* ── Helpers ──────────────────────────────────────────────────── */

function getReadTime(content?: string, readingTime?: string): string {
  if (readingTime) return `${readingTime} read`;
  const words = (content ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    });
  } catch {
    return dateStr;
  }
}

/* ── Static fallback data ─────────────────────────────────────── */

const STATIC_POSTS: BlogPost[] = [
  {
    title: 'The 10 UI/UX Principles Every Designer Should Know',
    category: 'UI/UX Design',
    excerpt: 'A practical guide to creating clear, usable, and visually effective digital interfaces that actually convert.',
    slug: 'uiux-principles-every-designer-should-know',
    created_at: '2026-01-15T08:00:00Z',
    reading_time: '7 min',
  },
  {
    title: 'Building a Design System from Scratch',
    category: 'Design Systems',
    excerpt: 'How to create a scalable, consistent design system that grows with your product and speeds up your team.',
    slug: 'building-design-system-from-scratch',
    created_at: '2026-02-03T10:00:00Z',
    reading_time: '9 min',
  },
  {
    title: 'Color Psychology in UI Design',
    category: 'Visual Design',
    excerpt: 'Understanding how color choices affect user emotions, trust, behavior, and ultimately conversion rates.',
    slug: 'color-psychology-in-ui-design',
    created_at: '2026-02-20T09:00:00Z',
    reading_time: '6 min',
  },
  {
    title: 'Responsive Design Best Practices for 2026',
    category: 'Web Development',
    excerpt: 'Modern techniques and patterns for building websites that look and perform great on every device and screen size.',
    slug: 'responsive-design-best-practices',
    created_at: '2026-03-10T07:00:00Z',
    reading_time: '8 min',
  },
];

const ITEMS_PER_PAGE = 8;

/* ── Blog card ────────────────────────────────────────────────── */

function BlogCard({ post }: { post: BlogPost }) {
  const metaParts = [
    post.author,
    formatDateTime(post.created_at),
    getReadTime(post.content, post.reading_time),
  ].filter(Boolean);

  return (
    <article className="bpl-card">
      <Link
        to={`/blogs/${post.slug}`}
        className="bpl-card__link"
        aria-label={post.title}
      >
        <div
          className="bpl-card__img"
          style={
            post.cover_image_url
              ? { backgroundImage: `url(${post.cover_image_url})` }
              : undefined
          }
        >
          <div className="bpl-card__overlay" aria-hidden="true" />
          {post.category && (
            <span className="bpl-card__category">{post.category}</span>
          )}
          <div className="bpl-card__img-bottom">
            <h3 className="bpl-card__title">{post.title}</h3>
            <p className="bpl-card__meta">{metaParts.join(' · ')}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export default function BlogsSection({ search = '' }: { search?: string }) {
  const [posts, setPosts]       = useState<BlogPost[]>(STATIC_POSTS);
  const [loading, setLoading]   = useState(false);
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
          : ((data as { data?: unknown[] }).data ?? []);
        if (arr.length > 0) {
          setPosts(
            (arr as Array<Record<string, unknown>>).map(p => ({
              id: p.id as string | number,
              title: (p.title as string) ?? '',
              slug: (p.slug as string) ?? '',
              excerpt: p.excerpt as string | undefined,
              category: p.category as string | undefined,
              created_at: (p.created_at as string) ?? new Date().toISOString(),
              content: p.content as string | undefined,
              cover_image_url:
                (p.cover_image_url as string | undefined) ??
                (p.og_image as string | undefined),
              reading_time: p.reading_time as string | undefined,
              author:
                (p.author as string | undefined) ??
                (p.author_name as string | undefined),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Reset to page 1 when search/category changes */
  useEffect(() => { setPage(1); }, [search, category]);

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

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="bpl" id="blogs-list" aria-labelledby="bpl-heading">
      <div className="container bpl__container">

        {/* ── Category pill filters ── */}
        <div className="bpl__pills" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`bpl__pill${category === 'all' ? ' bpl__pill--active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`bpl__pill${category === cat ? ' bpl__pill--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Section header ── */}
        <div className="bpl__section-header">
          <h2 id="bpl-heading" className="bpl__section-title">
            Latest from the journal
          </h2>
          <span className="bpl__section-count">
            {filtered.length} {filtered.length === 1 ? 'story' : 'stories'} published
          </span>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="bpl__loading" aria-live="polite">
            <span className="bpl__spinner" aria-hidden="true" />
            Loading articles…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bpl__empty" role="status">
            <h3 className="bpl__empty-title">No articles found</h3>
            <p className="bpl__empty-desc">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              type="button"
              className="bpl__empty-reset"
              onClick={() => setCategory('all')}
            >
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
                    onClick={() => setPage(prev => prev + 1)}
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
