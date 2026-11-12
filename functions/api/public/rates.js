import { json, ensureDb } from '../_utils.js';

export async function onRequestGet({ env }) {
  try {
    const rows = await ensureDb(env).prepare('SELECT code,name,description,price,eb,cnb FROM rates ORDER BY CASE code WHEN \'EP\' THEN 1 WHEN \'CP\' THEN 2 WHEN \'MAPI\' THEN 3 WHEN \'API\' THEN 4 ELSE 5 END').all();
    return json({ rates: rows.results || [] });
  } catch (error) {
    return json({ error: 'Rates database is not configured', detail: error.message }, 503);
  }
}
