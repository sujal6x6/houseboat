export const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders }
});

export const readJson = async request => {
  try { return await request.json(); } catch { return null; }
};

const toHex = buffer => [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const toBase64Url = value => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = value => atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));

export const sha256 = async value => toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));

const hmac = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
};

const parseCookies = request => Object.fromEntries((request.headers.get('Cookie') || '').split(';').map(item => item.trim()).filter(Boolean).map(item => {
  const [key, ...rest] = item.split('=');
  return [key, rest.join('=')];
}));

export const sessionCookie = async (username, secret) => {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = toBase64Url(`${username}|${expires}`);
  const signature = toBase64Url(String.fromCharCode(...new Uint8Array(await hmac(payload, secret))));
  return `np_session=${payload}.${signature}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Lax`;
};

export const clearSessionCookie = 'np_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';

export const currentUser = async (request, env) => {
  const secret = env.SESSION_SECRET;
  if (!secret) return null;
  const raw = parseCookies(request).np_session || '';
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  try {
    const valid = await crypto.subtle.verify('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']), new Uint8Array([...fromBase64Url(signature)].map(char => char.charCodeAt(0))), new TextEncoder().encode(payload));
    if (!valid) return null;
    const [username, expires] = fromBase64Url(payload).split('|');
    if (!username || Number(expires) < Math.floor(Date.now() / 1000)) return null;
    return { username };
  } catch { return null; }
};

export const requireAdmin = async (request, env) => {
  const user = await currentUser(request, env);
  return user ? user : json({ error: 'Authentication required' }, 401);
};

export const ensureDb = env => {
  if (!env.DB) throw new Error('D1 binding DB is missing');
  return env.DB;
};

export const id = prefix => `${prefix}-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
