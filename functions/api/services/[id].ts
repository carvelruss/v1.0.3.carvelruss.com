/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

// PUT /api/services/:id — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (!id) return err('Invalid ID');

  try {
    const body = await request.json<Record<string, unknown>>();
    const fields: string[] = [];
    const values: unknown[] = [];

    const str  = (v: unknown) => (typeof v === 'string' ? v.trim() || null : null);
    const safe = (v: unknown) => (v !== undefined ? v : null);

    if (body.title        !== undefined) { fields.push('title = ?');         values.push(String(body.title).trim()); }
    if (body.slug         !== undefined) { fields.push('slug = ?');          values.push(String(body.slug).trim()); }
    if (body.description  !== undefined) { fields.push('description = ?');   values.push(String(body.description).trim()); }
    if (body.excerpt      !== undefined) { fields.push('excerpt = ?');       values.push(str(body.excerpt)); }
    if (body.content      !== undefined) { fields.push('content = ?');       values.push(safe(body.content)); }
    if (body.icon_url     !== undefined) { fields.push('icon_url = ?');      values.push(str(body.icon_url)); }
    if (body.cover_url    !== undefined) { fields.push('cover_url = ?');     values.push(str(body.cover_url)); }
    if (body.features     !== undefined) { fields.push('features = ?');      values.push(JSON.stringify(body.features ?? [])); }
    if (body.tags         !== undefined) { fields.push('tags = ?');          values.push(JSON.stringify(body.tags ?? [])); }
    if (body.cta_label    !== undefined) { fields.push('cta_label = ?');     values.push(str(body.cta_label)); }
    if (body.cta_url      !== undefined) { fields.push('cta_url = ?');       values.push(str(body.cta_url)); }
    if (body.sort_order   !== undefined) { fields.push('sort_order = ?');    values.push(Number(body.sort_order)); }
    if (body.seo_title    !== undefined) { fields.push('seo_title = ?');     values.push(str(body.seo_title)); }
    if (body.seo_description !== undefined) { fields.push('seo_description = ?'); values.push(str(body.seo_description)); }

    if (body.status !== undefined) {
      fields.push('status = ?');
      values.push(body.status);
      fields.push("published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END");
      values.push(body.status);
    }

    if (!fields.length) return err('No fields to update');

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await env.DB.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values).run();

    return json({ success: true });
  } catch {
    return err('Failed to update service', 500);
  }
};

// DELETE /api/services/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (!id) return err('Invalid ID');
  try {
    await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch {
    return err('Failed to delete service', 500);
  }
};
