import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { Project } from '../../types';

const PAGE_SIZE = 10;

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsAdmin() {
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'published' | 'draft'>('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError('');
    api.getProjects(true)
      .then(setProjects)
      .catch(() => setError('Failed to load case studies.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter) {
      list = list.filter(p => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.project_type ?? '').toLowerCase().includes(q) ||
        (p.role ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (p: Project) => {
    if (!await confirm({ title: 'Delete case study?', message: `Delete "${p.title}"? This cannot be undone.` })) return;
    setError('');
    try {
      await api.deleteProject(p.id);
      setSuccess(`"${p.title}" deleted.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleToggleFeatured = async (p: Project) => {
    const next = p.featured === 1 ? false : true;
    try {
      await api.toggleProjectFeatured(p.id, next);
      setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: next ? 1 : 0 } : x));
    } catch {
      setError('Failed to update featured status.');
    }
  };

  return (
    <AdminLayout
      pageTitle="Case Studies"
      headerAction={
        <button
          className="a-btn a-btn--primary"
          onClick={() => navigate('/admin/projects/new')}
        >
          + New Case Study
        </button>
      }
    >
      {modal}
      {error && (
        <div
          className="a-alert a-alert--error"
          role="alert"
          style={{ marginBottom: 16, cursor: 'pointer' }}
          onClick={() => setError('')}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="a-alert a-alert--success"
          role="status"
          style={{ marginBottom: 16, cursor: 'pointer' }}
          onClick={() => setSuccess('')}
        >
          {success}
        </div>
      )}

      {/* Toolbar */}
      <div className="a-toolbar" style={{ marginBottom: 16 }}>
        <div className="a-search-wrap">
          <svg className="a-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="a-search"
            type="search"
            placeholder="Search case studies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search case studies"
          />
        </div>
        <select
          className="a-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as '' | 'published' | 'draft')}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="a-card a-card--flush">
        <div className="a-table-wrap">
          {loading ? (
            <div className="a-loading" style={{ padding: '40px 24px', textAlign: 'center' }}>
              Loading…
            </div>
          ) : (
            <table className="a-table" aria-label="Case studies list">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>FEATURED</th>
                  <th>DATE</th>
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
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        {search || statusFilter
                          ? 'No case studies match your filters.'
                          : 'No case studies yet. Add your first one.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map(p => (
                    <tr key={p.id}>
                      {/* Title */}
                      <td>
                        <div className="a-table__title">{p.title}</div>
                        {p.excerpt && (
                          <div className="a-table__sub" style={{ maxWidth: 260 }}>
                            {p.excerpt}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td style={{ color: 'var(--adm-text-2)', fontSize: 13 }}>
                        {p.project_type || p.role || '—'}
                      </td>

                      {/* Status badge */}
                      <td>
                        {p.status === 'published' ? (
                          <span className="a-badge a-badge--published">Published</span>
                        ) : (
                          <span className="a-badge a-badge--draft">Draft</span>
                        )}
                      </td>

                      {/* Featured star */}
                      <td>
                        <button
                          className={p.featured === 1 ? 'a-star' : 'a-star a-star--off'}
                          onClick={() => handleToggleFeatured(p)}
                          aria-label={p.featured === 1 ? `Unfeature ${p.title}` : `Feature ${p.title}`}
                          title={p.featured === 1 ? 'Click to unfeature' : 'Click to feature'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          &#9733;
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{ color: 'var(--adm-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {formatDate(p.published_at ?? p.created_at)}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="a-table__actions">
                          <button
                            className="a-action-btn a-action-btn--edit"
                            onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                            aria-label={`Edit ${p.title}`}
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="a-action-btn a-action-btn--delete"
                            onClick={() => handleDelete(p)}
                            aria-label={`Delete ${p.title}`}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="a-pagination">
            <span className="a-pagination__info">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="a-pagination__btns">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`a-pager${n === page ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              {page < totalPages && (
                <button className="a-pager" onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
