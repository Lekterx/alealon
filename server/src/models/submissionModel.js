const pool = require('../config/db');

async function findAll({ status, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM submissions';
  const params = [];
  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }
  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ title, description, category_ids, date_start, date_end, address, commune_id, image_url, external_link, price, organizer, contact_email, submitter_email }) {
  const { rows } = await pool.query(
    `INSERT INTO submissions (title, description, category_ids, date_start, date_end, address, commune_id, image_url, external_link, price, organizer, contact_email, submitter_email)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [title, description, category_ids, date_start, date_end, address, commune_id, image_url, external_link, price, organizer, contact_email, submitter_email]
  );
  return rows[0];
}

async function updateStatus(id, status, rejection_reason) {
  const { rows } = await pool.query(
    'UPDATE submissions SET status = $2, rejection_reason = $3, reviewed_at = NOW() WHERE id = $1 RETURNING *',
    [id, status, rejection_reason]
  );
  return rows[0] || null;
}

async function countByStatus() {
  const { rows } = await pool.query('SELECT status, COUNT(*)::int AS count FROM submissions GROUP BY status');
  return rows;
}

module.exports = { findAll, findById, create, updateStatus, countByStatus };
