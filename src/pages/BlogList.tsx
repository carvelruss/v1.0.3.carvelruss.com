import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Blog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  category?: string;
  created_at: string;
  content?: string;
};

const BLOG_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#818cf8)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#0d9488,#2dd4bf)',
  'linear-gradient(135deg,#ea580c,#fb923c)',
  'linear-gradient(135deg,#be185d,#f472b6)',
];

const ITEMS_PER_PAGE = 8;

function getReadTime(content?: string): string {
  const wordCount = (content ?? '').split(' ').length;
  return Math.ceil(wordCount / 200) + ' min read';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogList() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = 'Blog | Carvel Russ';
    const urls = ['/api/posts', '/api/blogs'];
    let settled = false;
    Promise.any(
      urls.map(url =>
        fetch(url).then(r => {
          if (!r.ok) throw new Error('not ok');
          return r.json();
        })
      )
    )
      .then((data: unknown) => {
        if (!settled) {
          settled = true;
          const arr = Array.isArray(data) ? data : (data as { data?: Blog[] }).data ?? [];
          setPosts(arr as Blog[]);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          setPosts([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(
    new Set(posts.map(p => p.category).filter((c): c is string => Boolean(c)))
  );

  const filtered = posts.filter(p => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleCategory(val: string) {
    setCategory(val);
    setPage(1);
  }

  return (
    <>
      {/* Page hero */}
      <div className="pf-page-hero">
        <div className="container">
          <h1 className="pf-page-hero__title">Latest Insights</h1>
          <p className="pf-page-hero__sub">
            Thoughts, tips and insights about UI/UX design, web design and digital products.
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="pf-section pf-section--sm">
        <div className="container">

          {/* Filter bar */}
          <div className="pf-filter-bar">
            <div className="pf-search-wrap">
              <svg
                className="pf-search-icon"
                xmlns="http://www.w3.org/2000/svg"
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
              <input
                className="pf-search"
                type="search"
                placeholder="Search articles…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                aria-label="Search articles"
              />
            </div>
            <select
              className="pf-select"
              value={category}
              onChange={e => handleCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* States */}
          {loading && (
            <div className="ws-loading-state">
              <span className="pf-spinner" aria-hidden="true" />
              Loading posts…
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="ws-empty-state">
              <p style={{ fontWeight: 600, marginBottom: '.25rem' }}>No posts yet</p>
              <p style={{ margin: 0 }}>Check back soon — posts are on the way.</p>
            </div>
          )}

          {!loading && posts.length > 0 && filtered.length === 0 && (
            <div className="ws-empty-state">
              <p style={{ fontWeight: 600, marginBottom: '.25rem' }}>No results found</p>
              <p style={{ margin: 0 }}>Try a different search term or category.</p>
            </div>
          )}

          {/* Blog list */}
          {!loading && paginated.length > 0 && (
            <div className="pf-blog-list">
              {paginated.map((post, i) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
                const readTime = getReadTime(post.content);
                return (
                  <Link
                    key={post.id}
                    to={`/blogs/${post.slug}`}
                    className="pf-blog-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="pf-blog-item__img-wrap">
                      {post.cover_image_url ? (
                        <img
                          className="pf-blog-item__img"
                          src={post.cover_image_url}
                          alt={post.title}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="pf-blog-item__img-fallback"
                          style={{ background: BLOG_GRADIENTS[globalIndex % 5] }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="pf-blog-item__content">
                      <span className="pf-blog-item__badge">{post.category || 'General'}</span>
                      <h3 className="pf-blog-item__title">{post.title}</h3>
                      {post.excerpt && (
                        <p className="pf-blog-item__excerpt">{post.excerpt}</p>
                      )}
                      <div className="pf-blog-item__meta">
                        <span>{formatDate(post.created_at)}</span>
                        <span className="pf-blog-item__meta-dot" aria-hidden="true" />
                        <span>{readTime}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pf-pagination" role="navigation" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pf-page-btn${p === currentPage ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              {currentPage < totalPages && (
                <button
                  className="pf-page-btn"
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Next page"
                >
                  →
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
