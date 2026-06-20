/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface SettingRow {
  id: number;
  setting_key: string;
  setting_value: string | null;
  updated_at: string;
}

// GET /api/settings — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM site_settings ORDER BY setting_key ASC',
    ).all<SettingRow>();
    return json(results ?? []);
  } catch {
    return err('Failed to fetch settings', 500);
  }
};

// PUT /api/settings — update multiple settings at once (admin only)
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  try {
    const body = await request.json<Record<string, string>>();

    const updates = Object.entries(body).filter(
      ([key]) => typeof key === 'string' && key.length > 0,
    );

    if (updates.length === 0) return err('No settings provided');

    // Use batch for efficiency
    const stmts = updates.map(([key, value]) =>
      env.DB.prepare(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`,
      ).bind(key, value ?? null),
    );

    await env.DB.batch(stmts);
    return json({ success: true, updated: updates.length });
  } catch {
    return err('Failed to update settings', 500);
  }
};
