/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface DayCount    { date: string; count: number }
interface HeatCell    { day: number; hour: number; count: number }
interface DeviceRow   { date: string; device_type: string; count: number }
interface SessionAgg  { sessions: number; bounce_rate: number; avg_duration: number }
interface BrowserRow  { browser: string; count: number }

// Subquery helpers (string templates — passed to DB.prepare)
const sessionSubquery = (window: string) =>
  `SELECT session_id, COUNT(*) as page_count,
     CAST(strftime('%s', MAX(created_at)) - strftime('%s', MIN(created_at)) AS INTEGER) as dur,
     MIN(created_at) as min_created
   FROM page_views
   WHERE session_id IS NOT NULL AND created_at >= datetime('now', '${window}')
   GROUP BY session_id`;

const sessionSubqueryPrev = (since: string, prev: string) =>
  `SELECT session_id, COUNT(*) as page_count,
     CAST(strftime('%s', MAX(created_at)) - strftime('%s', MIN(created_at)) AS INTEGER) as dur,
     MIN(created_at) as min_created
   FROM page_views
   WHERE session_id IS NOT NULL AND created_at >= datetime('now', '${prev}') AND created_at < datetime('now', '${since}')
   GROUP BY session_id`;

// GET /api/analytics?days=30 — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  const url   = new URL(request.url);
  const days  = Math.min(Math.max(Number(url.searchParams.get('days') ?? '7'), 1), 90);
  const since = `-${days} days`;
  const prev  = `-${days * 2} days`;

  try {
    const [
      pvTotal, pvPeriod, pvPrev, pvByDay, pvPrevByDay, pvTopPages, pvUnique,
      cTotal, cPeriod, cPrev, cByDay, cPrevByDay,
      heatmap, deviceByDay,
      sessAgg, sessAggPrev, sessionsByDay, sessionsPrevByDay, bounceByDay, durationByDay,
    ] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as n FROM page_views').first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at >= datetime('now', ?)").bind(since).first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at >= datetime('now', ?) AND created_at < datetime('now', ?)").bind(prev, since).first<{ n: number }>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(since).all<DayCount>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) AND created_at < datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(prev, since).all<DayCount>(),
      env.DB.prepare("SELECT path, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY path ORDER BY count DESC LIMIT 100").bind(since).all<{ path: string; count: number }>(),
      env.DB.prepare("SELECT COUNT(DISTINCT path) as n FROM page_views WHERE created_at >= datetime('now', ?)").bind(since).first<{ n: number }>(),
      env.DB.prepare('SELECT COUNT(*) as n FROM inquiries').first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM inquiries WHERE created_at >= datetime('now', ?)").bind(since).first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM inquiries WHERE created_at >= datetime('now', ?) AND created_at < datetime('now', ?)").bind(prev, since).first<{ n: number }>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM inquiries WHERE created_at >= datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(since).all<DayCount>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM inquiries WHERE created_at >= datetime('now', ?) AND created_at < datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(prev, since).all<DayCount>(),
      env.DB.prepare("SELECT CAST(strftime('%w', created_at) AS INTEGER) as day, CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY day, hour").bind(since).all<HeatCell>(),
      env.DB.prepare("SELECT date(created_at) as date, device_type, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY date(created_at), device_type ORDER BY date ASC").bind(since).all<DeviceRow>(),
      // Session aggregate — current period
      env.DB.prepare(`SELECT COUNT(*) as sessions, ROUND(100.0 * SUM(CASE WHEN page_count=1 THEN 1 ELSE 0 END) / COUNT(*), 1) as bounce_rate, CAST(AVG(CASE WHEN page_count>1 THEN dur ELSE 0 END) AS INTEGER) as avg_duration FROM (${sessionSubquery(since)})`).first<SessionAgg>(),
      // Session aggregate — previous period
      env.DB.prepare(`SELECT COUNT(*) as sessions, ROUND(100.0 * SUM(CASE WHEN page_count=1 THEN 1 ELSE 0 END) / COUNT(*), 1) as bounce_rate, CAST(AVG(CASE WHEN page_count>1 THEN dur ELSE 0 END) AS INTEGER) as avg_duration FROM (${sessionSubqueryPrev(since, prev)})`).first<SessionAgg>(),
      // Sessions by day (current)
      env.DB.prepare(`SELECT date(min_created) as date, COUNT(*) as count FROM (${sessionSubquery(since)}) GROUP BY date ORDER BY date ASC`).all<DayCount>(),
      // Sessions by day (previous)
      env.DB.prepare(`SELECT date(min_created) as date, COUNT(*) as count FROM (${sessionSubqueryPrev(since, prev)}) GROUP BY date ORDER BY date ASC`).all<DayCount>(),
      // Bounce rate by day (as %)
      env.DB.prepare(`SELECT date(min_created) as date, ROUND(100.0 * SUM(CASE WHEN page_count=1 THEN 1 ELSE 0 END) / COUNT(*), 1) as count FROM (${sessionSubquery(since)}) GROUP BY date ORDER BY date ASC`).all<DayCount>(),
      // Avg session duration by day (in seconds)
      env.DB.prepare(`SELECT date(min_created) as date, CAST(AVG(CASE WHEN page_count>1 THEN dur ELSE 0 END) AS INTEGER) as count FROM (${sessionSubquery(since)}) GROUP BY date ORDER BY date ASC`).all<DayCount>(),
    ]);

    const [browserCur, browserPrev] = await Promise.all([
      env.DB.prepare("SELECT browser, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY browser ORDER BY count DESC LIMIT 6").bind(since).all<BrowserRow>(),
      env.DB.prepare("SELECT browser, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) AND created_at < datetime('now', ?) GROUP BY browser ORDER BY count DESC LIMIT 6").bind(prev, since).all<BrowserRow>(),
    ]);

    return json({
      days,
      pageViews: {
        total:      pvTotal?.n          ?? 0,
        period:     pvPeriod?.n         ?? 0,
        prevPeriod: pvPrev?.n           ?? 0,
        unique:     pvUnique?.n         ?? 0,
        byDay:      pvByDay.results     ?? [],
        prevByDay:  pvPrevByDay.results ?? [],
        topPages:   pvTopPages.results  ?? [],
      },
      contacts: {
        total:      cTotal?.n          ?? 0,
        period:     cPeriod?.n         ?? 0,
        prevPeriod: cPrev?.n           ?? 0,
        byDay:      cByDay.results     ?? [],
        prevByDay:  cPrevByDay.results ?? [],
      },
      heatmap:     heatmap.results     ?? [],
      deviceByDay: deviceByDay.results ?? [],
      sessions: {
        period:           sessAgg?.sessions        ?? 0,
        prevPeriod:       sessAggPrev?.sessions     ?? 0,
        bounceRate:       sessAgg?.bounce_rate      ?? 0,
        prevBounceRate:   sessAggPrev?.bounce_rate  ?? 0,
        avgDuration:      sessAgg?.avg_duration     ?? 0,
        prevAvgDuration:  sessAggPrev?.avg_duration ?? 0,
        byDay:            sessionsByDay.results     ?? [],
        prevByDay:        sessionsPrevByDay.results ?? [],
        bounceByDay:      bounceByDay.results       ?? [],
        durationByDay:    durationByDay.results     ?? [],
      },
      browserStats: {
        current:  browserCur.results  ?? [],
        previous: browserPrev.results ?? [],
      },
    });
  } catch {
    return err('Failed to fetch analytics', 500);
  }
};
