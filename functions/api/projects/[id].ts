/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../../_helpers';

interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt: string | null;
  content: string;
  tech: string;
  role: string;
  project_type: string | null;
  client_name: string | null;
  timeline: string | null;
  tools: string | null;
  logo_url: string | null;
  cover_url: string | null;
  live_url: string | null;
  case_study_url: string | null;
  github_url: string | null;
  sort_order: number;
  status: string;
  featured: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function parseRow(row: ProjectRow) {
  return {
    ...row,
    tech: (() => { try { return JSON.parse(row.tech) as string[]; } catch { return []; } })(),
    status: (row.status ?? 'published') as 'draft' | 'published',
    featured: row.featured ?? 0,
  };
}

// GET /api/projects/:id — public
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (isNaN(id)) return err('Invalid id');
  try {
    const row = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id).first<ProjectRow>();
    if (!row) return err('Not found', 404);
    return json(parseRow(row));
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
    const body = await request.json<Partial<{
      title: string; slug: string; description: string; excerpt: string | null;
      content: string; tech: string[]; role: string; project_type: string | null;
      client_name: string | null; timeline: string | null; tools: string | null;
      logo_url: string | null; cover_url: string | null; live_url: string | null;
      case_study_url: string | null; github_url: string | null;
      sort_order: number; status: string; featured: number;
      seo_title: string | null; seo_description: string | null;
    }>>();

    const existing = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id).first<ProjectRow>();
    if (!existing) return err('Not found', 404);

    const wasPublished = existing.status === 'published';
    const willPublish  = (body.status ?? existing.status) === 'published';

    await env.DB.prepare(
      `UPDATE projects SET
         title=?, slug=?, description=?, excerpt=?, content=?, tech=?, role=?,
         project_type=?, client_name=?, timeline=?, tools=?,
         logo_url=?, cover_url=?, live_url=?, case_study_url=?, github_url=?,
         sort_order=?, status=?, featured=?, seo_title=?, seo_description=?,
         published_at = CASE WHEN ? = 'published' AND ? != 'published'
                             THEN CURRENT_TIMESTAMP ELSE published_at END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id=?`,
    ).bind(
      body.title?.trim()       ?? existing.title,
      body.slug?.trim()        ?? existing.slug,
      body.description?.trim() ?? existing.description,
      body.excerpt !== undefined ? (body.excerpt?.trim() ?? null) : existing.excerpt,
      body.content ?? existing.content,
      JSON.stringify(body.tech ?? ((() => { try { return JSON.parse(existing.tech); } catch { return []; } })())),
      body.role?.trim() ?? existing.role,
      body.project_type !== undefined ? body.project_type : existing.project_type,
      body.client_name  !== undefined ? body.client_name  : existing.client_name,
      body.timeline     !== undefined ? body.timeline      : existing.timeline,
      body.tools        !== undefined ? body.tools         : existing.tools,
      body.logo_url     !== undefined ? body.logo_url      : existing.logo_url,
      body.cover_url    !== undefined ? body.cover_url     : existing.cover_url,
      body.live_url     !== undefined ? body.live_url      : existing.live_url,
      body.case_study_url !== undefined ? body.case_study_url : existing.case_study_url,
      body.github_url   !== undefined ? body.github_url    : existing.github_url,
      body.sort_order   ?? existing.sort_order,
      body.status       ?? existing.status,
      body.featured     !== undefined ? body.featured       : existing.featured,
      body.seo_title    !== undefined ? body.seo_title      : existing.seo_title,
      body.seo_description !== undefined ? body.seo_description : existing.seo_description,
      willPublish ? 'published' : 'draft',
      wasPublished ? 'published' : 'draft',
      id,
    ).run();

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
