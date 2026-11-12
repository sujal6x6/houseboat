import { json, readJson, ensureDb, requireAdmin, id } from '../_utils.js';

const orderRates = "CASE code WHEN 'EP' THEN 1 WHEN 'CP' THEN 2 WHEN 'MAPI' THEN 3 WHEN 'API' THEN 4 ELSE 5 END";

export async function onRequestGet({ request, env }) {
  const user = await requireAdmin(request, env);
  if (user instanceof Response) return user;
  try {
    const db = ensureDb(env);
    const resource = new URL(request.url).searchParams.get('resource') || 'all';
    if (resource === 'bookings') return json({ bookings: (await db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all()).results || [] });
    if (resource === 'rates') return json({ rates: (await db.prepare(`SELECT * FROM rates ORDER BY ${orderRates}`).all()).results || [] });
    if (resource === 'rooms') return json({ rooms: (await db.prepare('SELECT * FROM rooms ORDER BY name').all()).results || [] });
    if (resource === 'gallery') return json({ gallery: (await db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all()).results || [] });
    if (resource === 'settings') {
      const rows = (await db.prepare('SELECT key,value FROM settings').all()).results || [];
      return json({ settings: Object.fromEntries(rows.map(row => [row.key, row.value])) });
    }
    const [bookings, rates, rooms, gallery, settings] = await Promise.all([db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all(), db.prepare(`SELECT * FROM rates ORDER BY ${orderRates}`).all(), db.prepare('SELECT * FROM rooms ORDER BY name').all(), db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all(), db.prepare('SELECT key,value FROM settings').all()]);
    return json({ bookings: bookings.results || [], rates: rates.results || [], rooms: rooms.results || [], gallery: gallery.results || [], settings: Object.fromEntries((settings.results || []).map(row => [row.key, row.value])) });
  } catch (error) { return json({ error: 'Admin database is not configured', detail: error.message }, 503); }
}

export async function onRequestPut({ request, env }) {
  const user = await requireAdmin(request, env);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  try {
    const db = ensureDb(env);
    if (body?.resource === 'rates') {
      await db.batch((body.data || []).map(rate => db.prepare('INSERT INTO rates(code,name,description,price,eb,cnb) VALUES(?,?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET name=excluded.name,description=excluded.description,price=excluded.price,eb=excluded.eb,cnb=excluded.cnb').bind(rate.code, rate.name, rate.description, Number(rate.price || 0), Number(rate.eb || 0), String(rate.cnb || ''))));
    } else if (body?.resource === 'rooms') {
      await db.batch((body.data || []).map(room => db.prepare('INSERT INTO rooms(id,name,type,image,available) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,type=excluded.type,image=excluded.image,available=excluded.available').bind(room.id || id('room'), room.name, room.type, room.image, room.available ? 1 : 0)));
    } else if (body?.resource === 'gallery') {
      await db.batch((body.data || []).map(item => db.prepare('INSERT INTO gallery(id,name,src,created_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,src=excluded.src').bind(item.id || id('gallery'), item.name, item.src, item.created_at || new Date().toISOString())));
    } else if (body?.resource === 'settings') {
      await db.batch(Object.entries(body.data || {}).map(([key, value]) => db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, String(value))));
    } else return json({ error: 'Unknown resource' }, 400);
    return json({ ok: true });
  } catch (error) { return json({ error: 'Could not save data', detail: error.message }, 500); }
}

export async function onRequestPost({ request, env }) {
  const user = await requireAdmin(request, env);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  if (body?.resource !== 'booking' || !body.record) return json({ error: 'Invalid booking payload' }, 400);
  try {
    const db = ensureDb(env); const item = body.record; const bookingId = item.id || id('NP');
    await db.prepare('INSERT INTO bookings(id,name,email,phone,plan,room,guests,checkin,checkout,amount,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(bookingId, item.name, item.email || '', item.phone || '', item.plan, item.room || '', Number(item.guests || 1), item.checkin, item.checkout, Number(item.amount || 0), item.status || 'confirmed', item.created || new Date().toISOString()).run();
    return json({ ok: true, id: bookingId }, 201);
  } catch (error) { return json({ error: 'Could not create booking', detail: error.message }, 500); }
}

export async function onRequestPatch({ request, env }) {
  const user = await requireAdmin(request, env);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  if (!body?.id || !['confirmed', 'pending', 'cancelled'].includes(body.status)) return json({ error: 'Invalid booking status' }, 400);
  try { await ensureDb(env).prepare('UPDATE bookings SET status = ? WHERE id = ?').bind(body.status, body.id).run(); return json({ ok: true }); }
  catch (error) { return json({ error: 'Could not update booking', detail: error.message }, 500); }
}
