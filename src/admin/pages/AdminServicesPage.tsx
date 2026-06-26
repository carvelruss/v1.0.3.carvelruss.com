import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { Service } from '../../types';

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <table className="a-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Updated</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map(svc => (
                <tr key={svc.id}>
                  <td>
                    <div className="a-table-title">{svc.title}</div>
                    <div className="a-table-sub">/services/{svc.slug}</div>
                  </td>
                  <td>
                    <button
                      className={`a-badge a-badge--clickable ${svc.status === 'published' ? 'a-badge--green' : 'a-badge--gray'}`}
                      onClick={() => handleToggleStatus(svc.id, svc.status ?? 'draft')}
                      title="Click to toggle"
                    >
                      {svc.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {svc.tags.slice(0, 3).map(t => (
                        <span key={t} className="a-badge a-badge--blue">{t}</span>
                      ))}
                      {svc.tags.length > 3 && <span className="a-badge a-badge--gray">+{svc.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="a-table-muted">{formatDate(svc.updated_at)}</td>
                  <td>
                    <div className="a-table-actions">
                      <button className="a-action-btn a-action-btn--edit" title="Edit"
                        onClick={() => navigate(`/admin/services/${svc.id}/edit`)}>✏</button>
                      <a className="a-action-btn a-action-btn--view" title="View"
                        href={`/services/${svc.slug}`} target="_blank" rel="noopener noreferrer">↗</a>
                      <button className="a-action-btn a-action-btn--delete" title="Delete"
                        onClick={() => handleDelete(svc.id, svc.title)}>🗑</button>
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
