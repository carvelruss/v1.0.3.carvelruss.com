import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import ProjectForm from '../components/ProjectForm';
import type { Project } from '../../types';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.getProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = () => { setEditing(undefined); setShowForm(true); };
  const handleEdit = (p: Project) => { setEditing(p); setShowForm(true); };

  const handleDelete = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(p.id);
      setSuccess(`"${p.title}" deleted.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setSuccess(editing ? 'Project updated.' : 'Project added.');
    load();
  };

  return (
    <AdminLayout
      pageTitle="Case Studies"
      headerAction={
        <button className="a-btn a-btn--primary" onClick={handleAdd}>
          + Add Project
        </button>
      }
    >
      {error && <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-card">
        <div className="a-table-wrap">
          {loading ? (
            <p style={{ padding: 24, color: '#6c7a8d' }}>Loading…</p>
          ) : (
            <table className="a-table" aria-label="Projects list">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Role</th>
                  <th>Tech</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 && (
                  <tr><td colSpan={5} className="a-table__empty">No projects yet. Add your first project.</td></tr>
                )}
                {projects.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#6c7a8d', fontWeight: 500 }}>{p.sort_order}</td>
                    <td>
                      <div className="a-table__title">{p.title}</div>
                      <div className="a-table__sub" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                      </div>
                    </td>
                    <td style={{ color: '#6c7a8d', fontSize: 12 }}>{p.role}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.tech.slice(0, 3).map(t => (
                          <span key={t} style={{ background: '#e7f0fd', color: '#1558b0', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 500 }}>{t}</span>
                        ))}
                        {p.tech.length > 3 && (
                          <span style={{ color: '#6c7a8d', fontSize: 11 }}>+{p.tech.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="a-table__actions">
                        <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => handleEdit(p)} aria-label={`Edit ${p.title}`}>Edit</button>
                        <button className="a-btn a-btn--danger a-btn--sm" onClick={() => handleDelete(p)} aria-label={`Delete ${p.title}`}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <ProjectForm
          project={editing}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}
    </AdminLayout>
  );
}
