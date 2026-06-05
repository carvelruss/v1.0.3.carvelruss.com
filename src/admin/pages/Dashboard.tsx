import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry, Post, Project } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.getToken()) { setLoading(false); return; }
    Promise.all([
      api.getProjects().catch(() => [] as Project[]),
      api.getPosts(true).catch(() => [] as Post[]),
      api.getInquiries().catch(() => [] as Inquiry[]),
    ]).then(([p, po, i]) => {
      setProjects(Array.isArray(p) ? p : []);
      setPosts(Array.isArray(po) ? po : []);
      setInquiries(Array.isArray(i) ? i : []);
    }).finally(() => setLoading(false));
  }, []);

  const unread = inquiries.filter(i => !i.is_read).length;
  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const recent = inquiries.slice(0, 4);

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <AdminLayout pageTitle="Dashboard" unreadInquiries={unread}>
      {loading ? (
        <p style={{ color: '#6c7a8d' }}>Loading…</p>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="a-stats">
            <div className="a-stat" role="region" aria-label="Projects count">
              <div className="a-stat__icon" aria-hidden="true">🗂</div>
              <div className="a-stat__value">{projects.length}</div>
              <div className="a-stat__label">Case Studies</div>
            </div>
            <div className="a-stat" role="region" aria-label="Published posts count">
              <div className="a-stat__icon" aria-hidden="true">📝</div>
              <div className="a-stat__value">{published}</div>
              <div className="a-stat__label">Published Posts</div>
            </div>
            <div className="a-stat" role="region" aria-label="Draft posts count">
              <div className="a-stat__icon" aria-hidden="true">📋</div>
              <div className="a-stat__value">{drafts}</div>
              <div className="a-stat__label">Drafts</div>
            </div>
            <div className="a-stat" role="region" aria-label="Unread inquiries count">
              <div className="a-stat__icon" aria-hidden="true">📩</div>
              <div className="a-stat__value">{unread}</div>
              <div className="a-stat__label">Unread Messages</div>
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/projects')}>
              + Add Project
            </button>
            <button className="a-btn a-btn--ghost" onClick={() => navigate('/admin/posts/new')}>
              ✏️ New Blog Post
            </button>
            {unread > 0 && (
              <button className="a-btn a-btn--ghost" onClick={() => navigate('/admin/inbox')}>
                📩 View {unread} Unread
              </button>
            )}
          </div>

          {/* ── Recent inquiries ── */}
          {recent.length > 0 && (
            <div className="a-card">
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e1e7ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Recent Inquiries</span>
                <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/inbox')}>
                  View all
                </button>
              </div>
              <div className="a-table-wrap">
                <table className="a-table" aria-label="Recent inquiries">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(inq => (
                      <tr key={inq.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/inbox')}>
                        <td className="a-table__title">{inq.name}</td>
                        <td>{inq.email}</td>
                        <td>{formatDate(inq.created_at)}</td>
                        <td>
                          <span className={`a-badge ${inq.is_read ? 'a-badge--read' : 'a-badge--unread'}`}>
                            {inq.is_read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
