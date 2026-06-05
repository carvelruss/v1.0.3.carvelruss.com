/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  tech: string;
  role: string;
  live_url: string | null;
  case_study_url: string | null;
  github_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// GET /api/projects/:id — public
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');
  try {
    const row = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id)
      .first<ProjectRow>();
    if (!row) return err('Not found', 404);
    return json({ ...row, tech: JSON.parse(row.tech) as string[] });
  } catch {
    return err('Failed to fetch project', 500);
  }
};

// PUT /api/projects/:id — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    const body = await request.json<{
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      tech?: string[];
      role?: string;
      live_url?: string | null;
      case_study_url?: string | null;
      github_url?: string | null;
      sort_order?: number;
    }>();

    const existing = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id)
      .first<ProjectRow>();
    if (!existing) return err('Not found', 404);

    await env.DB.prepare(
      `UPDATE projects SET title=?, slug=?, description=?, content=?, tech=?, role=?, live_url=?, case_study_url=?, github_url=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    )
      .bind(
        body.title?.trim() ?? existing.title,
        body.slug?.trim() ?? existing.slug,
        body.description?.trim() ?? existing.description,
        body.content ?? existing.content,
        JSON.stringify(body.tech ?? JSON.parse(existing.tech)),
        body.role?.trim() ?? existing.role,
        body.live_url !== undefined ? body.live_url : existing.live_url,
        body.case_study_url !== undefined ? body.case_study_url : existing.case_study_url,
        body.github_url !== undefined ? body.github_url : existing.github_url,
        body.sort_order ?? existing.sort_order,
        id,
      )
      .run();

    return json({ success: true });
  } catch {
    return err('Failed to update project', 500);
  }
};

// DELETE /api/projects/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');

  try {
    await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch {
    return err('Failed to delete project', 500);
  }
};
