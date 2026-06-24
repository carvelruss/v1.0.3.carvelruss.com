/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../_helpers';

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

// POST /api/analytics/pageview — public, no auth
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{ path?: string }>();
    const path = String(body.path ?? '').slice(0, 255).trim();
    if (!path) return err('path required');

    const country    = request.headers.get('CF-IPCountry') ?? null;
    const ua         = request.headers.get('User-Agent') ?? '';
    const deviceType = detectDevice(ua);

    await env.DB.prepare(
      'INSERT INTO page_views (path, country, device_type) VALUES (?, ?, ?)',
    ).bind(path, country, deviceType).run();

    return json({ ok: true });
  } catch {
    return err('Failed to record', 500);
  }
};
