import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { LandingPage } from '../../types';

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);

export default function LandingPagesAdmin() {
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();

  const [pages,   setPages]   = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.getLandingPages(true)
      .then(setPages)
      .catch(() => setError('Failed to load landing pages.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (page: LandingPage) => {
    const next = page.status === 'published' ? 'draft' : 'published';
    try {
      await api.toggleLandingPageStatus(page.slug, next);
      setSuccess(`"${page.title}" set to ${next}.`);
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (page: LandingPage) => {
    const ok = await confirm({
      title: 'Delete landing page?',
      message: `"${page.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deleteLandingPage(page.slug);
      setSuccess('Page deleted.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch {
      setError('Failed to delete page.');
    }
  };

  return (
    <AdminLayout
      pageTitle="Landing Pages"
      pageSubtitle="Full-page templates with editable sections"
      headerAction={
        <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/landing-pages/new')}>
          + New Landing Page
        </button>
      }
    >
      {modal}

      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setSuccess('')}>{success}</div>}

      {loading ? (
        <div className="a-loading" style={{ padding: '40px 24px', textAlign: 'center' }}>Loading…</div>
      ) : pages.length === 0 ? (
        <div className="a-empty" style={{ padding: '60px 24px' }}>
          <div className="a-empty__icon">🗂️</div>
          <p style={{ marginBottom: 16 }}>No landing pages yet. Create one to get started.</p>
          <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/landing-pages/new')}>
            + Create Landing Page
          </button>
        </div>
      ) : (
        <div className="a-card a-card--flush">
          <div className="a-table-wrap">
            <table className="a-table" aria-label="Landing pages list">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL Slug</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id}>
                    <td>
                      <div className="a-table__title">{page.title}</div>
                    </td>
                    <td>
                      <span className="a-slug-pill">/lp/{page.slug}</span>
                    </td>
                    <td>
                      <button
                        className={`a-badge a-badge--${page.status}`}
                        onClick={() => handleToggleStatus(page)}
                        title={`Click to set to ${page.status === 'published' ? 'draft' : 'published'}`}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      >
                        <span className="a-badge__dot" />
                        {page.status}
                      </button>
                    </td>
                    <td style={{ color: 'var(--adm-muted)', fontSize: '.85rem' }}>
                      {formatDate(page.published_at)}
                    </td>
                    <td>
                      <div className="a-table__actions">
                        <a
                          href={`/lp/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="a-action-btn a-action-btn--view"
                          title="Preview"
                        >
                          <EyeIcon />
                        </a>
                        <button
                          className="a-action-btn a-action-btn--edit"
                          onClick={() => navigate(`/admin/landing-pages/${page.slug}/edit`)}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="a-action-btn a-action-btn--delete"
                          onClick={() => handleDelete(page)}
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
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
