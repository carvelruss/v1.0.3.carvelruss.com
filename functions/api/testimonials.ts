/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

// GET  /api/testimonials — public: approved only; admin (JWT): all with status
// POST /api/testimonials — public submit (no auth required)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await isAdmin(request, env);
  const rows = admin
    ? await env.DB.prepare(
        `SELECT * FROM testimonials ORDER BY created_at DESC`
      ).all()
    : await env.DB.prepare(
        `SELECT id, full_name, company_name, role, website_url, message, rating, created_at
         FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC`
      ).all();
  return json(rows.results ?? []);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{
      full_name?: string;
      company_name?: string;
      role?: string;
      website_url?: string;
      message?: string;
      rating?: number;
    }>();

    const { full_name, company_name, role, website_url, message, rating } = body;

    if (!full_name?.trim())    return err('Full name is required');
    if (!company_name?.trim()) return err('Company name is required');
    if (!role?.trim())         return err('Role is required');
    if (!website_url?.trim())  return err('Website URL is required');
    if (!message?.trim())      return err('Testimonial message is required');
    const stars = Number(rating);
    if (!stars || stars < 1 || stars > 5) return err('Please select a rating between 1 and 5');

    const normalised = website_url.trim().startsWith('http')
      ? website_url.trim()
      : `https://${website_url.trim()}`;
    try { new URL(normalised); } catch { return err('Please enter a valid website URL'); }

    await env.DB.prepare(
      `INSERT INTO testimonials (full_name, company_name, role, website_url, message, rating, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(full_name.trim(), company_name.trim(), role.trim(), normalised, message.trim(), stars)
      .run();

    return json({ success: true });
  } catch {
    return err('Failed to submit review. Please try again.', 500);
  }
};
