/// <reference types="@cloudflare/workers-types" />

import { signJWT } from '../_jwt';
import { type Env, json, err } from '../_helpers';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { password } = await request.json<{ password?: string }>();
    if (!password) return err('Password required');

    if (password !== env.ADMIN_PASSWORD) return err('Invalid password', 401);

    const token = await signJWT({ role: 'admin' }, env.JWT_SECRET, 86400);
    return json({ token });
  } catch {
    return err('Invalid request body');
  }
};
