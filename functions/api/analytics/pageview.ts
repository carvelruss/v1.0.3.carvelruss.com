/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../_helpers';

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(ua: string): string {
  if (/SamsungBrowser/i.test(ua))        return 'Samsung';
  if (/Edg\//i.test(ua))                 return 'Edge';
  if (/OPR\/|Opera\//i.test(ua))         return 'Opera';
  if (/Firefox\/|FxiOS\//i.test(ua))     return 'Firefox';
  if (/Chrome\/|CriOS\//i.test(ua))      return 'Chrome';
  if (/Safari\//i.test(ua))              return 'Safari';
  return 'Other';
}

// POST /api/analytics/pageview — public, no auth
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{ path?: string; session_id?: string }>();
    const path      = String(body.path ?? '').slice(0, 255).trim();
    if (!path) return err('path required');

    const country    = request.headers.get('CF-IPCountry') ?? null;
    const ua         = request.headers.get('User-Agent') ?? '';
    const deviceType = detectDevice(ua);
    const browser    = detectBrowser(ua);
    const sessionId  = String(body.session_id ?? '').slice(0, 64) || null;

    await env.DB.prepare(
      'INSERT INTO page_views (path, country, device_type, browser, session_id) VALUES (?, ?, ?, ?, ?)',
    ).bind(path, country, deviceType, browser, sessionId).run();

    return json({ ok: true });
  } catch {
    return err('Failed to record', 500);
  }
};
