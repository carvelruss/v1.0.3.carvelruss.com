import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { Service } from '../../types';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: 'Asia/Manila',
  });
}

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const load = () => {
    setLoading(true);
    api.getServices(true)
      .then(setServices)
      .catch(() => setError('Failed to load services.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number, title: string) => {
    if (!await confirm({ title: 'Delete service?', message: `"${title}" will be permanently deleted.` })) return;
    try {
      await api.deleteService(id);
      setSuccess(`"${title}" deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch {
      setError('Failed to delete service.');
    }
  };

  const handleToggleStatus = async (id: number, current: 'draft' | 'published') => {
    const next = current === 'published' ? 'draft' : 'published';
    try {
      await api.toggleServiceStatus(id, next);
      load();
    } catch {
      setError('Failed to update status.');
    }
  };

  return (
    <AdminLayout
      pageTitle="Services"
      headerAction={
        <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/services/new')}>
          + New Service
        </button>
      }
    >
      {modal}

      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      {loading ? (
        <div className="a-loading" style={{ margin: '60px auto' }} />
      ) : services.length === 0 ? (
        <div className="a-empty">
          <p>No services yet.</p>
          <button className="a-btn a-btn--secondary a-btn--sm" onClick={() => navigate('/admin/services/new')}>
            Create your first service
          </button>
        </div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table a-table--services">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Updated</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map(svc => (
                <tr key={svc.id}>
                  <td>
                    <div className="a-table__title">{svc.title}</div>
                    <div className="a-table__sub">/services/{svc.slug}</div>
                  </td>
                  <td>
                    <button
                      className={`a-badge a-svc-status-btn ${svc.status === 'published' ? 'a-badge--published' : 'a-badge--draft'}`}
                      onClick={() => handleToggleStatus(svc.id, svc.status ?? 'draft')}
                      title="Click to toggle status"
                    >
                      {svc.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {svc.tags.slice(0, 3).map(t => (
                        <span key={t} className="a-badge a-badge--unread">{t}</span>
                      ))}
                      {svc.tags.length > 3 && (
                        <span className="a-badge a-badge--read">+{svc.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="a-table-muted">{formatDate(svc.updated_at)}</td>
                  <td>
                    <div className="a-table__actions">
                      <button className="a-action-btn a-action-btn--edit" title="Edit"
                        onClick={() => navigate(`/admin/services/${svc.id}/edit`)}>
                        <EditIcon />
                      </button>
                      <a className="a-action-btn a-action-btn--view" title="View live page"
                        href={`/services/${svc.slug}`} target="_blank" rel="noopener noreferrer">
                        <ViewIcon />
                      </a>
                      <button className="a-action-btn a-action-btn--delete" title="Delete"
                        onClick={() => handleDelete(svc.id, svc.title)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
