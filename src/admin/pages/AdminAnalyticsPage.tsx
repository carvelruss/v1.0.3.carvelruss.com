import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../../lib/api';

interface DayCount { date: string; count: number }

interface AnalyticsData {
  days: number;
  pageViews: {
    total:    number;
    period:   number;
    byDay:    DayCount[];
    topPages: { path: string; count: number }[];
  };
  contacts: {
    total:  number;
    period: number;
    byDay:  DayCount[];
  };
}

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function BarChart({ data, color }: { data: DayCount[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const showEvery = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 10;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 96 }}>
        {data.map((d, i) => (
          <div
            key={d.date}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}
          >
            <div
              title={`${fmtDate(d.date)}: ${d.count}`}
              style={{
                width: '100%',
                height: d.count > 0 ? `${Math.max((d.count / max) * 100, 3)}%` : 0,
                background: color,
                borderRadius: '2px 2px 0 0',
                opacity: 0.85,
                cursor: 'default',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            />
            {i % showEvery === 0 && (
              <div style={{ fontSize: '.5625rem', color: 'var(--adm-muted)', textAlign: 'center', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {fmtDate(d.date)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="a-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
      <div style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--adm-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--adm-text)', lineHeight: 1 }}>
        {value.toLocaleString()}
      </div>
      {sub && (
        <div style={{ fontSize: '.75rem', color: 'var(--adm-muted)', marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

const PERIODS = [
  { label: '7 days',  days: 7  },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function AdminAnalyticsPage() {
  const [days, setDays]     = useState(30);
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
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

  return (
    <AdminLayout pageTitle="Analytics">

      {/* Period selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: 3, background: 'var(--adm-surface-2, #f1f5f9)', borderRadius: 8, padding: 3 }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: '.8125rem',
                fontWeight: days === p.days ? 600 : 400,
                background: days === p.days ? 'var(--adm-bg, #fff)' : 'transparent',
                color: days === p.days ? 'var(--adm-text)' : 'var(--adm-muted)',
                boxShadow: days === p.days ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {loading && !data && (
        <div className="a-empty">
          <div className="a-loading" aria-label="Loading analytics" />
        </div>
      )}

      {data && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard label="Total Page Views" value={data.pageViews.total} />
            <StatCard label={`Views — last ${days}d`} value={data.pageViews.period} />
            <StatCard label="Total Contacts" value={data.contacts.total} />
            <StatCard label={`Contacts — last ${days}d`} value={data.contacts.period} />
          </div>

          {/* Page views chart */}
          <div className="a-card" style={{ marginBottom: '1.5rem' }}>
            <div className="a-section-label">Page Views</div>
            {pvByDay.every(d => d.count === 0) ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--adm-muted)', fontSize: '.875rem' }}>
                No page views recorded yet
              </div>
            ) : (
              <BarChart data={pvByDay} color="var(--adm-accent, #6366f1)" />
            )}
          </div>

          {/* Contacts chart */}
          <div className="a-card" style={{ marginBottom: '1.5rem' }}>
            <div className="a-section-label">Contact Submissions</div>
            {cByDay.every(d => d.count === 0) ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--adm-muted)', fontSize: '.875rem' }}>
                No contact submissions recorded yet
              </div>
            ) : (
              <BarChart data={cByDay} color="#10b981" />
            )}
          </div>

          {/* Top pages */}
          <div className="a-card">
            <div className="a-section-label">Top Pages</div>
            {data.pageViews.topPages.length === 0 ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--adm-muted)', fontSize: '.875rem' }}>
                No page views recorded yet
              </div>
            ) : (
              <div style={{ marginTop: '0.75rem' }}>
                {data.pageViews.topPages.map((p, i) => {
                  const maxCount = data.pageViews.topPages[0]?.count ?? 1;
                  return (
                    <div
                      key={p.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        borderBottom: i < data.pageViews.topPages.length - 1 ? '1px solid var(--adm-border)' : 'none',
                      }}
                    >
                      <div style={{ width: 20, fontSize: '.75rem', color: 'var(--adm-muted)', textAlign: 'right', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '.8125rem', color: 'var(--adm-text)', minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.path || '/'}
                      </div>
                      <div style={{ flex: 2, background: 'var(--adm-surface-2, #f1f5f9)', borderRadius: 3, height: 5, overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ width: `${(p.count / maxCount) * 100}%`, height: '100%', background: 'var(--adm-accent, #6366f1)', borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--adm-text)', minWidth: 70, textAlign: 'right', flexShrink: 0 }}>
                        {p.count.toLocaleString()} {p.count === 1 ? 'view' : 'views'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

    </AdminLayout>
  );
}
