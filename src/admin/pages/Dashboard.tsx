import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiLayers, FiCheckCircle, FiFileText, FiEdit2,
  FiMail, FiBell, FiPlus, FiExternalLink,
} from 'react-icons/fi';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry, Post, Project } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

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

type IconComponent = React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

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

  type Stat = {
    label: string;
    value: number;
    delta: string | null;
    up: boolean;
    icon: IconComponent;
    iconColor: string;
  };

  const stats: Stat[] = [
    { label: 'Total Case Studies', value: projects.length,   delta: '↑ 13%', up: true,  icon: FiLayers,      iconColor: 'primary' },
    { label: 'Published',          value: publishedProjects,  delta: null,    up: true,  icon: FiCheckCircle, iconColor: 'success' },
    { label: 'Drafts',             value: draftProjects,      delta: '↓ 4%',  up: false, icon: FiFileText,    iconColor: 'warning' },
    { label: 'Total Blogs',        value: posts.length,       delta: '↑ 15%', up: true,  icon: FiEdit2,       iconColor: 'info'    },
    { label: 'Total Inquiries',    value: inquiries.length,   delta: '↑ 9%',  up: true,  icon: FiMail,        iconColor: 'primary' },
    { label: 'Unread Inquiries',   value: unreadCount,        delta: null,     up: false, icon: FiBell,        iconColor: 'danger'  },
  ];

  // ── Quick actions ──────────────────────────────────────────────────────────
  const quickActions = [
    { label: 'New Case Study', icon: FiLayers,       color: 'primary', action: () => navigate('/admin/projects/new') },
    { label: 'New Blog Post',  icon: FiEdit2,        color: 'info',    action: () => navigate('/admin/posts/new')    },
    { label: 'View Inbox',     icon: FiMail,         color: 'success', action: () => navigate('/admin/inbox')        },
    { label: 'View Site',      icon: FiExternalLink, color: 'muted',   action: () => window.open('/', '_blank')      },
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
    <AdminLayout pageTitle="Dashboard" unreadInquiries={unreadCount}>

      {/* ── Welcome banner ── */}
      <div className="adm-welcome">
        <div className="adm-welcome__text">
          <div className="adm-welcome__greeting">{getGreeting()}, Carvel</div>
          <div className="adm-welcome__sub">
            Here's what's happening in your portfolio · {dateRange()}
          </div>
        </div>
        <div className="adm-welcome__actions">
          <button
            className="a-btn a-btn--primary a-btn--sm"
            onClick={() => navigate('/admin/projects/new')}
          >
            <FiPlus size={13} aria-hidden /> New Case Study
          </button>
          <button
            className="a-btn a-btn--ghost a-btn--sm"
            onClick={() => navigate('/admin/posts/new')}
          >
            <FiPlus size={13} aria-hidden /> New Blog Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="a-loading">Loading…</div>
      ) : (
        <>
          {/* ── Stats grid ── */}
          <div className="adm-stats-grid">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="adm-stat">
                  <div className="adm-stat__header">
                    <span className="adm-stat__label">{s.label}</span>
                    <div className={`adm-stat__icon-wrap adm-stat__icon-wrap--${s.iconColor}`} aria-hidden="true">
                      <Icon size={13} />
                    </div>
                  </div>
                  <div className="adm-stat__value">{s.value}</div>
                  {s.delta && (
                    <span className={`adm-stat__delta ${s.up ? 'adm-stat__delta--up' : 'adm-stat__delta--down'}`}>
                      {s.delta} vs last month
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Quick actions ── */}
          <div className="adm-quick-actions">
            {quickActions.map(qa => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  className="adm-quick-action"
                  onClick={qa.action}
                >
                  <div className={`adm-quick-action__icon adm-quick-action__icon--${qa.color}`} aria-hidden="true">
                    <Icon size={16} />
                  </div>
                  <span className="adm-quick-action__label">{qa.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Two-column panels ── */}
          <div className="adm-dash-grid">

            {/* Recent Inquiries */}
            <div className="a-card">
              <div className="a-section-head">
                <span className="a-section-head__title">Recent Inquiries</span>
                <button
                  className="a-section-head__action"
                  onClick={() => navigate('/admin/inbox')}
                >
                  View All →
                </button>
              </div>

              {recentInquiries.length === 0 ? (
                <div className="a-empty">
                  <FiMail size={28} className="a-empty__icon-react" aria-hidden />
                  <p>No inquiries yet</p>
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
                      <div className="a-recent-item__body">
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
                <button
                  className="a-section-head__action"
                  onClick={() => navigate('/admin/projects')}
                >
                  View All →
                </button>
              </div>

              {recentContent.length === 0 ? (
                <div className="a-empty">
                  <FiFileText size={28} className="a-empty__icon-react" aria-hidden />
                  <p>No content yet</p>
                </div>
              ) : (
                <ul className="a-recent-list">
                  {recentContent.map(item => (
                    <li
                      key={item.id}
                      className="a-recent-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(item.type === 'Blog' ? '/admin/posts' : '/admin/projects')}
                    >
                      <div
                        className="a-recent-item__avatar"
                        style={{
                          background: item.type === 'Blog'
                            ? 'rgba(2,132,199,.10)'
                            : 'rgba(30,78,216,.10)',
                          color: item.type === 'Blog' ? '#0284c7' : '#1E4ED8',
                        }}
                      >
                        {item.type === 'Blog' ? 'B' : 'C'}
                      </div>
                      <div className="a-recent-item__body">
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
