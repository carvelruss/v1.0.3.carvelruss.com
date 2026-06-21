/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface DayCount { date: string; count: number }

// GET /api/analytics?days=30 — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  const url   = new URL(request.url);
  const days  = Math.min(Math.max(Number(url.searchParams.get('days') ?? '30'), 1), 90);
  const since = `-${days} days`;

  try {
    const [pvTotal, pvPeriod, pvByDay, pvTopPages, cTotal, cPeriod, cByDay] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as n FROM page_views').first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at >= datetime('now', ?)").bind(since).first<{ n: number }>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(since).all<DayCount>(),
      env.DB.prepare("SELECT path, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY path ORDER BY count DESC LIMIT 10").bind(since).all<{ path: string; count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as n FROM inquiries').first<{ n: number }>(),
      env.DB.prepare("SELECT COUNT(*) as n FROM inquiries WHERE created_at >= datetime('now', ?)").bind(since).first<{ n: number }>(),
      env.DB.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM inquiries WHERE created_at >= datetime('now', ?) GROUP BY date(created_at) ORDER BY date ASC").bind(since).all<DayCount>(),
    ]);

    return json({
      days,
      pageViews: {
        total:    pvTotal?.n            ?? 0,
        period:   pvPeriod?.n           ?? 0,
        byDay:    pvByDay.results       ?? [],
        topPages: pvTopPages.results    ?? [],
      },
      contacts: {
        total:  cTotal?.n       ?? 0,
        period: cPeriod?.n      ?? 0,
        byDay:  cByDay.results  ?? [],
      },
    });
  } catch {
    return err('Failed to fetch analytics', 500);
  }
};
