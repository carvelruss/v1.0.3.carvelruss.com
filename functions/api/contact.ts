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
      message?: string;
      turnstileToken?: string;
    }>();

    const { name, email, message, turnstileToken } = body;

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

    // Store in D1
    const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For');
    await env.DB.prepare(
      'INSERT INTO inquiries (name, email, message, ip_address) VALUES (?, ?, ?, ?)',
    )
      .bind(name.trim(), email.trim(), message.trim(), ip)
      .run();

    return json({ success: true, message: 'Your message has been received. I will get back to you soon!' });
  } catch {
    return err('Failed to submit message. Please try again later.', 500);
  }
};
