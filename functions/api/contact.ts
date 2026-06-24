/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err } from '../_helpers';

interface TurnstileResult {
  success: boolean;
  'error-codes': string[];
}

// POST /api/contact — public (Turnstile-protected)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      project_type?: string;
      budget_range?: string;
      timeline?: string;
      turnstileToken?: string;
    }>();

    const { name, email, subject, message, project_type, budget_range, timeline, turnstileToken } = body;

    // Basic field validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return err('Name, email, and message are required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return err('Invalid email address');
    }
    if (!turnstileToken) {
      return err('Spam check token missing. Please complete the verification.');
    }

    // Verify Turnstile token server-side
    const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: turnstileToken,
        remoteip: request.headers.get('CF-Connecting-IP'),
      }),
    });
    const tsData = (await tsRes.json()) as TurnstileResult;
    if (!tsData.success) {
      return err('Spam verification failed. Please try again.', 403);
    }

    // Store in D1 with all extended fields
    const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For');
    await env.DB.prepare(
      `INSERT INTO inquiries (name, email, subject, message, project_type, budget_range, timeline, ip_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread')`,
    )
      .bind(
        name.trim(),
        email.trim(),
        subject?.trim() ?? null,
        message.trim(),
        project_type?.trim() ?? null,
        budget_range?.trim() ?? null,
        timeline?.trim() ?? null,
        ip,
      )
      .run();

    // Send email notification — awaited so it completes before the Worker exits
    if (env.RESEND_API_KEY) {
      const rows = [
        `<p><strong>From:</strong> ${name.trim()} &lt;${email.trim()}&gt;</p>`,
        subject?.trim() ? `<p><strong>Subject:</strong> ${subject.trim()}</p>` : '',
        project_type?.trim() ? `<p><strong>Project type:</strong> ${project_type.trim()}</p>` : '',
        budget_range?.trim() ? `<p><strong>Budget:</strong> ${budget_range.trim()}</p>` : '',
        timeline?.trim() ? `<p><strong>Timeline:</strong> ${timeline.trim()}</p>` : '',
        `<hr><p>${message.trim().replace(/\n/g, '<br>')}</p>`,
      ].filter(Boolean).join('\n');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio <inquiries@carvelruss.com>',
          to: ['business.carvelruss@gmail.com', 'hello@carvelruss.com'],
          reply_to: email.trim(),
          subject: `New inquiry from ${name.trim()}`,
          html: rows,
        }),
      }).catch(() => {});
    }

    return json({ success: true, message: 'Your message has been received. I will get back to you soon!' });
  } catch {
    return err('Failed to submit message. Please try again later.', 500);
  }
};
