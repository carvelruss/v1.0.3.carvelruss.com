/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

interface MediaRow {
  id: number;
  file_name: string;
  file_url: string;
}

// DELETE /api/media/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    const row = await env.DB.prepare('SELECT * FROM media_assets WHERE id = ?')
      .bind(id).first<MediaRow>();
    if (!row) return err('Not found', 404);

    // Remove from R2 (key is the last segment of the file_url)
    const key = row.file_url.split('/').pop();
    if (key) {
      try {
        // R2 doesn't have a typed delete on our StorageBucket helper, but workers-types has it
        await (env.STORAGE as unknown as { delete(key: string): Promise<void> }).delete(key);
      } catch {
        // Continue even if R2 delete fails — still clean up DB record
      }
    }

    await env.DB.prepare('DELETE FROM media_assets WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch {
    return err('Failed to delete media asset', 500);
  }
};
