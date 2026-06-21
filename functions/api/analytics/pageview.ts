/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../_helpers';

// POST /api/analytics/pageview — public, no auth
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{ path?: string }>();
    const path = String(body.path ?? '').slice(0, 255).trim();
    if (!path) return err('path required');

    const country = request.headers.get('CF-IPCountry') ?? null;

    await env.DB.prepare(
      'INSERT INTO page_views (path, country) VALUES (?, ?)',
    ).bind(path, country).run();

    return json({ ok: true });
  } catch {
    return err('Failed to record', 500);
  }
};
