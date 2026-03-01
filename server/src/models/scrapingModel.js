const pool = require('../config/db');

async function findAllSources() {
  const { rows } = await pool.query('SELECT * FROM scraping_sources ORDER BY tier, name');
  return rows;
}

async function findSourceById(id) {
  const { rows } = await pool.query('SELECT * FROM scraping_sources WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createSource(data) {
  const { rows } = await pool.query(
    `INSERT INTO scraping_sources (name, url, tier, frequency, field_mapping, category_mapping, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.name, data.url, data.tier, data.frequency, data.field_mapping, data.category_mapping, data.active ?? true]
  );
  return rows[0];
}

async function updateSource(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE scraping_sources SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

async function deleteSource(id) {
  await pool.query('DELETE FROM scraping_sources WHERE id = $1', [id]);
}

async function findLogs({ source_id, limit = 50 } = {}) {
  let query = 'SELECT * FROM scraping_logs';
  const params = [];
  if (source_id) {
    query += ' WHERE source_id = $1';
    params.push(source_id);
  }
  query += ' ORDER BY started_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);
  const { rows } = await pool.query(query, params);
  return rows;
}

async function createLog(data) {
  const { rows } = await pool.query(
    `INSERT INTO scraping_logs (source_id, status, events_found, events_created, events_duplicated, errors, started_at, finished_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.source_id, data.status, data.events_found, data.events_created, data.events_duplicated, data.errors, data.started_at, data.finished_at]
  );
  return rows[0];
}

module.exports = { findAllSources, findSourceById, createSource, updateSource, deleteSource, findLogs, createLog };
