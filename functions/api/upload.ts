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
  const key = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return json({ url: `/api/assets/${key}` }, 201);
};
