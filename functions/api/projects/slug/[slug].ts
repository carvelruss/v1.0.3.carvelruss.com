/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../../../_helpers';

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

// GET /api/projects/slug/:slug — public
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = String(params.slug);
  if (!slug) return err('Invalid slug');
  try {
    const row = await env.DB.prepare('SELECT * FROM projects WHERE slug = ?')
      .bind(slug)
      .first<ProjectRow>();
    if (!row) return err('Not found', 404);
    return json({ ...row, tech: JSON.parse(row.tech) as string[] });
  } catch {
    return err('Failed to fetch project', 500);
  }
};
