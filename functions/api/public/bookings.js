import { json, readJson, ensureDb, id } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const required = ['name', 'phone', 'checkin', 'checkout', 'plan'];
  if (!body || required.some(field => !String(body[field] || '').trim())) return json({ error: 'Name, phone, dates, and meal plan are required' }, 400);
  if (new Date(body.checkout) <= new Date(body.checkin)) return json({ error: 'Checkout must be after check-in' }, 400);
  try {
    const db = ensureDb(env);
    const rate = await db.prepare('SELECT price FROM rates WHERE code = ?').bind(String(body.plan)).first();
    if (!rate) return json({ error: 'Please choose a valid meal plan' }, 400);
    const nights = Math.max(1, Math.round((new Date(body.checkout) - new Date(body.checkin)) / 86400000));
    const bookingId = id('NP');
    await db.prepare('INSERT INTO bookings(id,name,email,phone,plan,room,guests,checkin,checkout,amount,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(bookingId, String(body.name).trim(), String(body.email || '').trim(), String(body.phone).trim(), String(body.plan), String(body.room || ''), Math.max(1, Math.min(20, Number(body.guests || 1))), String(body.checkin), String(body.checkout), Number(rate.price) * nights, 'pending', new Date().toISOString()).run();
    return json({ ok: true, id: bookingId, status: 'pending' }, 201);
  } catch (error) {
    return json({ error: 'Booking database is not configured', detail: error.message }, 503);
  }
}
