/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

interface PostRow {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  og_image: string | null;
  keywords: string | null;
  category: string | null;
  author: string;
  author_avatar: string | null;
  author_bio: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// GET /api/posts/:slug — public (published only); admin can view drafts
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = params.slug as string;
  try {
    const admin = await isAdmin(request, env);
    const sql = admin
      ? 'SELECT * FROM posts WHERE slug = ?'
      : "SELECT * FROM posts WHERE slug = ? AND status = 'published'";
    const row = await env.DB.prepare(sql).bind(slug).first<PostRow>();
    if (!row) return err('Not found', 404);
    return json(row);
  } catch {
    return err('Failed to fetch post', 500);
  }
};

// PUT /api/posts/:slug — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const slug = params.slug as string;

  try {
    const body = await request.json<{
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string | null;
      meta_description?: string | null;
      og_image?: string | null;
      keywords?: string | null;
      category?: string | null;
      author?: string;
      author_avatar?: string | null;
      author_bio?: string | null;
      status?: 'draft' | 'published';
      published_at?: string | null;
    }>();

    const existing = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')
      .bind(slug)
      .first<PostRow>();
    if (!existing) return err('Not found', 404);

    const newSlug = body.slug
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : existing.slug;

    const publishedAt =
      body.published_at !== undefined
        ? body.published_at
        : body.status === 'published' && existing.status !== 'published'
        ? new Date().toISOString()
        : existing.published_at;

    await env.DB.prepare(
      `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, meta_description=?, og_image=?, keywords=?, category=?, author=?, author_avatar=?, author_bio=?, status=?, published_at=?, updated_at=CURRENT_TIMESTAMP WHERE slug=?`,
    )
      .bind(
        body.title?.trim() ?? existing.title,
        newSlug,
        body.content ?? existing.content,
        body.excerpt !== undefined ? body.excerpt : existing.excerpt,
        body.meta_description !== undefined ? body.meta_description : existing.meta_description,
        body.og_image !== undefined ? body.og_image : existing.og_image,
        body.keywords !== undefined ? body.keywords : existing.keywords,
        body.category !== undefined ? body.category : existing.category,
        body.author?.trim() ?? existing.author,
        body.author_avatar !== undefined ? body.author_avatar : existing.author_avatar,
        body.author_bio !== undefined ? body.author_bio : existing.author_bio,
        body.status ?? existing.status,
        publishedAt,
        slug,
      )
      .run();

    return json({ slug: newSlug });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) return err('Slug already exists', 409);
    return err('Failed to update post', 500);
  }
};

// DELETE /api/posts/:slug — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const slug = params.slug as string;

  try {
    await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
    return json({ success: true });
  } catch {
    return err('Failed to delete post', 500);
  }
};
