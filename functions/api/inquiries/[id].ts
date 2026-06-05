/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

// PATCH /api/inquiries/:id — mark as read (admin)
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    await env.DB.prepare('UPDATE inquiries SET is_read = 1 WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch {
    return err('Failed to update inquiry', 500);
  }
};

// DELETE /api/inquiries/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch {
    return err('Failed to delete inquiry', 500);
  }
};
