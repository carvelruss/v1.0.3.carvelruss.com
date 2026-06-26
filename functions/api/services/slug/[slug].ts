/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../../_helpers';

// GET /api/services/slug/:slug — public (published) or admin (any)
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    const slug      = String(params.slug);
    const adminMode = await isAdmin(request, env);

    const query = adminMode
      ? 'SELECT * FROM services WHERE slug = ?'
      : "SELECT * FROM services WHERE slug = ? AND status = 'published'";

    const row = await env.DB.prepare(query).bind(slug).first<Record<string, unknown>>();
    if (!row) return err('Not found', 404);

    return json({
      ...row,
      features: (() => { try { return JSON.parse(row.features as string) as string[]; } catch { return []; } })(),
      tags:     (() => { try { return JSON.parse(row.tags     as string) as string[]; } catch { return []; } })(),
    });
  } catch {
    return err('Failed to fetch service', 500);
  }
};
