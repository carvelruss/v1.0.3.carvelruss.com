import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Post } from '../../types';

const PAGE_SIZE = 10;

const CATEGORIES = [
  'Development', 'Design', 'Business', 'Marketing',
  'Technology', 'Tutorial', 'Case Study', 'Other',
];

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function PostsAdmin() {
  const navigate = useNavigate();

  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [search, setSearch]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'published' | 'draft'>('');
  const [sort, setSort]                 = useState<'newest' | 'oldest' | 'az'>('newest');
  const [page, setPage]                 = useState(1);

  const load = () => {
    setLoading(true);
    setError('');
    api.getPosts(true)
      .then(setPosts)
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter, sort]);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (statusFilter)   list = list.filter(p => p.status === statusFilter);
    if (categoryFilter) list = list.filter(p => (p.category ?? '') === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q)
      );
    }
    if (sort === 'newest') list.sort((a, b) => new Date(b.published_at ?? b.created_at ?? 0).getTime() - new Date(a.published_at ?? a.created_at ?? 0).getTime());
    if (sort === 'oldest') list.sort((a, b) => new Date(a.published_at ?? a.created_at ?? 0).getTime() - new Date(b.published_at ?? b.created_at ?? 0).getTime());
    if (sort === 'az')     list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [posts, search, categoryFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE + 1;
  const end        = Math.min(page * PAGE_SIZE, filtered.length);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await api.deletePost(post.slug);
      setSuccess(`"${post.title}" deleted.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  // Pagination page numbers with ellipsis
  function pageNums(cur: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total].filter(n => n >= 1 && n <= total));
    const arr = [...set].sort((a, b) => a - b);
    const out: (number | '...')[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i > 0 && arr[i] - arr[i - 1] > 1) out.push('...');
      out.push(arr[i]);
    }
    return out;
  }

  return (
    <AdminLayout
      pageTitle="Blog Posts"
      pageSubtitle="Manage and organize your blog content"
      headerAction={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/posts/new')}>
            + New Post
          </button>
          <a className="a-btn a-btn--ghost" href="/blog" target="_blank" rel="noopener noreferrer">
            ↗ View site
          </a>
        </div>
      }
    >
      {error   && <div className="a-alert a-alert--error"   role="alert"   style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status"  style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setSuccess('')}>{success}</div>}

      {/* ── Toolbar ── */}
      <div className="a-toolbar" style={{ marginBottom: 16 }}>
        <div className="a-search-wrap">
          <SearchIcon />
          <input
            className="a-search"
            type="search"
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search posts"
          />
        </div>

        <div className="a-filter-select-wrap">
          <select
            className="a-filter-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronIcon />
        </div>

        <div className="a-filter-select-wrap">
          <select
            className="a-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as '' | 'published' | 'draft')}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronIcon />
        </div>

        <div className="a-filter-select-wrap">
          <select
            className="a-filter-select"
            value={sort}
            onChange={e => setSort(e.target.value as 'newest' | 'oldest' | 'az')}
            aria-label="Sort"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="az">Sort by: A–Z</option>
          </select>
          <ChevronIcon />
        </div>

        <button className="a-filter-icon-btn" aria-label="More filters">
          <FilterIcon />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="a-card a-card--flush">
        <div className="a-table-wrap">
          {loading ? (
            <div className="a-loading" style={{ padding: '40px 24px', textAlign: 'center' }}>Loading…</div>
          ) : (
            <table className="a-table" aria-label="Blog posts list">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>SLUG</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>PUBLISHED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="a-empty">
                        <div className="a-empty__icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        {search || categoryFilter || statusFilter
                          ? 'No posts match your filters.'
                          : 'No posts yet. Write your first one.'}
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(post => (
                  <tr key={post.slug}>
                    <td style={{ maxWidth: 300 }}>
                      <div className="a-table__title">{post.title}</div>
                      {post.excerpt && (
                        <div className="a-table__sub" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</div>
                      )}
                    </td>
                    <td>
                      <span className="a-slug-pill">{post.slug}</span>
                    </td>
                    <td style={{ color: 'var(--adm-muted)', fontSize: 13 }}>
                      {post.category || <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td>
                      {post.status === 'published' ? (
                        <span className="a-badge a-badge--published">
                          <span className="a-badge__dot" />
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="a-badge a-badge--draft">
                          <span className="a-badge__dot" />
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--adm-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {formatDate(post.published_at)}
                    </td>
                    <td>
                      <div className="a-table__actions">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="a-action-btn a-action-btn--view"
                            aria-label={`View ${post.title}`}
                            title="View"
                          >
                            <EyeIcon />
                          </a>
                        )}
                        <button
                          className="a-action-btn a-action-btn--edit"
                          onClick={() => navigate(`/admin/posts/${post.slug}/edit`)}
                          aria-label={`Edit ${post.title}`}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="a-action-btn a-action-btn--delete"
                          onClick={() => handleDelete(post)}
                          aria-label={`Delete ${post.title}`}
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && filtered.length > 0 && (
          <div className="a-pagination">
            <span className="a-pagination__info">
              Showing {start}–{end} of {filtered.length} post{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="a-pagination__btns">
              <button
                className="a-pager a-pager--arrow"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {pageNums(page, totalPages).map((n, i) =>
                n === '...'
                  ? <span key={`ellipsis-${i}`} className="a-pager a-pager--ellipsis">…</span>
                  : <button
                      key={n}
                      className={`a-pager${n === page ? ' active' : ''}`}
                      onClick={() => setPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                    >
                      {n}
                    </button>
              )}
              <button
                className="a-pager a-pager--arrow"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
