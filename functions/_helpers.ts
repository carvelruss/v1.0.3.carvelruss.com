/// <reference types="@cloudflare/workers-types" />

import { verifyJWT } from './_jwt';

export interface StorageBucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<{
    body: ReadableStream;
    writeHttpMetadata(headers: Headers): void;
  } | null>;
}

export interface Env {
  DB: D1Database;
  STORAGE: StorageBucket;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY?: string;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return (await verifyJWT(auth.slice(7), env.JWT_SECRET)) !== null;
}
