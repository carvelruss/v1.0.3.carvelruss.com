/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

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

// GET /api/landing-pages — public (published) or admin (all)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const adminMode = url.searchParams.get('admin') === 'true';

    if (adminMode && !(await isAdmin(request, env))) return err('Unauthorized', 401);

    const sql = adminMode
      ? 'SELECT * FROM landing_pages ORDER BY created_at DESC'
      : `SELECT id, title, slug, seo_title, seo_description, og_image, published_at, created_at
         FROM landing_pages WHERE status='published' ORDER BY published_at DESC`;

    const { results } = await env.DB.prepare(sql).all<LandingPageRow>();
    return json(results ?? []);
  } catch {
    return err('Failed to fetch landing pages', 500);
  }
};

// POST /api/landing-pages — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const body = await request.json<{
      title: string;
      slug: string;
      status?: 'draft' | 'published';
      sections?: string;
      seo_title?: string | null;
      seo_description?: string | null;
      og_image?: string | null;
      published_at?: string | null;
    }>();

    if (!body.title?.trim() || !body.slug?.trim()) return err('Title and slug are required');

    const slug = body.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const sectionsJson = body.sections ?? '{}';
    const status = body.status ?? 'draft';

    await env.DB.prepare(
      `INSERT INTO landing_pages (title, slug, status, sections, seo_title, seo_description, og_image, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        body.title.trim(),
        slug,
        status,
        sectionsJson,
        body.seo_title ?? null,
        body.seo_description ?? null,
        body.og_image ?? null,
        body.published_at ?? (status === 'published' ? new Date().toISOString() : null),
      )
      .run();

    return json({ slug }, 201);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) return err('Slug already exists', 409);
    return err('Failed to create landing page', 500);
  }
};
