/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface PostRow {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  og_image: string | null;
  keywords: string | null;
  author: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// GET /api/posts — public (published only) or admin (all)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const adminMode = url.searchParams.get('admin') === 'true';

    if (adminMode && !(await isAdmin(request, env))) return err('Unauthorized', 401);

    const sql = adminMode
      ? 'SELECT * FROM posts ORDER BY created_at DESC'
      : `SELECT id, title, slug, excerpt, meta_description, og_image, author, published_at, created_at
         FROM posts WHERE status='published' ORDER BY published_at DESC`;

    const { results } = await env.DB.prepare(sql).all<PostRow>();
    return json(results ?? []);
  } catch {
    return err('Failed to fetch posts', 500);
  }
};

// POST /api/posts — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const body = await request.json<{
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      meta_description?: string;
      og_image?: string;
      keywords?: string;
      author?: string;
      status?: 'draft' | 'published';
      published_at?: string | null;
    }>();

    if (!body.title?.trim() || !body.slug?.trim()) return err('Title and slug are required');

    const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    await env.DB.prepare(
      `INSERT INTO posts (title, slug, content, excerpt, meta_description, og_image, keywords, author, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        body.title.trim(),
        slug,
        body.content ?? '',
        body.excerpt ?? null,
        body.meta_description ?? null,
        body.og_image ?? null,
        body.keywords ?? null,
        body.author?.trim() ?? 'Your Name',
        body.status ?? 'draft',
        body.published_at ?? (body.status === 'published' ? new Date().toISOString() : null),
      )
      .run();

    return json({ slug }, 201);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) return err('Slug already exists', 409);
    return err('Failed to create post', 500);
  }
};
