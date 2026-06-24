/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../_helpers';

// POST /api/analytics/event — public, no auth
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{
      event_type?: string;
      label?:      string;
      path?:       string;
      session_id?: string;
      value?:      number;
    }>();

    const eventType = String(body.event_type ?? '').slice(0, 64).trim();
    if (!eventType) return err('event_type required');

    const label     = body.label      ? String(body.label).slice(0, 128)     : null;
    const path      = body.path       ? String(body.path).slice(0, 255)      : null;
    const sessionId = body.session_id ? String(body.session_id).slice(0, 64) : null;
    const value     = typeof body.value === 'number' ? Math.floor(body.value) : null;

    await env.DB.prepare(
      'INSERT INTO cta_events (event_type, label, path, session_id, value) VALUES (?, ?, ?, ?, ?)',
    ).bind(eventType, label, path, sessionId, value).run();

    return json({ ok: true });
  } catch {
    return err('Failed to record', 500);
  }
};
