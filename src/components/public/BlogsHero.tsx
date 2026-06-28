import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/blogs-hero.css';

type FeaturedPost = {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  created_at: string;
  cover_image_url?: string;
  reading_time?: string;
  content?: string;
};

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

function getReadTime(content?: string, readingTime?: string): string {
  if (readingTime) return `${readingTime} read`;
  const words = (content ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default function BlogsHero({ onSearch }: { onSearch?: (q: string) => void }) {
  const [featured, setFeatured] = useState<FeaturedPost | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
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
          const p = arr[0] as Record<string, unknown>;
          setFeatured({
            title: (p.title as string) ?? '',
            slug: (p.slug as string) ?? '',
            excerpt: p.excerpt as string | undefined,
            category: p.category as string | undefined,
            created_at: (p.created_at as string) ?? new Date().toISOString(),
            cover_image_url:
              (p.cover_image_url as string | undefined) ??
              (p.og_image as string | undefined),
            reading_time: p.reading_time as string | undefined,
            content: p.content as string | undefined,
          });
        }
      })
      .catch(() => {});
  }, []);

  function handleSearch(val: string) {
    setSearch(val);
    onSearch?.(val);
  }

  return (
    <section className="bph" aria-label="Blog introduction">

      {/* Breadcrumb */}
      <div className="container bph__breadcrumb-wrap">
        <nav aria-label="breadcrumb" className="bph__breadcrumb">
          <Link to="/" className="bph__bc-link">Home</Link>
          <span className="bph__bc-sep" aria-hidden="true">›</span>
          <span className="bph__bc-current">Blog</span>
        </nav>
      </div>

      {/* Main grid */}
      <div className="container bph__container">
        <div className="bph__grid">

          {/* ── Left: Content ── */}
          <div className="bph__content">

            <span className="bph__eyebrow">Blogs</span>

            <h1 className="bph__title">
              Insights on UI/UX, Design &amp; Web Development
            </h1>

            <p className="bph__description">
              Thoughts, tips and in-depth insights about UI/UX design, design systems,
              visual design, and building clean digital experiences that work beautifully
              across every device.
            </p>

            <div className="bph__search-row">
              <div className="bph__search-wrap">
                <svg className="bph__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="search"
                  className="bph__search-input"
                  placeholder="Search articles, topics, or keywords"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  aria-label="Search articles"
                />
              </div>
              <a href="#blogs-list" className="bph__btn-primary">
                Start Reading →
              </a>
            </div>

          </div>

          {/* ── Right: Featured post card ── */}
          <div className="bph__visual">
            {featured ? (
              <Link
                to={`/blogs/${featured.slug}`}
                className="bph__featured"
                aria-label={`Read featured: ${featured.title}`}
              >
                {/* Image */}
                <div
                  className="bph__feat-img"
                  style={
                    featured.cover_image_url
                      ? { backgroundImage: `url(${featured.cover_image_url})` }
                      : undefined
                  }
                  aria-hidden="true"
                >
                  <div className="bph__feat-overlay" />
                  <span className="bph__feat-badge">FEATURED</span>
                  <div className="bph__feat-img-bottom">
                    {featured.category && (
                      <div className="bph__feat-cat">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {featured.category}
                      </div>
                    )}
                    <h2 className="bph__feat-title">{featured.title}</h2>
                  </div>
                </div>

                {/* Body */}
                <div className="bph__feat-body">
                  {featured.excerpt && (
                    <p className="bph__feat-excerpt">{featured.excerpt}</p>
                  )}
                  <div className="bph__feat-meta">
                    <div className="bph__feat-meta-left">
                      <span className="bph__meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatDateTime(featured.created_at)}
                      </span>
                      <span className="bph__meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {getReadTime(featured.content, featured.reading_time)}
                      </span>
                    </div>
                    <div className="bph__feat-arrow" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              /* Skeleton while loading */
              <div className="bph__featured bph__featured--skel" aria-hidden="true">
                <div className="bph__feat-img">
                  <div className="bph__feat-overlay" />
                  <span className="bph__feat-badge">FEATURED</span>
                </div>
                <div className="bph__feat-body">
                  <div className="bph__skel-line bph__skel-line--xl" />
                  <div className="bph__skel-line bph__skel-line--lg" />
                  <div className="bph__skel-line bph__skel-line--md" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
