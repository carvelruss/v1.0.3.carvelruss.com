/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface ServiceRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt: string | null;
  content: string;
  icon_url: string | null;
  cover_url: string | null;
  features: string;
  tags: string;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function parseRow(row: ServiceRow) {
  return {
    ...row,
    features: (() => { try { return JSON.parse(row.features) as string[]; } catch { return []; } })(),
    tags:     (() => { try { return JSON.parse(row.tags)     as string[]; } catch { return []; } })(),
    status: (row.status ?? 'draft') as 'draft' | 'published',
  };
}

// GET /api/services — public (published only) or admin (all)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const adminMode = await isAdmin(request, env);
    let query = 'SELECT * FROM services';
    if (!adminMode) query += " WHERE status = 'published'";
    query += ' ORDER BY sort_order ASC, created_at DESC';
    const { results } = await env.DB.prepare(query).all<ServiceRow>();
    return json((results ?? []).map(parseRow));
  } catch {
    return err('Failed to fetch services', 500);
  }
};

// POST /api/services — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  try {
    const body = await request.json<{
      title: string;
      slug?: string;
      description?: string;
      excerpt?: string | null;
      content?: string;
      icon_url?: string | null;
      cover_url?: string | null;
      features?: string[];
      tags?: string[];
      cta_label?: string | null;
      cta_url?: string | null;
      sort_order?: number;
      status?: string;
      seo_title?: string | null;
      seo_description?: string | null;
    }>();

    if (!body.title?.trim()) return err('Title is required');

    const slug = body.slug?.trim() || body.title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    const result = await env.DB.prepare(
      `INSERT INTO services
         (title, slug, description, excerpt, content, icon_url, cover_url,
          features, tags, cta_label, cta_url, sort_order, status,
          seo_title, seo_description, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?,
         CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
    ).bind(
      body.title.trim(),
      slug,
      body.description?.trim() ?? '',
      body.excerpt?.trim() ?? null,
      body.content ?? '',
      body.icon_url ?? null,
      body.cover_url ?? null,
      JSON.stringify(body.features ?? []),
      JSON.stringify(body.tags ?? []),
      body.cta_label?.trim() ?? null,
      body.cta_url?.trim() ?? null,
      body.sort_order ?? 0,
      body.status ?? 'draft',
      body.seo_title?.trim() ?? null,
      body.seo_description?.trim() ?? null,
      body.status ?? 'draft',
    ).run();

    return json({ id: result.meta.last_row_id }, 201);
  } catch {
    return err('Failed to create service', 500);
  }
};
