import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../../lib/api';

/* ── Types ──────────────────────────────────────────────────── */

interface DayCount { date: string; count: number }

interface HeatCell   { day: number; hour: number; count: number }
interface DeviceRow  { date: string; device_type: string; count: number }

interface AnalyticsData {
  days: number;
  pageViews: {
    total:      number;
    period:     number;
    prevPeriod: number;
    unique:     number;
    byDay:      DayCount[];
    prevByDay:  DayCount[];
    topPages:   { path: string; count: number }[];
  };
  contacts: {
    total:      number;
    period:     number;
    prevPeriod: number;
    byDay:      DayCount[];
    prevByDay:  DayCount[];
  };
  heatmap:     HeatCell[];
  deviceByDay: DeviceRow[];
  browserStats: {
    current:  { browser: string; count: number }[];
    previous: { browser: string; count: number }[];
  };
  sessions: {
    period:          number;
    prevPeriod:      number;
    bounceRate:      number;
    prevBounceRate:  number;
    avgDuration:     number;
    prevAvgDuration: number;
    byDay:           DayCount[];
    prevByDay:       DayCount[];
    bounceByDay:     DayCount[];
    durationByDay:   DayCount[];
  };
}

/* ── Helpers ─────────────────────────────────────────────────── */

function fillDays(data: DayCount[], days: number, offsetDays = 0): DayCount[] {
  const map = new Map(data.map(d => [d.date, d.count]));
  const out: DayCount[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i - offsetDays);
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

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calcChange(cur: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/* ── Area Chart with interactive tooltip ────────────────────── */

interface TooltipState {
  index: number;
  pxLeft: number;
  pxTop: number;
  flip: boolean;
}

function AreaChart({
  data, prevData, color = '#6366f1', label = 'Views', yAxisRight = false,
}: {
  data: DayCount[];
  prevData?: DayCount[];
  color?: string;
  label?: string;
  yAxisRight?: boolean;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState<TooltipState | null>(null);

  const W = 800; const H = 220;
  const PAD = { top: 16, right: yAxisRight ? 44 : 16, bottom: 32, left: yAxisRight ? 16 : 44 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const max     = Math.max(...(data.map(d => d.count)), ...(prevData?.map(d => d.count) ?? []), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;

  const pts = data.map((d, i) => ({
    svgX: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    svgY: PAD.top + cH - (d.count / niceMax) * cH,
    ...d,
  }));

  const prevPts = prevData?.map((d, i) => ({
    svgX: PAD.left + (prevData.length > 1 ? (i / (prevData.length - 1)) * cW : cW / 2),
    svgY: PAD.top + cH - (d.count / niceMax) * cH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(' ');
  const areaPath = pts.length
    ? `${linePath} L${pts[pts.length - 1].svgX.toFixed(1)},${(PAD.top + cH).toFixed(1)} L${pts[0].svgX.toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`
    : '';

  const prevLinePath = prevPts && prevPts.length
    ? prevPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(' ')
    : null;

  const showEvery = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 10;

  const getSvgX = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const ratioX = (clientX - rect.left) / rect.width;
    return ratioX * W;
  }, []);

  const findIndex = useCallback((svgX: number) => {
    if (data.length === 0) return -1;
    const fraction = (svgX - PAD.left) / cW;
    return Math.max(0, Math.min(data.length - 1, Math.round(fraction * (data.length - 1))));
  }, [data.length, cW]);

  const showTip = useCallback((clientX: number, _clientY: number) => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container || data.length === 0) return;

    const svgX = getSvgX(clientX);
    if (svgX === null) return;
    const idx = findIndex(svgX);
    const svgRect = svg.getBoundingClientRect();
    const ctnRect = container.getBoundingClientRect();

    // Convert hovered point SVG coords → pixel coords relative to container
    const pt = pts[idx];
    const pxX = ((pt.svgX / W) * svgRect.width) + (svgRect.left - ctnRect.left);
    const pxY = ((pt.svgY / H) * svgRect.height) + (svgRect.top - ctnRect.top);

    const flip = pxX > ctnRect.width * 0.65;
    setTip({ index: idx, pxLeft: pxX, pxTop: pxY, flip });
  }, [data, pts, getSvgX, findIndex]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    showTip(e.clientX, e.clientY);
  }, [showTip]);

  const onPointerLeave = useCallback(() => setTip(null), []);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'mouse') showTip(e.clientX, e.clientY);
  }, [showTip]);

  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--adm-muted)', fontSize: 13 }}>
      No data for this period
    </div>
  );

  const tipPt   = tip != null ? data[tip.index]    : null;
  const tipPrev = tip != null ? prevData?.[tip.index] : null;
  const tipChange = tipPt && tipPrev && tipPrev.count > 0
    ? ((tipPt.count - tipPrev.count) / tipPrev.count * 100)
    : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible', cursor: 'crosshair' }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <defs>
          <linearGradient id={`ac-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Y-axis grid + labels */}
        {Array.from({ length: 6 }, (_, i) => {
          const frac = i / 5;
          const y = PAD.top + frac * cH;
          const val = Math.round(niceMax * (1 - frac));
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === 5 ? '0' : '4 3'} />
              <text
                x={yAxisRight ? W - PAD.right + 8 : PAD.left - 8}
                y={y + 4}
                textAnchor={yAxisRight ? 'start' : 'end'}
                fontSize="10" fill="#94a3b8"
              >
                {fmtNum(val)}
              </text>
            </g>
          );
        })}

        {/* Previous period ghost line */}
        {prevLinePath && (
          <path d={prevLinePath} fill="none" stroke={color} strokeWidth="1.5"
            strokeDasharray="4 3" strokeLinejoin="round" opacity="0.35" />
        )}

        {/* Area fill + current line */}
        <path d={areaPath} fill={`url(#ac-${label})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* X-axis labels */}
        {pts.filter((_, i) => i % showEvery === 0 || i === pts.length - 1).map(p => (
          <text key={p.date} x={p.svgX} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {fmtDate(p.date)}
          </text>
        ))}

        {/* Crosshair + active dot */}
        {tip != null && pts[tip.index] && (() => {
          const p = pts[tip.index];
          return (
            <g>
              <line x1={p.svgX} y1={PAD.top} x2={p.svgX} y2={PAD.top + cH}
                stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              <circle cx={p.svgX} cy={p.svgY} r="5" fill={color} stroke="#fff" strokeWidth="2" />
              {prevPts?.[tip.index] && (
                <circle cx={prevPts[tip.index].svgX} cy={prevPts[tip.index].svgY}
                  r="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
              )}
            </g>
          );
        })()}
      </svg>

      {/* HTML Tooltip */}
      {tip != null && tipPt && (
        <div
          className="an-tooltip"
          style={{
            left:      tip.flip ? 'auto' : tip.pxLeft + 14,
            right:     tip.flip ? `calc(100% - ${tip.pxLeft - 14}px)` : 'auto',
            top:       Math.max(0, tip.pxTop - 56),
          }}
        >
          <div className="an-tooltip__dates">
            {fmtDate(tipPt.date)}
            {tipPrev && <span className="an-tooltip__vs">vs {fmtDate(tipPrev.date)}</span>}
          </div>
          <div className="an-tooltip__row">
            <span className="an-tooltip__label">{label}:</span>
            <strong className="an-tooltip__val">{tipPt.count.toLocaleString()}</strong>
            {tipChange != null && (
              <span className={`an-tooltip__chg ${tipChange >= 0 ? 'up' : 'down'}`}>
                {tipChange >= 0 ? '▲' : '▼'} {Math.abs(tipChange).toFixed(1)}%
              </span>
            )}
          </div>
          {tipPrev && (
            <div className="an-tooltip__prev">
              Prev: {tipPrev.count.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function fmtDuration(s: number): string {
  if (s <= 0) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
}

/* ── Sessions Chart ──────────────────────────────────────────── */

type SessionTab = 'users' | 'sessions' | 'bounce' | 'duration';

interface SessionsData {
  period: number; prevPeriod: number;
  bounceRate: number; prevBounceRate: number;
  avgDuration: number; prevAvgDuration: number;
  byDay: DayCount[]; prevByDay: DayCount[];
  bounceByDay: DayCount[]; durationByDay: DayCount[];
}

function SessionsChart({ data, days, periodLabel }: { data: SessionsData; days: number; periodLabel: string }) {
  const [tab, setTab] = useState<SessionTab>('users');

  const pvChange  = calcChange(data.period,     data.prevPeriod);
  const brChange  = data.prevBounceRate  > 0 ? Math.round(((data.bounceRate - data.prevBounceRate) / data.prevBounceRate) * 100) : null;
  const durChange = calcChange(data.avgDuration, data.prevAvgDuration);

  const chartData: Record<SessionTab, { cur: DayCount[]; prev: DayCount[]; label: string; color: string; fmt: (v: number) => string }> = {
    users:    { cur: fillDays(data.byDay, days),       prev: fillDays(data.prevByDay, days, days),   label: 'Users',            color: '#6366f1', fmt: v => v.toLocaleString() },
    sessions: { cur: fillDays(data.byDay, days),       prev: fillDays(data.prevByDay, days, days),   label: 'Sessions',         color: '#6366f1', fmt: v => v.toLocaleString() },
    bounce:   { cur: fillDays(data.bounceByDay, days), prev: fillDays(data.bounceByDay, days, days), label: 'Bounce Rate',      color: '#f59e0b', fmt: v => v.toFixed(1) + '%' },
    duration: { cur: fillDays(data.durationByDay, days), prev: fillDays(data.durationByDay, days, days), label: 'Session Duration', color: '#10b981', fmt: fmtDuration },
  };

  const active = chartData[tab];

  const TABS: { key: SessionTab; label: string; value: string; change: number | null; down?: boolean }[] = [
    { key: 'users',    label: 'Users',            value: fmtNum(data.period),                change: pvChange },
    { key: 'sessions', label: 'Sessions',         value: fmtNum(data.period),                change: pvChange },
    { key: 'bounce',   label: 'Bounce Rate',      value: data.bounceRate.toFixed(1) + '%',   change: brChange, down: (brChange ?? 0) < 0 },
    { key: 'duration', label: 'Session Duration', value: fmtDuration(data.avgDuration),      change: durChange },
  ];

  return (
    <div className="a-card sc-card">
      {/* Metric tabs */}
      <div className="sc-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`sc-tab${tab === t.key ? ' sc-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="sc-tab__label">{t.label}</span>
            <span className="sc-tab__value">{t.value}</span>
            {t.change != null && (
              <span className={`sc-tab__change ${t.change >= 0 ? 'sc-tab__change--up' : 'sc-tab__change--down'}`}>
                {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change)}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="sc-chart">
        <AreaChart data={active.cur} prevData={active.prev} color={active.color} label={active.label} />
      </div>

      <div className="sc-footer">
        <span className="sc-footer__sub">{periodLabel} · dashed line is previous period</span>
      </div>
    </div>
  );
}

/* ── Browser Chart ───────────────────────────────────────────── */

const BROWSER_COLORS = ['#4285f4', '#1C84F1', '#FF7139', '#0078D4', '#1428A0', '#94a3b8'];

const BROWSER_LOGO: Record<string, string> = {
  chrome:  '/browsers-logo/chrome.png',
  safari:  '/browsers-logo/safari.png',
  edge:    '/browsers-logo/edge.png',
  brave:   '/browsers-logo/brave.png',
  other:   '/browsers-logo/other.png',
  firefox: '/browsers-logo/other.png',
  mozilla: '/browsers-logo/other.png',
  samsung: '/browsers-logo/other.png',
};

function BrowserIcon({ name }: { name: string }) {
  const key = name.toLowerCase();
  const src = BROWSER_LOGO[key] ?? BROWSER_LOGO['other']!;
  return <img src={src} alt={name} width={22} height={22} style={{ borderRadius: '50%', objectFit: 'contain', display: 'block', flexShrink: 0 }} />;
}

function BrowserChart({
  current, previous,
}: {
  current:  { browser: string; count: number }[];
  previous: { browser: string; count: number }[];
}) {
  const total   = current.reduce((s, b) => s + b.count, 0) || 1;
  const prevMap = new Map(previous.map(b => [b.browser, b.count]));

  const R = 66; const CX = 90; const CY = 90;
  const CIRC = 2 * Math.PI * R;

  let cumLen = 0;
  const segments = current.slice(0, 5).map((b, i) => {
    const pct = b.count / total;
    const len = Math.max(0, pct * CIRC - 3);
    const seg = { ...b, color: BROWSER_COLORS[i % BROWSER_COLORS.length]!, len, offset: cumLen };
    cumLen += pct * CIRC;
    return seg;
  });

  return (
    <div className="a-card bc-card">
      <div className="bc-head">
        <span className="bc-title">Session by Browser</span>
        <button className="bc-more" title="Options">···</button>
      </div>

      <div className="bc-donut-wrap">
        <svg viewBox="0 0 180 180" className="bc-svg">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth="18" />
          {segments.map((seg, i) => (
            <circle key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={seg.color} strokeWidth="18"
              strokeDasharray={`${seg.len} ${CIRC - seg.len}`}
              strokeDashoffset={-seg.offset}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          ))}
        </svg>
      </div>

      <div className="bc-list">
        {current.slice(0, 4).map((b, i) => {
          const pct    = ((b.count / total) * 100).toFixed(1);
          const prev   = prevMap.get(b.browser) ?? 0;
          const change = prev > 0 ? ((b.count - prev) / prev * 100) : null;
          return (
            <div key={b.browser} className="bc-row">
              <div className="bc-name-col">
                <BrowserIcon name={b.browser} />
                <span className="bc-name">{b.browser}</span>
              </div>
              <div className="bc-pct-col">
                <span className="bc-dot" style={{ background: BROWSER_COLORS[i % BROWSER_COLORS.length] }} />
                <span className="bc-pct">{pct}%</span>
              </div>
              {change != null && (
                <span className={`bc-change ${change >= 0 ? 'bc-change--up' : 'bc-change--down'}`}>
                  {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────────── */

function BarChart({
  data, color = '#6366f1', label = 'Count', gradient = false, simplifyAxis = false, noYAxis = false,
}: {
  data:          DayCount[];
  color?:        string;
  label?:        string;
  gradient?:     boolean;
  simplifyAxis?: boolean;
  noYAxis?:      boolean;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState<TooltipState | null>(null);

  const W = 800; const H = 200;
  const PAD = { top: 12, right: noYAxis ? 12 : 16, bottom: 28, left: noYAxis ? 12 : 44 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const max     = Math.max(...data.map(d => d.count), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;

  const n     = data.length || 1;
  const slotW = cW / n;
  const gap   = Math.max(1, Math.round(slotW * 0.25));
  const barW  = Math.max(2, slotW - gap);

  const bars = data.map((d, i) => {
    const x  = PAD.left + i * slotW + gap / 2;
    const bH = Math.max(d.count > 0 ? 4 : 0, (d.count / niceMax) * cH);
    const y  = PAD.top + cH - bH;
    return { ...d, x, y, bH, cx: x + barW / 2 };
  });

  const xAxisLabels = simplifyAxis && n >= 2
    ? [
        { cx: bars[0]!.cx,                  label: fmtDate(bars[0]!.date).toUpperCase() },
        { cx: bars[Math.floor(n / 2)]!.cx,  label: fmtDate(bars[Math.floor(n / 2)]!.date).toUpperCase() },
        { cx: bars[n - 1]!.cx,              label: 'TODAY' },
      ]
    : bars
        .map((b, i) => ({ cx: b.cx, label: fmtDate(b.date), i }))
        .filter((_b, i) => {
          const showEvery = n <= 7 ? 1 : n <= 30 ? 5 : 10;
          return i % showEvery === 0;
        });

  const gridLines = noYAxis ? 1 : 6;

  const findIdx = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return -1;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    return Math.max(0, Math.min(n - 1, Math.floor((svgX - PAD.left) / slotW)));
  }, [n, slotW]);

  const showTip = useCallback((clientX: number, _clientY: number) => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container || data.length === 0) return;
    const idx = findIdx(clientX);
    const b   = bars[idx];
    if (!b) return;
    const svgRect = svg.getBoundingClientRect();
    const ctnRect = container.getBoundingClientRect();
    const pxX = ((b.cx / W) * svgRect.width) + (svgRect.left - ctnRect.left);
    const pxY = ((b.y / H) * svgRect.height) + (svgRect.top - ctnRect.top);
    const flip = pxX > ctnRect.width * 0.65;
    setTip({ index: idx, pxLeft: pxX, pxTop: pxY, flip });
  }, [data, bars, findIdx]);

  const onPointerMove  = useCallback((e: React.PointerEvent<SVGSVGElement>) => showTip(e.clientX, e.clientY), [showTip]);
  const onPointerLeave = useCallback(() => setTip(null), []);
  const onPointerDown  = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'mouse') showTip(e.clientX, e.clientY);
  }, [showTip]);

  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--adm-muted)', fontSize: 13 }}>
      No data for this period
    </div>
  );

  const tipD = tip != null ? data[tip.index] : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible', cursor: 'crosshair' }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <defs>
          {gradient && bars.map((_b, i) => (
            <linearGradient key={i} id={`bg-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={tip?.index === i ? 1 : 0.85} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {Array.from({ length: gridLines }, (_, i) => {
          const frac = i / (gridLines - 1);
          const y    = PAD.top + frac * cH;
          const val  = Math.round(niceMax * (1 - frac));
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === gridLines - 1 ? '0' : '4 3'} />
              {!noYAxis && (
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {fmtNum(val)}
                </text>
              )}
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={barW} height={b.bH} rx="3" ry="3"
            fill={gradient ? `url(#bg-${i})` : (tip?.index === i ? color : `${color}55`)}
          />
        ))}

        {/* X-axis labels */}
        {xAxisLabels.map((xl, i) => (
          <text key={i} x={xl.cx} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {xl.label}
          </text>
        ))}
      </svg>

      {tip != null && tipD && (
        <div className="an-tip" style={{
          position:  'absolute',
          top:       Math.max(4, tip.pxTop - 48),
          ...(tip.flip
            ? { right: `calc(100% - ${tip.pxLeft}px + 12px)` }
            : { left: tip.pxLeft + 12 }),
        }}>
          <div className="an-tip__date">{fmtDate(tipD.date)}</div>
          <div className="an-tip__row">
            <span className="an-tip__dot" style={{ background: color }} />
            <span className="an-tip__label">{label}:</span>
            <strong className="an-tip__val">{tipD.count.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Device Chart ────────────────────────────────────────────── */

const DEVICES = [
  { key: 'mobile',  label: 'Mobile',  color: '#6366f1' },
  { key: 'desktop', label: 'Desktop', color: '#10b981' },
  { key: 'tablet',  label: 'Tablet',  color: '#38bdf8' },
] as const;

function DeviceChart({ data, days, periodLabel }: { data: DeviceRow[]; days: number; periodLabel: string }) {
  const [tip, setTip] = useState<{ x: number; y: number; dateLabel: string; vals: Record<string, number> } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build per-device day arrays
  const series = DEVICES.map(d => {
    const map = new Map<string, number>();
    data.filter(r => r.device_type === d.key).forEach(r => map.set(r.date, r.count));
    return fillDays(
      Array.from(map.entries()).map(([date, count]) => ({ date, count })),
      days,
    );
  });

  const totals = DEVICES.map((_d, i) =>
    series[i]!.reduce((s, r) => s + r.count, 0)
  );

  const allCounts = series.flatMap(s => s.map(r => r.count));
  const maxVal = Math.max(...allCounts, 1);
  const W = 500; const H = 180; const PAD_L = 8; const PAD_R = 40; const PAD_T = 10; const PAD_B = 24;
  const cW = W - PAD_L - PAD_R;
  const cH = H - PAD_T - PAD_B;
  const n = series[0]!.length;

  const xPos = (i: number) => PAD_L + (i / Math.max(n - 1, 1)) * cW;
  const yPos = (v: number) => PAD_T + (1 - v / maxVal) * cH;

  const linePath = (pts: DayCount[]) =>
    pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.count).toFixed(1)}`).join(' ');

  // Y-axis ticks (4 steps)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(r * maxVal));

  // X-axis labels (first, middle, last)
  const xLabels = n < 2 ? [] : [0, Math.floor((n - 1) / 2), n - 1].map(i => ({
    i, label: fmtDate(series[0]![i]!.date),
  }));

  const handlePointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width * W;
    const idx = Math.max(0, Math.min(n - 1, Math.round((relX - PAD_L) / cW * (n - 1))));
    const vals: Record<string, number> = {};
    DEVICES.forEach((d, di) => { vals[d.key] = series[di]![idx]!.count; });
    setTip({ x: e.clientX, y: e.clientY, dateLabel: fmtDate(series[0]![idx]!.date), vals });
  }, [series, n, cW]);

  return (
    <div className="a-card dvc-card">
      <div className="dvc-head">
        <div className="dvc-title">Active Users by Device</div>
        <div className="dvc-sub">{periodLabel}</div>
      </div>

      <div className="dvc-legend">
        {DEVICES.map((d, i) => (
          <div key={d.key} className="dvc-legend-item">
            <span className="dvc-dot" style={{ background: d.color }} />
            <span className="dvc-legend-label">{d.label}</span>
            <span className="dvc-legend-val">{totals[i]!.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="dvc-chart-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="dvc-svg"
          onPointerMove={handlePointer}
          onPointerLeave={() => setTip(null)}
        >
          {/* Y grid lines */}
          {yTicks.map(v => (
            <line key={v} x1={PAD_L} x2={W - PAD_R} y1={yPos(v)} y2={yPos(v)}
              stroke="#e2e8f0" strokeWidth="1" />
          ))}

          {/* Lines */}
          {DEVICES.map((d, i) => (
            <path key={d.key} d={linePath(series[i]!)} fill="none"
              stroke={d.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {/* Y-axis labels */}
          {yTicks.map(v => (
            <text key={v} x={W - PAD_R + 4} y={yPos(v) + 4}
              fontSize="9" fill="#94a3b8" textAnchor="start">
              {v >= 1000 ? Math.round(v / 1000) + 'k' : v}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map(({ i, label }) => (
            <text key={i} x={xPos(i)} y={H - 4}
              fontSize="9" fill="#94a3b8" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {label}
            </text>
          ))}
        </svg>
      </div>

      {tip && (
        <div className="hm-tooltip" style={{
          left:      tip.x > window.innerWidth - 180 ? 'auto' : tip.x + 14,
          right:     tip.x > window.innerWidth - 180 ? window.innerWidth - tip.x + 14 : 'auto',
          top: tip.y + 14,
        }}>
          <strong>{tip.dateLabel}</strong>
          {DEVICES.map(d => (
            <span key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              {d.label}: {tip.vals[d.key]!.toLocaleString()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Activity Heatmap ────────────────────────────────────────── */

const HM_COLORS = ['#eef2ff', '#c7d2fe', '#818cf8', '#4f46e5', '#3730a3'];

function ActivityHeatmap({ data, periodLabel }: { data: HeatCell[]; periodLabel: string }) {
  const [tip, setTip] = useState<{ dayIdx: number; hour: number; count: number; x: number; y: number } | null>(null);

  // Shift UTC hours → browser local time (e.g. +8 for Manila)
  const tzOffset = Math.round(-new Date().getTimezoneOffset() / 60);

  // Day order: Mon(1)…Sat(6), Sun(0) — SQLite %w: 0=Sun
  const DAY_ORDER  = [1, 2, 3, 4, 5, 6, 0];
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Build 7×24 grid [dayIdx][hour]
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  data.forEach(d => {
    const shifted = d.hour + tzOffset;
    const localHour = ((shifted % 24) + 24) % 24;
    let localDay = d.day;
    if (shifted >= 24)  localDay = (d.day + 1) % 7;
    else if (shifted < 0) localDay = (d.day + 6) % 7;
    const dayIdx = DAY_ORDER.indexOf(localDay);
    if (dayIdx !== -1) grid[dayIdx][localHour] += d.count;
  });

  const max = Math.max(...grid.flat(), 1);

  const getColor = (count: number) => {
    if (count === 0) return HM_COLORS[0];
    const ratio = count / max;
    if (ratio < 0.25) return HM_COLORS[1];
    if (ratio < 0.50) return HM_COLORS[2];
    if (ratio < 0.75) return HM_COLORS[3];
    return HM_COLORS[4];
  };

  const fmtHour = (h: number) => {
    if (h === 0)   return '12 AM';
    if (h < 12)    return `${h} AM`;
    if (h === 12)  return '12 PM';
    return `${h - 12} PM`;
  };

  const q = [Math.ceil(max * 0.25), Math.ceil(max * 0.5), Math.ceil(max * 0.75), max];

  return (
    <div className="a-card hm-card">
      <div className="hm-head">
        <div>
          <div className="hm-title">Users at a Time</div>
          <div className="hm-sub">{periodLabel} · local time</div>
        </div>
      </div>

      <div className="hm-wrap">
        {/* Heatmap grid */}
        <div className="hm-grid">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="hm-row">
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <div
                  key={dayIdx}
                  className="hm-cell"
                  style={{ background: getColor(grid[dayIdx][hour]) }}
                  onMouseEnter={e => setTip({ dayIdx, hour, count: grid[dayIdx][hour], x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTip(null)}
                />
              ))}
              <span className="hm-time">{hour % 2 === 0 ? fmtHour(hour) : ''}</span>
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="hm-days">
          {DAY_LABELS.map(d => <span key={d} className="hm-day">{d}</span>)}
          <span className="hm-day-spacer" />
        </div>
      </div>

      {/* Legend */}
      <div className="hm-legend">
        {HM_COLORS.slice(1).map((color, i) => (
          <div key={i} className="hm-legend-item">
            <span className="hm-legend-dot" style={{ background: color }} />
            <span>{i === 0 ? `1–${q[0]}` : `${q[i - 1] + 1}–${q[i]}`}</span>
          </div>
        ))}
      </div>

      {tip && (
        <div className="hm-tooltip" style={{
          left:  tip.x > window.innerWidth - 160 ? 'auto' : tip.x + 14,
          right: tip.x > window.innerWidth - 160 ? window.innerWidth - tip.x + 14 : 'auto',
          top: tip.y + 14,
        }}>
          <strong>{DAY_LABELS[tip.dayIdx]}, {fmtHour(tip.hour)}</strong>
          <span>{tip.count.toLocaleString()} views</span>
        </div>
      )}
    </div>
  );
}

/* ── Top Pages Table ─────────────────────────────────────────── */

const TP_PAGE_SIZE = 7;

function TopPagesTable({
  pages, periodLabel,
}: {
  pages: { path: string; count: number }[];
  periodLabel: string;
}) {
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [sortCol, setSortCol] = useState<'path' | 'count'>('count');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = pages
    .filter(p => !search || p.path.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'count') return mul * (a.count - b.count);
      return mul * a.path.localeCompare(b.path);
    });

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / TP_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * TP_PAGE_SIZE, safePage * TP_PAGE_SIZE);
  const start      = total === 0 ? 0 : (safePage - 1) * TP_PAGE_SIZE + 1;
  const end        = Math.min(safePage * TP_PAGE_SIZE, total);

  const toggleSort = (col: 'path' | 'count') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: 'path' | 'count' }) => (
    <svg className={`tp-sort-icon${sortCol === col ? ' active' : ''}`} width="10" height="10" viewBox="0 0 10 14" fill="currentColor">
      <path d="M5 0L9 5H1L5 0Z" opacity={sortCol === col && sortDir === 'asc' ? 1 : 0.35} />
      <path d="M5 14L1 9H9L5 14Z" opacity={sortCol === col && sortDir === 'desc' ? 1 : 0.35} />
    </svg>
  );

  return (
    <div className="a-card tp-card">
      <div className="tp-head">
        <h3 className="tp-title">What are my top pages?<span className="tp-period">{periodLabel}</span></h3>
        <div className="tp-search-wrap">
          <input
            className="tp-search"
            type="search"
            placeholder="Search…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <svg className="tp-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th className="tp-th tp-th--path" onClick={() => toggleSort('path')}>
                Page Path <SortIcon col="path" />
              </th>
              <th className="tp-th tp-th--num" onClick={() => toggleSort('count')}>
                Page Views <SortIcon col="count" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={2} className="tp-empty">No pages match your search.</td></tr>
            ) : rows.map(p => (
              <tr key={p.path} className="tp-row">
                <td className="tp-path">
                  <a href={p.path || '/'} target="_blank" rel="noopener noreferrer">
                    {p.path || '/'}
                  </a>
                </td>
                <td className="tp-views">{p.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tp-footer">
        <span className="tp-count">{start} to {end} of {total}</span>
        <div className="tp-pager">
          <button className="tp-pager-btn" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <button className="tp-pager-btn tp-pager-btn--primary" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
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

const CHART_COLOR = '#d6613d';

export default function AdminAnalyticsPage() {
  const [days, setDays]       = useState(30);
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

  const pvByDay     = data ? fillDays(data.pageViews.byDay, days, 0) : [];
  const pvChange    = data ? calcChange(data.pageViews.period, data.pageViews.prevPeriod) : null;
  const avgDay      = data && days > 0 ? Math.round(data.pageViews.period / days) : 0;
  const periodLabel = PERIODS.find(p => p.days === days)?.label ?? `Last ${days} days`;

  return (
    <AdminLayout pageTitle="Analytics">

      {error && <div className="a-alert a-alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── Period selector ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
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

      {/* ── Bottom row: Inquiries card + Browser chart ── */}
      <div className="an-bottom-row">

        {/* Analytics card */}
        <div className="a-card an-inq-card">
          {/* Header */}
          <div className="an-inq-head">
            <div>
              <div className="an-inq-title">Portfolio Analytics</div>
              <div className="an-inq-subtitle">Views over the last {days} days · time-series trends</div>
            </div>
            {pvChange != null && (
              <span className={`an-inq-badge ${pvChange >= 0 ? 'an-inq-badge--up' : 'an-inq-badge--down'}`}>
                {pvChange >= 0 ? '↑' : '↓'} {Math.abs(pvChange)}%
              </span>
            )}
          </div>

          {/* Bar chart */}
          {loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="a-loading" />
            </div>
          ) : (
            <BarChart data={pvByDay} color={CHART_COLOR} label="Views" gradient noYAxis />
          )}

          {/* 4-stat footer */}
          <div className="an-inq-stats">
            <div className="an-inq-stat">
              <div className="an-inq-stat__label">Total Views</div>
              <div className="an-inq-stat__value">{data ? fmtNum(data.pageViews.period) : '—'}</div>
            </div>
            <div className="an-inq-stat">
              <div className="an-inq-stat__label">Total Inquiries</div>
              <div className="an-inq-stat__value">{data ? data.contacts.period : '—'}</div>
            </div>
            <div className="an-inq-stat">
              <div className="an-inq-stat__label">Unique Pages</div>
              <div className="an-inq-stat__value">{data ? data.pageViews.unique : '—'}</div>
            </div>
            <div className="an-inq-stat">
              <div className="an-inq-stat__label">Avg Views/Day</div>
              <div className="an-inq-stat__value">{data ? fmtNum(avgDay) : '—'}</div>
            </div>
          </div>
        </div>

        {/* Browser chart */}
        {!loading && data && (
          <BrowserChart current={data.browserStats.current} previous={data.browserStats.previous} />
        )}
      </div>

      {/* ── Sessions + Device row ── */}
      {!loading && data && (
        <div className="an-sessions-row">
          <SessionsChart data={data.sessions} days={days} periodLabel={periodLabel} />
          <DeviceChart data={data.deviceByDay} days={days} periodLabel={periodLabel} />
        </div>
      )}

      {/* ── Main body: heatmap + top pages + summary ── */}
      <div className="an-body">

        <div className="an-main">
          <div className="an-heat-pages">
            {loading ? (
              <div className="a-card" style={{ padding: '1.5rem', textAlign: 'center' }}><div className="a-loading" /></div>
            ) : (
              <ActivityHeatmap data={data?.heatmap ?? []} periodLabel={periodLabel} />
            )}
            {loading ? (
              <div className="a-card" style={{ padding: '1.5rem', textAlign: 'center' }}><div className="a-loading" /></div>
            ) : (
              <TopPagesTable pages={data?.pageViews.topPages ?? []} periodLabel={periodLabel} />
            )}
          </div>
        </div>

        {/* Right sidebar: summary only */}
        <div className="an-sidebar">
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
        </div>

      </div>

    </AdminLayout>
  );
}
