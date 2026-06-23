/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../../_helpers';

interface CommentRow {
  id: number;
  post_id: number;
  parent_id: number | null;
  author: string;
  body: string;
  created_at: string;
}

// GET /api/posts/:slug/comments  — returns approved comments only
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = params.slug as string;
  try {
    const post = await env.DB.prepare(
      "SELECT id FROM posts WHERE slug = ? AND status = 'published'",
    )
      .bind(slug)
      .first<{ id: number }>();
    if (!post) return err('Not found', 404);

    const { results } = await env.DB.prepare(
      `SELECT id, post_id, parent_id, author, body, created_at
         FROM post_comments
        WHERE post_id = ? AND status = 'approved'
        ORDER BY created_at ASC`,
    )
      .bind(post.id)
      .all<CommentRow>();

    return json(results ?? []);
  } catch {
    return err('Failed to fetch comments', 500);
  }
};

// POST /api/posts/:slug/comments  — submit a new comment (pending moderation)
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = params.slug as string;
  try {
    const body = await request.json<{
      author?: string;
      email?: string;
      text?: string;
      parent_id?: number | null;
      _hp?: string; // honeypot
    }>();

    // Silently accept honeypot-filled submissions so bots can't detect detection
    if (body._hp) return json({ success: true });

    const author = body.author?.trim();
    const email  = body.email?.trim();
    const text   = body.text?.trim();

    if (!author || !email || !text) return err('Missing required fields', 400);
    if (text.length > 2000)         return err('Comment too long', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email', 400);

    const post = await env.DB.prepare(
      "SELECT id FROM posts WHERE slug = ? AND status = 'published'",
    )
      .bind(slug)
      .first<{ id: number }>();
    if (!post) return err('Post not found', 404);

    const parentId = typeof body.parent_id === 'number' ? body.parent_id : null;

    await env.DB.prepare(
      'INSERT INTO post_comments (post_id, parent_id, author, email, body) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(post.id, parentId, author, email, text)
      .run();

    return json({ success: true, message: 'Your comment will appear after review.' });
  } catch {
    return err('Failed to submit comment', 500);
  }
};
