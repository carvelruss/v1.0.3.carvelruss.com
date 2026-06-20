/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

// PATCH /api/inquiries/:id — update status (admin)
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    const body = await request.json<{ status?: InquiryStatus; is_read?: number }>();

    // Support both new status field and legacy is_read
    let newStatus: InquiryStatus | undefined = body.status;
    if (!newStatus && body.is_read !== undefined) {
      newStatus = body.is_read ? 'read' : 'unread';
    }

    if (!newStatus || !['unread','read','replied','archived'].includes(newStatus)) {
      return err('Valid status (unread, read, replied, archived) is required');
    }

    const isRead = newStatus === 'read' || newStatus === 'replied' ? 1 : 0;

    await env.DB.prepare(
      'UPDATE inquiries SET status = ?, is_read = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ).bind(newStatus, isRead, id).run();

    return json({ success: true, status: newStatus });
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
