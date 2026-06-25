import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLayers, FiCheckCircle, FiEdit2, FiMail, FiPlus } from 'react-icons/fi';
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

const SPARK_RATIOS = [0.38, 0.46, 0.42, 0.55, 0.63, 0.74, 0.85, 1.0];

function sparkValues(n: number): number[] {
  return SPARK_RATIOS.map(r => Math.max(0, Math.round(n * r)));
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 88, H = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = W / (values.length - 1);

  const pts: [number, number][] = values.map((v, i) => [
    i * step,
    H - ((v - min) / range) * (H - 8) - 4,
  ]);

  // Smooth cubic bezier path
  let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev[0] + curr[0]) / 2;
    line += ` C ${cpx.toFixed(1)} ${prev[1].toFixed(1)} ${cpx.toFixed(1)} ${curr[1].toFixed(1)} ${curr[0].toFixed(1)} ${curr[1].toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0].toFixed(1)},${H} L0,${H} Z`;
  const gid = `sg${color.replace('#', '')}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────────

function DonutChart({ published, drafts }: { published: number; drafts: number }) {
  const total = published + drafts;
  const cx = 56, cy = 56, r = 38, sw = 13;
  const circ = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg viewBox="0 0 112 112" width="108" height="108" aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#94a3b8">No data</text>
      </svg>
    );
  }

  const pubLen = (published / total) * circ;
  const dftLen = (drafts / total) * circ;
  const dftOffset = (((circ / 4 - pubLen) % circ) + circ) % circ;

  return (
    <svg viewBox="0 0 112 112" width="108" height="108" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
      {published > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#6366f1" strokeWidth={sw}
          strokeDasharray={`${pubLen.toFixed(2)} ${circ.toFixed(2)}`}
          strokeDashoffset={(circ / 4).toFixed(2)}
          strokeLinecap="butt"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '56px 56px' }}
        />
      )}
      {drafts > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#f59e0b" strokeWidth={sw}
          strokeDasharray={`${dftLen.toFixed(2)} ${circ.toFixed(2)}`}
          strokeDashoffset={dftOffset.toFixed(2)}
          strokeLinecap="butt"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '56px 56px' }}
        />
      )}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="19" fontWeight="800" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#94a3b8">items</text>
    </svg>
  );
}

// ── Area Chart ─────────────────────────────────────────────────────────────────

const AREA_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
const AREA_RATIOS = [0.38, 0.50, 0.56, 0.64, 0.74, 0.87, 1.0];

function buildGrowth(n: number): number[] {
  return AREA_RATIOS.map(r => Math.max(0, Math.round(n * r)));
}

function AreaChart({ projects, posts }: { projects: number; posts: number }) {
  const projData = buildGrowth(Math.max(projects, 1));
  const postData = buildGrowth(Math.max(posts, 1));
  const max = Math.max(...projData, ...postData, 5);

  const W = 520, H = 180;
  const pad = { top: 18, right: 16, bottom: 28, left: 30 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;
  const n = AREA_MONTHS.length;

  const pts = (data: number[]): [number, number][] =>
    data.map((v, i) => [
      pad.left + (i / (n - 1)) * cw,
      pad.top + ch - (v / max) * ch,
    ]);

  function smoothLine(points: [number, number][]): string {
    let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = ((prev[0] + curr[0]) / 2).toFixed(1);
      d += ` C ${cpx} ${prev[1].toFixed(1)} ${cpx} ${curr[1].toFixed(1)} ${curr[0].toFixed(1)} ${curr[1].toFixed(1)}`;
    }
    return d;
  }

  function areaPath(points: [number, number][], linePath: string): string {
    const base = pad.top + ch;
    return `${linePath} L${points[points.length - 1][0].toFixed(1)},${base} L${points[0][0].toFixed(1)},${base} Z`;
  }

  const projPts = pts(projData);
  const postPts = pts(postData);
  const projLine = smoothLine(projPts);
  const postLine = smoothLine(postPts);
  const yTicks = [0, Math.round(max * 0.5), max];

  // Draw the higher-valued series' fill first (background) so the lower fill stays visible on top
  const projHigher = projData[projData.length - 1] >= postData[postData.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ width: '100%', height: `${H}px`, display: 'block' }}>
      <defs>
        <linearGradient id="ag-proj" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.11" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="ag-post" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {yTicks.map(tick => {
        const y = pad.top + ch - (tick / max) * ch;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.left - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{tick}</text>
          </g>
        );
      })}

      {projHigher ? (
        <>
          <path d={areaPath(projPts, projLine)} fill="url(#ag-proj)" />
          <path d={areaPath(postPts, postLine)} fill="url(#ag-post)" />
        </>
      ) : (
        <>
          <path d={areaPath(postPts, postLine)} fill="url(#ag-post)" />
          <path d={areaPath(projPts, projLine)} fill="url(#ag-proj)" />
        </>
      )}

      <path d={projLine} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={postLine} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {projPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
      ))}
      {postPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
      ))}

      {AREA_MONTHS.map((m, i) => (
        <text
          key={m}
          x={pad.left + (i / (n - 1)) * cw}
          y={H - 6}
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

// ── Inquiry Bar Chart ─────────────────────────────────────────────────────────

function InquiryBars({ inquiries }: { inquiries: Inquiry[] }) {
  const bars = [
    { label: 'Unread',   count: inquiries.filter(i => i.status === 'unread').length,   color: '#6366f1' },
    { label: 'Read',     count: inquiries.filter(i => i.status === 'read').length,     color: '#0284c7' },
    { label: 'Replied',  count: inquiries.filter(i => i.status === 'replied').length,  color: '#16a34a' },
    { label: 'Archived', count: inquiries.filter(i => i.status === 'archived').length, color: '#94a3b8' },
  ];
  const max = Math.max(...bars.map(b => b.count), 1);

  return (
    <div className="adm-bars">
      {bars.map(bar => (
        <div key={bar.label} className="adm-bars__item">
          <span className="adm-bars__label">{bar.label}</span>
          <div className="adm-bars__track">
            <div
              className="adm-bars__fill"
              style={{ width: `${(bar.count / max) * 100}%`, background: bar.color }}
            />
          </div>
          <span className="adm-bars__count">{bar.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

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

  const publishedProjects = projects.filter(p => p.status === 'published').length;
  const draftProjects     = projects.filter(p => p.status === 'draft').length;
  const publishedPosts    = posts.filter(p => p.status === 'published').length;
  const draftPosts        = posts.filter(p => p.status === 'draft').length;
  const unreadCount       = inquiries.filter(i => i.status === 'unread').length;

  const totalPublished = publishedProjects + publishedPosts;
  const totalDrafts    = draftProjects + draftPosts;

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  type ContentItem = { id: string; title: string; type: 'Blog' | 'Case Study'; date: string };
  const recentContent: ContentItem[] = [
    ...posts.map(p => ({
      id: `post-${p.id ?? p.slug}`,
      title: p.title,
      type: 'Blog' as const,
      date: p.updated_at ?? p.created_at ?? '',
    })),
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      title: p.title,
      type: 'Case Study' as const,
      date: p.updated_at ?? p.created_at ?? '',
    })),
  ]
    .filter(c => c.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const statCards = [
    {
      label: 'Case Studies', value: projects.length,
      spark: sparkValues(Math.max(projects.length, 1)),
      color: '#6366f1', icon: FiLayers, delta: '+13%', up: true,
    },
    {
      label: 'Published', value: publishedProjects,
      spark: sparkValues(Math.max(publishedProjects, 1)),
      color: '#10b981', icon: FiCheckCircle, delta: '+8%', up: true,
    },
    {
      label: 'Blog Posts', value: posts.length,
      spark: sparkValues(Math.max(posts.length, 1)),
      color: '#0284c7', icon: FiEdit2, delta: '+15%', up: true,
    },
  ];

  const headerAction = (
    <>
      <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/posts/new')}>
        <FiPlus size={12} aria-hidden /> Blog
      </button>
      <button className="a-btn a-btn--primary a-btn--sm" onClick={() => navigate('/admin/projects/new')}>
        <FiPlus size={12} aria-hidden /> Case Study
      </button>
    </>
  );

  return (
    <AdminLayout pageTitle="Dashboard" unreadInquiries={unreadCount} headerAction={headerAction}>
      {loading ? (
        <div className="a-loading">Loading…</div>
      ) : (
        <div className="adm-dash">

          {/* ── Left column ── */}
          <div className="adm-dash__left">

            {/* Stat cards */}
            <div className="adm-stat-row">
              {statCards.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="adm-stat-card">
                    <div className="adm-stat-card__top">
                      <div>
                        <div className="adm-stat-card__label">{stat.label}</div>
                        <div className="adm-stat-card__value">{stat.value}</div>
                        <span className={`adm-stat-card__delta adm-stat-card__delta--${stat.up ? 'up' : 'down'}`}>
                          {stat.delta} vs last month
                        </span>
                      </div>
                      <div className="adm-stat-card__icon" style={{ background: `${stat.color}1a`, color: stat.color }}>
                        <Icon size={15} aria-hidden />
                      </div>
                    </div>
                    <div className="adm-stat-card__spark">
                      <Sparkline values={stat.spark} color={stat.color} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Area chart */}
            <div className="a-card adm-chart-card">
              <div className="adm-chart-card__head">
                <div>
                  <div className="adm-chart-card__title">Content Growth</div>
                  <div className="adm-chart-card__sub">Case studies &amp; blog posts over time</div>
                </div>
                <div className="adm-chart-legend">
                  <span className="adm-legend-dot" style={{ background: '#6366f1' }} />
                  Case Studies
                  <span className="adm-legend-dot" style={{ background: '#10b981', marginLeft: 10 }} />
                  Blog Posts
                </div>
              </div>
              <div className="adm-chart-card__body">
                <AreaChart projects={projects.length} posts={posts.length} />
              </div>
            </div>

            {/* Inquiries table */}
            <div className="a-card adm-table-card">
              <div className="adm-table-card__head">
                <span className="adm-table-card__title">Recent Inquiries</span>
                <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/inbox')}>
                  View All →
                </button>
              </div>
              {recentInquiries.length === 0 ? (
                <div className="adm-empty">
                  <FiMail size={22} aria-hidden />
                  <p>No inquiries yet</p>
                </div>
              ) : (
                <div className="adm-inq-wrap">
                  <table className="adm-inq-table">
                    <thead>
                      <tr>
                        <th aria-label="Select"></th>
                        <th>Sender</th>
                        <th>Message</th>
                        <th>When</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInquiries.map(inq => (
                        <tr key={inq.id} onClick={() => navigate('/admin/inbox')} style={{ cursor: 'pointer' }}>
                          <td>
                            <input
                              type="checkbox"
                              className="adm-inq-check"
                              aria-label={`Select inquiry from ${inq.name}`}
                              onClick={e => e.stopPropagation()}
                              readOnly
                            />
                          </td>
                          <td className="adm-inq-name">{inq.name}</td>
                          <td className="adm-inq-msg">{inq.message}</td>
                          <td className="adm-inq-time">{relativeTime(inq.created_at)}</td>
                          <td>
                            <span className={`a-badge a-badge--${inq.status}`}>
                              {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="adm-dash__right">

            {/* Content status donut */}
            <div className="a-card adm-donut-card">
              <div className="adm-donut-card__head">Content Status</div>
              <div className="adm-donut-card__body">
                <DonutChart published={totalPublished} drafts={totalDrafts} />
                <div className="adm-donut-card__legend">
                  <div className="adm-donut-leg">
                    <span className="adm-donut-dot" style={{ background: '#6366f1' }} />
                    <span className="adm-donut-leg__label">Published</span>
                    <span className="adm-donut-leg__val">{totalPublished}</span>
                  </div>
                  <div className="adm-donut-leg">
                    <span className="adm-donut-dot" style={{ background: '#f59e0b' }} />
                    <span className="adm-donut-leg__label">Draft</span>
                    <span className="adm-donut-leg__val">{totalDrafts}</span>
                  </div>
                  <div className="adm-donut-leg">
                    <span className="adm-donut-dot" style={{ background: '#ef4444' }} />
                    <span className="adm-donut-leg__label">Unread inq.</span>
                    <span className="adm-donut-leg__val">{unreadCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry breakdown bars */}
            <div className="a-card adm-bars-card">
              <div className="adm-bars-card__head">
                <span>Inquiry Breakdown</span>
                <span className="adm-bars-card__total">{inquiries.length} total</span>
              </div>
              <div className="adm-bars-card__body">
                <InquiryBars inquiries={inquiries} />
              </div>
            </div>

            {/* Recent content list */}
            <div className="a-card adm-list-card">
              <div className="adm-list-card__head">
                <span>Recent Content</span>
                <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/projects')}>
                  View All →
                </button>
              </div>
              {recentContent.length === 0 ? (
                <div className="adm-empty">
                  <p>No content yet</p>
                </div>
              ) : (
                <ul className="adm-list">
                  {recentContent.map(item => (
                    <li
                      key={item.id}
                      className="adm-list__item"
                      onClick={() => navigate(item.type === 'Blog' ? '/admin/posts' : '/admin/projects')}
                    >
                      <div className={`adm-list__badge adm-list__badge--${item.type === 'Blog' ? 'blog' : 'proj'}`}>
                        {item.type === 'Blog' ? 'B' : 'C'}
                      </div>
                      <div className="adm-list__body">
                        <div className="adm-list__name">{item.title}</div>
                        <div className="adm-list__sub">{item.type} · {relativeTime(item.date)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
