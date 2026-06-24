import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { Inquiry } from '../../types';

type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

const STATUS_BADGE: Record<InquiryStatus, string> = {
  unread:   'a-badge--unread',
  read:     'a-badge--read',
  replied:  'a-badge--replied',
  archived: 'a-badge--archived',
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  unread:   'Unread',
  read:     'Read',
  replied:  'Replied',
  archived: 'Archived',
};

const PROJECT_TYPES = [
  'Website Design',
  'Web Application',
  'E-commerce',
  'Landing Page',
  'Branding',
  'Consulting',
  'Other',
];

const PAGE_SIZE = 10;

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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

function SearchIcon() {
  return (
    <svg className="a-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function exportCSV(rows: Inquiry[]) {
  const headers = ['ID', 'Name', 'Email', 'Project Type', 'Status', 'Subject', 'Message', 'Date'];
  const escape = (v: string | null | undefined) =>
    `"${(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      [
        r.id,
        escape(r.name),
        escape(r.email),
        escape(r.project_type),
        r.status,
        escape(r.subject),
        escape(r.message),
        new Date(r.created_at).toISOString(),
      ].join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InboxAdmin() {
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage]           = useState(1);

  const load = () => {
    setLoading(true);
    api.getInquiries()
      .then(setInquiries)
      .catch(() => setError('Failed to load inquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unreadCount = useMemo(
    () => inquiries.filter(i => i.status === 'unread').length,
    [inquiries],
  );

  const filtered = useMemo(() => {
    return inquiries.filter(inq => {
      if (statusFilter && inq.status !== statusFilter) return false;
      if (projectFilter && inq.project_type !== projectFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          (inq.subject ?? '').toLowerCase().includes(q) ||
          inq.message.toLowerCase().includes(q) ||
          (inq.project_type ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inquiries, statusFilter, projectFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, projectFilter]);

  const handleDelete = async (inq: Inquiry) => {
    if (!await confirm({ title: 'Delete message?', message: `Delete message from "${inq.name}"? This cannot be undone.` })) return;
    try {
      await api.deleteInquiry(inq.id);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <AdminLayout pageTitle="Inquiries" unreadInquiries={unreadCount}>
      {modal}
      {error && (
        <div className="a-alert a-alert--error" role="alert"
          style={{ marginBottom: 16 }} onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="a-toolbar" style={{ marginBottom: 20 }}>
        <div className="a-search-wrap">
          <SearchIcon />
          <input
            className="a-search"
            type="search"
            placeholder="Search inquiries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search inquiries"
          />
        </div>

        <select
          className="a-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="a-filter-select"
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          aria-label="Filter by project type"
        >
          <option value="">All Project Types</option>
          {PROJECT_TYPES.map(pt => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
        </select>

        <button
          className="a-btn a-btn--ghost"
          onClick={() => exportCSV(filtered)}
          aria-label="Export inquiries as CSV"
        >
          Export
        </button>
      </div>

      {/* Table */}
      <div className="a-card">
        <div className="a-table-wrap">
          {loading ? (
            <div className="a-loading" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="a-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div className="a-empty__icon" style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                {search || statusFilter || projectFilter
                  ? 'No inquiries match your filters.'
                  : 'No inquiries yet. Contact form submissions will appear here.'}
              </p>
            </div>
          ) : (
            <table className="a-table" aria-label="Inquiries list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Project Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(inq => (
                  <tr
                    key={inq.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/inbox/${inq.id}`)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/admin/inbox/${inq.id}`)}
                    aria-label={`View inquiry from ${inq.name}`}
                  >
                    <td style={{ maxWidth: 260 }}>
                      <div className="a-table__title">{inq.name}</div>
                      <div className="a-table__sub">{inq.email}</div>
                    </td>

                    <td style={{ color: '#64748b', fontSize: 13 }}>
                      {inq.project_type ?? <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>

                    <td>
                      <span className={`a-badge ${STATUS_BADGE[inq.status]}`}>
                        {STATUS_LABELS[inq.status]}
                      </span>
                    </td>

                    <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDate(inq.created_at)}
                    </td>

                    <td>
                      <div className="a-table__actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="a-action-btn a-action-btn--view"
                          onClick={() => navigate(`/admin/inbox/${inq.id}`)}
                          aria-label={`View inquiry from ${inq.name}`}
                          title="View"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          className="a-action-btn a-action-btn--delete"
                          onClick={() => handleDelete(inq)}
                          aria-label={`Delete inquiry from ${inq.name}`}
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="a-pagination">
            <span className="a-pagination__info">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="a-pagination__btns">
              <button
                className={`a-pager${safePage === 1 ? ' active' : ''}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`a-pager${n === safePage ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className={`a-pager${safePage === totalPages ? ' active' : ''}`}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
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
