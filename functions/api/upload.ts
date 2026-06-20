/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// POST /api/upload — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return err('Expected multipart/form-data');
  }

  const file = formData.get('file') as File | null;
  if (!file) return err('No file provided');
  if (!ALLOWED.includes(file.type)) return err('Only JPEG, PNG, WebP, GIF, or SVG images are allowed');
  if (file.size > MAX_BYTES) return err('File too large — maximum 5 MB');

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const key = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const url = `/api/assets/${key}`;

  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  // Record in media_assets table (silently ignore if table doesn't exist yet)
  try {
    await env.DB.prepare(
      `INSERT INTO media_assets (file_name, file_url, file_type, file_size)
       VALUES (?, ?, ?, ?)`,
    ).bind(file.name, url, file.type, file.size).run();
  } catch {
    // Table may not exist if migration 003 hasn't been applied yet — non-fatal
  }

  return json({ url }, 201);
};
