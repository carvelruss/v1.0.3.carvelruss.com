/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

// GET /api/inquiries — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM inquiries ORDER BY created_at DESC',
    ).all();
    return json(results ?? []);
  } catch {
    return err('Failed to fetch inquiries', 500);
  }
};
