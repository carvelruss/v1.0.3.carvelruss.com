import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry, Post, Project } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dateRange(): string {
  const now   = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 31);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(now)}`;
}

function badgeClass(status: Inquiry['status']): string {
  switch (status) {
    case 'unread':   return 'a-badge a-badge--unread';
    case 'read':     return 'a-badge a-badge--read';
    case 'replied':  return 'a-badge a-badge--replied';
    case 'archived': return 'a-badge a-badge--archived';
    default:         return 'a-badge';
  }
}

function badgeLabel(status: Inquiry['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!api.getToken()) { setLoading(false); return; }

    Promise.allSettled([
      api.getProjects(true),
      api.getPosts(true),
      api.getInquiries(),
    ]).then(([pRes, poRes, iRes]) => {
      if (pRes.status  === 'fulfilled' && Array.isArray(pRes.value))  setProjects(pRes.value);
      if (poRes.status === 'fulfilled' && Array.isArray(poRes.value)) setPosts(poRes.value);
      if (iRes.status  === 'fulfilled' && Array.isArray(iRes.value))  setInquiries(iRes.value);
    }).finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const publishedProjects = projects.filter(p => p.status === 'published').length;
  const draftProjects     = projects.filter(p => p.status === 'draft').length;
  const unreadCount       = inquiries.filter(i => i.status === 'unread').length;

  const stats = [
    { label: 'TOTAL CASE STUDIES', value: projects.length,  delta: '↑ 13%', up: true  },
    { label: 'PUBLISHED',          value: publishedProjects, delta: '↑ 8%',  up: true  },
    { label: 'DRAFTS',             value: draftProjects,     delta: '↓ 4%',  up: false },
    { label: 'TOTAL BLOGS',        value: posts.length,      delta: '↑ 15%', up: true  },
    { label: 'TOTAL INQUIRIES',    value: inquiries.length,  delta: '↑ 9%',  up: true  },
    { label: 'UNREAD INQUIRIES',   value: unreadCount,       delta: null,     up: false },
  ];

  // ── Recent slices ──────────────────────────────────────────────────────────
  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  type ContentItem = { id: string; title: string; type: 'Blog' | 'Case Study'; date: string };
  const recentContent: ContentItem[] = [
    ...posts.map(p => ({
      id:    `post-${p.id ?? p.slug}`,
      title: p.title,
      type:  'Blog' as const,
      date:  p.updated_at ?? p.created_at ?? '',
    })),
    ...projects.map(p => ({
      id:    `proj-${p.id}`,
      title: p.title,
      type:  'Case Study' as const,
      date:  p.updated_at ?? p.created_at ?? '',
    })),
  ]
    .filter(c => c.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout pageTitle="Dashboard Overview" unreadInquiries={unreadCount}>

      {/* ── Dashboard header ── */}
      <div className="adm-dash-header">
        <div>
          <div className="adm-dash-title">Dashboard Overview</div>
          <div className="adm-dash-date">{dateRange()}</div>
        </div>
        <button
          className="a-btn a-btn--primary a-btn--sm"
          onClick={() => navigate('/admin/projects/new')}
        >
          + New Case Study
        </button>
      </div>

      {loading ? (
        <div className="a-loading">Loading…</div>
      ) : (
        <>
          {/* ── Stats grid (3×2) ── */}
          <div className="adm-stats-grid">
            {stats.map(s => (
              <div key={s.label} className="adm-stat">
                <span className="adm-stat__label">{s.label}</span>
                <div className="adm-stat__value">{s.value}</div>
                {s.delta && (
                  <span className={`adm-stat__delta ${s.up ? 'adm-stat__delta--up' : 'adm-stat__delta--down'}`}>
                    {s.delta}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Two-column panels ── */}
          <div className="adm-dash-grid">

            {/* Recent Inquiries */}
            <div className="a-card">
              <div className="a-section-head">
                <span className="a-section-head__title">Recent Inquiries</span>
                <button
                  className="a-btn a-btn--ghost a-btn--sm a-section-head__action"
                  onClick={() => navigate('/admin/inbox')}
                >
                  View All
                </button>
              </div>

              {recentInquiries.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty__icon">📭</div>
                  No inquiries yet
                </div>
              ) : (
                <ul className="a-recent-list">
                  {recentInquiries.map(inq => (
                    <li
                      key={inq.id}
                      className="a-recent-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/admin/inbox')}
                    >
                      <div className="a-recent-item__avatar">
                        {inq.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="a-recent-item__name">{inq.name}</div>
                        <div className="a-recent-item__sub">{inq.message}</div>
                      </div>
                      <span className="a-recent-item__time">{relativeTime(inq.created_at)}</span>
                      <span className={badgeClass(inq.status)}>{badgeLabel(inq.status)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Content */}
            <div className="a-card">
              <div className="a-section-head">
                <span className="a-section-head__title">Recent Content</span>
              </div>

              {recentContent.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty__icon">📄</div>
                  No content yet
                </div>
              ) : (
                <ul className="a-recent-list">
                  {recentContent.map(item => (
                    <li
                      key={item.id}
                      className="a-recent-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        navigate(item.type === 'Blog' ? '/admin/posts' : '/admin/projects')
                      }
                    >
                      <div className="a-recent-item__avatar"
                        style={{ background: item.type === 'Blog' ? 'rgba(56,189,248,.15)' : 'rgba(99,102,241,.15)',
                                 color:      item.type === 'Blog' ? '#38bdf8' : '#818cf8' }}
                      >
                        {item.type === 'Blog' ? 'B' : 'C'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="a-recent-item__name">{item.title}</div>
                        <div className="a-recent-item__sub">{item.type}</div>
                      </div>
                      <span className="a-recent-item__time">{relativeTime(item.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </>
      )}
    </AdminLayout>
  );
}
