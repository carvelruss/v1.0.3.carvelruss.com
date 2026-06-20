/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

// GET /api/inquiries?status=unread — admin only
// Returns all inquiries ordered by newest first, with optional status filter
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const url    = new URL(request.url);
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM inquiries';
    const bindings: string[] = [];
    if (status && ['unread','read','replied','archived'].includes(status)) {
      query += ' WHERE status = ?';
      bindings.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const { results } = bindings.length
      ? await env.DB.prepare(query).bind(...bindings).all()
      : await env.DB.prepare(query).all();

    // Backfill: rows from before migration have no status — map is_read to status
    const rows = (results ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      status: r.status ?? (r.is_read ? 'read' : 'unread'),
    }));

    return json(rows);
  } catch {
    return err('Failed to fetch inquiries', 500);
  }
};
