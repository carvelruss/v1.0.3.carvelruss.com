/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

// PATCH  /api/testimonials/:id — admin: set status (pending|approved|rejected)
// DELETE /api/testimonials/:id — admin: permanently remove
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!await isAdmin(request, env)) return err('Unauthorized', 401);

  const id = Number(params.id);
  if (!id) return err('Invalid ID');

  const body = await request.json<{ status?: string }>();
  const { status } = body;
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return err('status must be pending, approved, or rejected');
  }

  const result = await env.DB.prepare(
    `UPDATE testimonials SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(status, id).run();

  if (!result.meta.changes) return err('Testimonial not found', 404);
  return json({ success: true, status });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!await isAdmin(request, env)) return err('Unauthorized', 401);

  const id = Number(params.id);
  if (!id) return err('Invalid ID');

  const result = await env.DB.prepare(`DELETE FROM testimonials WHERE id = ?`).bind(id).run();
  if (!result.meta.changes) return err('Testimonial not found', 404);
  return json({ success: true });
};
