import { json, readJson, sessionCookie, sha256 } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  if (!username || !password) return json({ error: 'Username and password are required' }, 400);
  if (!env.SESSION_SECRET || !env.ADMIN_USERNAME || (!env.ADMIN_PASSWORD_SHA256 && !env.ADMIN_PASSWORD)) return json({ error: 'Admin authentication is not configured yet' }, 503);
  const passwordHash = env.ADMIN_PASSWORD_SHA256 || await sha256(env.ADMIN_PASSWORD);
  if (username !== env.ADMIN_USERNAME || (await sha256(password)) !== passwordHash) return json({ error: 'Invalid username or password' }, 401);
  return json({ ok: true, username }, 200, { 'set-cookie': await sessionCookie(username, env.SESSION_SECRET) });
}
