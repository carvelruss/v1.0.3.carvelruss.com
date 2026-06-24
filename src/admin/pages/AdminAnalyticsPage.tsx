import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../../lib/api';

/* ── Types ──────────────────────────────────────────────────── */

interface DayCount { date: string; count: number }

interface AnalyticsData {
  days: number;
  pageViews: {
    total:      number;
    period:     number;
    prevPeriod: number;
    unique:     number;
    byDay:      DayCount[];
    topPages:   { path: string; count: number }[];
  };
  contacts: {
    total:      number;
    period:     number;
    prevPeriod: number;
    byDay:      DayCount[];
  };
}

/* ── Helpers ─────────────────────────────────────────────────── */

function fillDays(data: DayCount[], days: number): DayCount[] {
  const map = new Map(data.map(d => [d.date, d.count]));
  const out: DayCount[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function fmtDate(iso: string, short = false) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', short
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric' });
}

function calcChange(cur: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/* ── Sparkline (mini SVG line) ───────────────────────────────── */

function Sparkline({ data, color }: { data: DayCount[]; color: string }) {
  if (data.length < 2) return null;
  const W = 80; const H = 28;
  const max = Math.max(...data.map(d => d.count), 1);
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * W,
    H - (d.count / max) * H,
  ]);
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Area Line Chart ─────────────────────────────────────────── */

function AreaChart({ data, color = '#6366f1' }: { data: DayCount[]; color?: string }) {
  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--adm-muted)', fontSize: 13 }}>
      No data for this period
    </div>
  );

  const W = 800; const H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map(d => d.count), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    y: PAD.top + cH - (d.count / niceMax) * cH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + cH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`;

  const yTicks = 5;
  const showEvery = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="ac-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Y-axis grid + labels */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const frac = i / yTicks;
        const y = PAD.top + frac * cH;
        const val = Math.round(niceMax * (1 - frac));
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === yTicks ? '0' : '4 3'} />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {fmtNum(val)}
            </text>
          </g>
        );
      })}

      {/* Area + line */}
      <path d={areaPath} fill="url(#ac-grad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data dots */}
      {pts.map(p => (
        <circle key={p.date} cx={p.x} cy={p.y} r="3" fill={color}
          style={{ cursor: 'pointer' }}>
          <title>{fmtDate(p.date)}: {p.count.toLocaleString()}</title>
        </circle>
      ))}

      {/* X-axis labels */}
      {pts.filter((_, i) => i % showEvery === 0 || i === pts.length - 1).map(p => (
        <text key={p.date} x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
          {fmtDate(p.date, true)}
        </text>
      ))}
    </svg>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */

function StatCard({
  label, value, change, sub, sparkData, color = '#6366f1',
}: {
  label: string; value: string; change?: number | null;
  sub?: string; sparkData?: DayCount[]; color?: string;
}) {
  const up   = change != null && change >= 0;
  const sign = change != null ? (up ? '+' : '') : '';

  return (
    <div className="an-stat">
      <div className="an-stat__top">
        <div>
          <div className="an-stat__label">{label}</div>
          <div className="an-stat__value">{value}</div>
          {change != null ? (
            <div className={`an-stat__change ${up ? 'an-stat__change--up' : 'an-stat__change--down'}`}>
              <span className="an-stat__arrow">{up ? '▲' : '▼'}</span>
              {sign}{Math.abs(change)}%
            </div>
          ) : sub ? (
            <div className="an-stat__sub">{sub}</div>
          ) : null}
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} />}
      </div>
    </div>
  );
}

/* ── Period selector ─────────────────────────────────────────── */

const PERIODS = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

/* ── Main Component ──────────────────────────────────────────── */

export default function AdminAnalyticsPage() {
  const [days, setDays]       = useState(7);
  const [open, setOpen]       = useState(false);
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    const token = api.getToken();
    fetch(`/api/analytics?days=${days}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (r.status === 401) { api.clearToken(); window.location.href = '/admin/login'; throw new Error('Session expired'); }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<AnalyticsData>;
      })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [days]);

  const pvByDay = data ? fillDays(data.pageViews.byDay, days) : [];
  const cByDay  = data ? fillDays(data.contacts.byDay,  days) : [];

  const pvChange = data ? calcChange(data.pageViews.period, data.pageViews.prevPeriod) : null;
  const cChange  = data ? calcChange(data.contacts.period,  data.contacts.prevPeriod)  : null;
  const avgDay   = data && days > 0 ? Math.round(data.pageViews.period / days) : 0;

  const periodLabel = PERIODS.find(p => p.days === days)?.label ?? `Last ${days} days`;

  return (
    <AdminLayout pageTitle="Analytics">

      {error && <div className="a-alert a-alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── Stat cards ── */}
      <div className="an-stat-grid">
        <StatCard
          label="Page Views"
          value={data ? fmtNum(data.pageViews.period) : '—'}
          change={pvChange}
          sparkData={pvByDay}
          color="#6366f1"
        />
        <StatCard
          label="Unique Pages"
          value={data ? fmtNum(data.pageViews.unique) : '—'}
          sub="distinct paths visited"
          color="#0ea5e9"
        />
        <StatCard
          label="Inquiries"
          value={data ? fmtNum(data.contacts.period) : '—'}
          change={cChange}
          sparkData={cByDay}
          color="#10b981"
        />
        <StatCard
          label="Avg Views / Day"
          value={data ? fmtNum(avgDay) : '—'}
          sub={`over ${days} days`}
          color="#f59e0b"
        />
      </div>

      {/* ── Main body ── */}
      <div className="an-body">

        {/* Left: chart + top pages */}
        <div className="an-main">

          {/* Chart card */}
          <div className="a-card an-chart-card">
            <div className="an-chart-head">
              <div>
                <div className="an-chart-title">Visitors Overview</div>
                <div className="an-chart-sub">Page views per day</div>
              </div>

              {/* Period dropdown */}
              <div className="an-period-wrap">
                <button className="an-period-btn" onClick={() => setOpen(o => !o)}>
                  {periodLabel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open && (
                  <div className="an-period-menu">
                    {PERIODS.map(p => (
                      <button key={p.days} className={`an-period-item${days === p.days ? ' active' : ''}`}
                        onClick={() => { setDays(p.days); setOpen(false); }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="a-loading" />
              </div>
            ) : (
              <AreaChart data={pvByDay} color="#6366f1" />
            )}
          </div>

          {/* Top pages */}
          <div className="a-card">
            <div className="an-section-head">
              <span className="an-section-title">Top Pages</span>
              <span className="an-section-sub">{periodLabel}</span>
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center' }}><div className="a-loading" /></div>
            ) : !data || data.pageViews.topPages.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--adm-muted)', fontSize: 13 }}>
                No page views recorded yet
              </div>
            ) : (
              <table className="an-pages-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Page</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pageViews.topPages.map((p, i) => {
                    const pct = Math.round((p.count / (data.pageViews.topPages[0]?.count ?? 1)) * 100);
                    return (
                      <tr key={p.path}>
                        <td className="an-pages-rank">{i + 1}</td>
                        <td>
                          <div className="an-pages-path">{p.path || '/'}</div>
                          <div className="an-pages-bar">
                            <div className="an-pages-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="an-pages-count">{p.count.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="an-sidebar">

          {/* Summary card */}
          <div className="a-card an-summary">
            <div className="an-section-head">
              <span className="an-section-title">Summary</span>
              <span className="an-section-sub">All time</span>
            </div>
            <div className="an-summary-rows">
              <div className="an-sum-row">
                <span className="an-sum-label">Total Page Views</span>
                <span className="an-sum-val">{data ? fmtNum(data.pageViews.total) : '—'}</span>
              </div>
              <div className="an-sum-row">
                <span className="an-sum-label">Total Inquiries</span>
                <span className="an-sum-val">{data ? fmtNum(data.contacts.total) : '—'}</span>
              </div>
              <div className="an-sum-row">
                <span className="an-sum-label">Conversion Rate</span>
                <span className="an-sum-val">
                  {data && data.pageViews.total > 0
                    ? ((data.contacts.total / data.pageViews.total) * 100).toFixed(2) + '%'
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Contacts chart */}
          <div className="a-card">
            <div className="an-section-head">
              <span className="an-section-title">Inquiries</span>
              <span className="an-section-sub">{periodLabel}</span>
            </div>

            {loading ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}><div className="a-loading" /></div>
            ) : (
              <AreaChart data={cByDay} color="#10b981" />
            )}

            <div className="an-contact-total">
              <span>{data ? data.contacts.period : '—'} inquiries</span>
              {cChange != null && (
                <span className={`an-stat__change ${cChange >= 0 ? 'an-stat__change--up' : 'an-stat__change--down'}`}>
                  <span className="an-stat__arrow">{cChange >= 0 ? '▲' : '▼'}</span>
                  {cChange >= 0 ? '+' : ''}{cChange}% vs prev
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}
