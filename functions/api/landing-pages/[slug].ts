/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

interface LandingPageRow {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sections: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// GET /api/landing-pages/:slug
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    const slug = params.slug as string;
    const url = new URL(request.url);
    const adminMode = url.searchParams.get('admin') === 'true';

    if (adminMode && !(await isAdmin(request, env))) return err('Unauthorized', 401);

    const sql = adminMode
      ? 'SELECT * FROM landing_pages WHERE slug = ?'
      : "SELECT * FROM landing_pages WHERE slug = ? AND status = 'published'";

    const row = await env.DB.prepare(sql).bind(slug).first<LandingPageRow>();
    if (!row) return err('Not found', 404);

    let parsed: unknown;
    try {
      parsed = JSON.parse(row.sections || '{}');
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    } catch {
      parsed = {};
    }
    return json({ ...row, sections: parsed });
  } catch {
    return err('Failed to fetch landing page', 500);
  }
};

// PUT /api/landing-pages/:slug — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const slug = params.slug as string;
    const body = await request.json<{
      title?: string;
      slug?: string;
      status?: 'draft' | 'published';
      sections?: unknown;
      seo_title?: string | null;
      seo_description?: string | null;
      og_image?: string | null;
      published_at?: string | null;
    }>();

    const existing = await env.DB.prepare('SELECT * FROM landing_pages WHERE slug = ?')
      .bind(slug)
      .first<LandingPageRow>();
    if (!existing) return err('Not found', 404);

    const newSlug = body.slug
      ? body.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : existing.slug;

    const newStatus = body.status ?? existing.status;
    let publishedAt = body.published_at !== undefined ? body.published_at : existing.published_at;
    if (newStatus === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    const sectionsJson =
      body.sections !== undefined
        ? JSON.stringify(body.sections)
        : existing.sections;

    await env.DB.prepare(
      `UPDATE landing_pages
       SET title = ?, slug = ?, status = ?, sections = ?, seo_title = ?, seo_description = ?,
           og_image = ?, published_at = ?, updated_at = datetime('now')
       WHERE slug = ?`,
    )
      .bind(
        body.title?.trim() ?? existing.title,
        newSlug,
        newStatus,
        sectionsJson,
        body.seo_title !== undefined ? body.seo_title : existing.seo_title,
        body.seo_description !== undefined ? body.seo_description : existing.seo_description,
        body.og_image !== undefined ? body.og_image : existing.og_image,
        publishedAt,
        slug,
      )
      .run();

    return json({ slug: newSlug });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) return err('Slug already exists', 409);
    return err('Failed to update landing page', 500);
  }
};

// DELETE /api/landing-pages/:slug — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const slug = params.slug as string;
    const { meta } = await env.DB.prepare('DELETE FROM landing_pages WHERE slug = ?')
      .bind(slug)
      .run();

    if (!meta.changes) return err('Not found', 404);
    return json({ success: true });
  } catch {
    return err('Failed to delete landing page', 500);
  }
};
