import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import { api } from '../../lib/api';
import type { Testimonial } from '../../types';

type TStatus = 'pending' | 'approved' | 'rejected';

const STATUS_BADGE: Record<TStatus, string> = {
  pending:  'a-badge--unread',
  approved: 'a-badge--replied',
  rejected: 'a-badge--archived',
};
const STATUS_LABEL: Record<TStatus, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RejectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const PAGE_SIZE = 10;

export default function TestimonialsAdmin() {
  const { confirm, modal }              = useConfirm();
  const [items, setItems]               = useState<Testimonial[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);

  const load = () => {
    setLoading(true);
    api.getTestimonials()
      .then(setItems)
      .catch(() => setError('Failed to load testimonials.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => setPage(1), [statusFilter]);

  const filtered = useMemo(() =>
    statusFilter ? items.filter(t => t.status === statusFilter) : items,
    [items, statusFilter],
  );

  const pendingCount = useMemo(() => items.filter(t => t.status === 'pending').length, [items]);
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const pageRows     = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleApprove = async (t: Testimonial) => {
    try {
      await api.updateTestimonialStatus(t.id, 'approved');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve');
    }
  };

  const handleReject = async (t: Testimonial) => {
    try {
      await api.updateTestimonialStatus(t.id, 'rejected');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reject');
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!await confirm({ title: 'Delete testimonial?', message: `Permanently delete the review from "${t.full_name}"? This cannot be undone.` })) return;
    try {
      await api.deleteTestimonial(t.id);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AdminLayout pageTitle="Testimonials" pageSubtitle="Approve and manage client reviews">
      {modal}

      {error && (
        <div className="a-alert a-alert--error" role="alert"
          style={{ marginBottom: 16 }} onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="a-toolbar" style={{ marginBottom: 20 }}>
        <select
          className="a-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {pendingCount > 0 && (
          <span style={{ fontSize: 13, color: '#64748b' }}>
            <strong style={{ color: '#0d215a' }}>{pendingCount}</strong> pending review{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="a-card">
        <div className="a-table-wrap">
          {loading ? (
            <div className="a-loading" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="a-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div className="a-empty__icon" style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                {statusFilter ? 'No testimonials match this filter.' : 'No testimonials yet. Client reviews will appear here.'}
              </p>
            </div>
          ) : (
            <table className="a-table" aria-label="Testimonials list">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(t => (
                  <tr key={t.id}>
                    <td style={{ minWidth: 160 }}>
                      <div className="a-table__title">{t.full_name}</div>
                      <div className="a-table__sub">{t.company_name}</div>
                      <a
                        href={t.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#3b82f6' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {t.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </td>

                    <td style={{ maxWidth: 340 }}>
                      <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden' }}>
                        "{t.message}"
                      </p>
                    </td>

                    <td>
                      <span className={`a-badge ${STATUS_BADGE[t.status as TStatus]}`}>
                        {STATUS_LABEL[t.status as TStatus]}
                      </span>
                    </td>

                    <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDate(t.created_at)}
                    </td>

                    <td>
                      <div className="a-table__actions">
                        {t.status !== 'approved' && (
                          <button
                            className="a-action-btn a-action-btn--view"
                            onClick={() => handleApprove(t)}
                            title="Approve"
                            aria-label={`Approve review from ${t.full_name}`}
                          >
                            <CheckIcon />
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            className="a-action-btn"
                            style={{ color: '#94a3b8' }}
                            onClick={() => handleReject(t)}
                            title="Reject"
                            aria-label={`Reject review from ${t.full_name}`}
                          >
                            <RejectIcon />
                          </button>
                        )}
                        <button
                          className="a-action-btn a-action-btn--delete"
                          onClick={() => handleDelete(t)}
                          title="Delete"
                          aria-label={`Delete review from ${t.full_name}`}
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

        {!loading && totalPages > 1 && (
          <div className="a-pagination">
            <span className="a-pagination__info">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="a-pagination__btns">
              <button className="a-pager" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`a-pager${n === safePage ? ' active' : ''}`} onClick={() => setPage(n)} aria-label={`Page ${n}`}>{n}</button>
              ))}
              <button className="a-pager" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page">›</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
