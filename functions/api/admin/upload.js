import { json, requireAdmin } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const user = await requireAdmin(request, env);
  if (user instanceof Response) return user;
  if (!env.MEDIA) return json({ error: 'Gallery storage is not configured yet' }, 503);
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'Choose an image to upload' }, 400);
  if (!String(file.type || '').startsWith('image/')) return json({ error: 'Only image files are supported' }, 415);
  if (Number(file.size || 0) > 8 * 1024 * 1024) return json({ error: 'Images must be 8 MB or smaller' }, 413);
  const original = String(file.name || 'image').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  const key = `gallery/${crypto.randomUUID()}-${original}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'application/octet-stream', cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ ok: true, name: original, src: `/media/${key}` }, 201);
}
