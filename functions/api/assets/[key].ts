/// <reference types="@cloudflare/workers-types" />

import { type Env, err } from '../../_helpers';

// GET /api/assets/:key — public, serves R2 objects
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = params.key as string;
  if (!key) return err('Missing key', 400);

  const obj = await env.STORAGE.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(obj.body, { headers });
};
