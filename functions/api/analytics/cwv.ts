/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../_helpers';

// POST /api/analytics/cwv — public, no auth (same pattern as /api/analytics/event)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{
      metric?:     string;
      value?:      number;
      rating?:     string;
      path?:       string;
      session_id?: string;
    }>();

    const { metric, value, rating, path, session_id } = body;
    if (!metric || value === undefined || value === null || !rating) {
      return err('metric, value, and rating are required');
    }

    const VALID_METRICS  = new Set(['LCP', 'CLS', 'INP', 'FCP', 'TTFB']);
    const VALID_RATINGS  = new Set(['good', 'needs-improvement', 'poor']);
    if (!VALID_METRICS.has(metric)) return err('Invalid metric');
    if (!VALID_RATINGS.has(rating)) return err('Invalid rating');
    if (typeof value !== 'number' || !isFinite(value)) return err('Invalid value');

    await env.DB.prepare(
      'INSERT INTO cwv_events (metric, value, rating, path, session_id) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(
        metric,
        Math.round(value * 1000) / 1000,
        rating,
        path ? String(path).slice(0, 255) : null,
        session_id ? String(session_id).slice(0, 64) : null,
      )
      .run();

    return json({ ok: true });
  } catch {
    return err('Failed to store metric', 500);
  }
};
