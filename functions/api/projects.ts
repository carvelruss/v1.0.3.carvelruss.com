/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

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

function parseRow(row: ProjectRow) {
  return { ...row, tech: JSON.parse(row.tech) as string[] };
}

// GET /api/projects — public
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM projects ORDER BY sort_order ASC',
    ).all<ProjectRow>();
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
      slug: string;
      description: string;
      content?: string;
      tech: string[];
      role: string;
      live_url?: string | null;
      case_study_url?: string | null;
      github_url?: string | null;
      sort_order?: number;
    }>();

    if (!body.title?.trim() || !body.description?.trim()) {
      return err('Title and description are required');
    }

    const result = await env.DB.prepare(
      `INSERT INTO projects (title, slug, description, content, tech, role, live_url, case_study_url, github_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        body.title.trim(),
        body.slug?.trim() ?? '',
        body.description.trim(),
        body.content ?? '',
        JSON.stringify(body.tech ?? []),
        body.role?.trim() ?? '',
        body.live_url ?? null,
        body.case_study_url ?? null,
        body.github_url ?? null,
        body.sort_order ?? 0,
      )
      .run();

    return json({ id: result.meta.last_row_id }, 201);
  } catch {
    return err('Failed to create project', 500);
  }
};
