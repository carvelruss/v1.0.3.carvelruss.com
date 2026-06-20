/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface MediaRow {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

// GET /api/media — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 200',
    ).all<MediaRow>();
    return json(results ?? []);
  } catch {
    return err('Failed to fetch media', 500);
  }
};

// DELETE /api/media/:id is handled in media/[id].ts
