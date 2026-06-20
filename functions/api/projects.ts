/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

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

// GET /api/projects — public (published only) or admin (all)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const adminMode = await isAdmin(request, env);
    const url       = new URL(request.url);
    const featured  = url.searchParams.get('featured') === '1';

    let query = 'SELECT * FROM projects';
    const parts: string[] = [];
    const binds: unknown[] = [];

    if (!adminMode) {
      parts.push("status = 'published'");
    }
    if (featured) {
      parts.push('featured = 1');
    }
    if (parts.length) query += ' WHERE ' + parts.join(' AND ');
    query += ' ORDER BY sort_order ASC, created_at DESC';

    const { results } = binds.length
      ? await env.DB.prepare(query).bind(...binds).all<ProjectRow>()
      : await env.DB.prepare(query).all<ProjectRow>();

    return json((results ?? []).map(parseRow));
  } catch {
    return err('Failed to fetch projects', 500);
  }
};

// POST /api/projects — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const body = await request.json<{
      title: string;
      slug?: string;
      description: string;
      excerpt?: string | null;
      content?: string;
      tech?: string[];
      role?: string;
      project_type?: string | null;
      client_name?: string | null;
      timeline?: string | null;
      tools?: string | null;
      logo_url?: string | null;
      cover_url?: string | null;
      live_url?: string | null;
      case_study_url?: string | null;
      github_url?: string | null;
      sort_order?: number;
      status?: string;
      featured?: number;
      seo_title?: string | null;
      seo_description?: string | null;
    }>();

    if (!body.title?.trim() || !body.description?.trim()) {
      return err('Title and description are required');
    }

    const slug = body.slug?.trim() || body.title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    const result = await env.DB.prepare(
      `INSERT INTO projects
         (title, slug, description, excerpt, content, tech, role, project_type, client_name,
          timeline, tools, logo_url, cover_url, live_url, case_study_url, github_url,
          sort_order, status, featured, seo_title, seo_description, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
         CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
    ).bind(
      body.title.trim(),
      slug,
      body.description.trim(),
      body.excerpt?.trim() ?? null,
      body.content ?? '',
      JSON.stringify(body.tech ?? []),
      body.role?.trim() ?? '',
      body.project_type ?? null,
      body.client_name?.trim() ?? null,
      body.timeline?.trim() ?? null,
      body.tools?.trim() ?? null,
      body.logo_url ?? null,
      body.cover_url ?? null,
      body.live_url ?? null,
      body.case_study_url ?? null,
      body.github_url ?? null,
      body.sort_order ?? 0,
      body.status ?? 'draft',
      body.featured ?? 0,
      body.seo_title?.trim() ?? null,
      body.seo_description?.trim() ?? null,
      body.status ?? 'draft',
    ).run();

    return json({ id: result.meta.last_row_id }, 201);
  } catch {
    return err('Failed to create project', 500);
  }
};
