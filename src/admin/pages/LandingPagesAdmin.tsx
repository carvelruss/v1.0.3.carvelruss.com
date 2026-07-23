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
    <AdminLayout pageTitle="Landing Pages">
      {modal}
      <div className="ep-page">
        <div className="ep-page-header">
          <div>
            <h1 className="ep-page-title">Landing Pages</h1>
            <p className="ep-page-sub">Full-page templates with editable sections</p>
          </div>
          <button className="ep-btn ep-btn-primary" onClick={() => navigate('/admin/landing-pages/new')}>
            + New Landing Page
          </button>
        </div>

        {error   && <div className="ep-alert ep-alert-error">{error}</div>}
        {success && <div className="ep-alert ep-alert-success">{success}</div>}

        {loading ? (
          <div className="ep-loading">Loading…</div>
        ) : pages.length === 0 ? (
          <div className="ep-empty">
            <p>No landing pages yet.</p>
            <button className="ep-btn ep-btn-primary" onClick={() => navigate('/admin/landing-pages/new')}>
              Create your first landing page
            </button>
          </div>
        ) : (
          <div className="ep-table-wrap">
            <table className="ep-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id}>
                    <td className="ep-td-title">
                      <span className="ep-td-name">{page.title}</span>
                    </td>
                    <td>
                      <code className="ep-code">/lp/{page.slug}</code>
                    </td>
                    <td>
                      <button
                        className={`ep-status-badge ep-status-badge--${page.status}`}
                        onClick={() => handleToggleStatus(page)}
                        title={`Click to set to ${page.status === 'published' ? 'draft' : 'published'}`}
                      >
                        {page.status}
                      </button>
                    </td>
                    <td className="ep-td-date">{formatDate(page.published_at)}</td>
                    <td className="ep-td-actions">
                      <a
                        href={`/lp/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ep-icon-btn"
                        title="Preview"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </a>
                      <button
                        className="ep-icon-btn"
                        onClick={() => navigate(`/admin/landing-pages/${page.slug}/edit`)}
                        title="Edit"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        className="ep-icon-btn ep-icon-btn--danger"
                        onClick={() => handleDelete(page)}
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
