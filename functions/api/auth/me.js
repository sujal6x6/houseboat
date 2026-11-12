import { json, currentUser } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const user = await currentUser(request, env);
  return user ? json({ ok: true, user }) : json({ ok: false }, 401);
}
