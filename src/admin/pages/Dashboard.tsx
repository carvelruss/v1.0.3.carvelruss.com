import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry, Post, Project } from '../../types';

const STAT_COLORS = [
  { bg: '#eef2ff', color: '#6366f1' },
  { bg: '#dcfce7', color: '#16a34a' },
  { bg: '#fef3c7', color: '#d97706' },
  { bg: '#fee2e2', color: '#ef4444' },
];

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

  const unread    = inquiries.filter(i => !i.is_read).length;
  const published = posts.filter(p => p.status === 'published').length;
  const drafts    = posts.filter(p => p.status === 'draft').length;
  const recent    = inquiries.slice(0, 5);

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const stats = [
    { icon: '🗂', label: 'Case Studies',    value: projects.length,  idx: 0 },
    { icon: '✅', label: 'Published Posts', value: published,        idx: 1 },
    { icon: '📋', label: 'Drafts',          value: drafts,           idx: 2 },
    { icon: '📩', label: 'Unread Messages', value: unread,           idx: 3 },
  ];

  return (
    <AdminLayout pageTitle="Dashboard" unreadInquiries={unread}>
      {loading ? (
        <p style={{ color: '#64748b', padding: '12px 0' }}>Loading…</p>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="a-stats">
            {stats.map(s => (
              <div
                key={s.label}
                className="a-stat"
                role="region"
                aria-label={`${s.label}: ${s.value}`}
              >
                <div
                  className="a-stat__icon"
                  style={{ background: STAT_COLORS[s.idx].bg, color: STAT_COLORS[s.idx].color }}
                  aria-hidden="true"
                >
                  {s.icon}
                </div>
                <div className="a-stat__value">{s.value}</div>
                <div className="a-stat__label">{s.label}</div>
              </div>
            ))}
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
                📩 {unread} Unread {unread === 1 ? 'Message' : 'Messages'}
              </button>
            )}
          </div>

          {/* ── Recent inquiries ── */}
          {recent.length > 0 && (
            <div className="a-card">
              <div className="a-section-head">
                <span className="a-section-head__title">Recent Inquiries</span>
                <button
                  className="a-btn a-btn--ghost a-btn--sm a-section-head__action"
                  onClick={() => navigate('/admin/inbox')}
                >
                  View all →
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
                      <tr
                        key={inq.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/admin/inbox')}
                      >
                        <td>
                          <div className="a-table__title" style={{ fontWeight: inq.is_read ? 500 : 700 }}>
                            {inq.name}
                          </div>
                        </td>
                        <td>{inq.email}</td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{formatDate(inq.created_at)}</td>
                        <td>
                          <span className={`a-badge ${inq.is_read ? 'a-badge--read' : 'a-badge--unread'}`}>
                            <span className="a-badge__dot" />
                            {inq.is_read ? 'Read' : 'New'}
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
