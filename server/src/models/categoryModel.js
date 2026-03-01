const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM categories WHERE active = true ORDER BY sort_order, name');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, slug, color, icon, description }) {
  const { rows } = await pool.query(
    'INSERT INTO categories (name, slug, color, icon, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, slug, color, icon, description]
  );
  return rows[0];
}

async function update(id, { name, slug, color, icon, description, active, sort_order }) {
  const { rows } = await pool.query(
    `UPDATE categories SET name = COALESCE($2, name), slug = COALESCE($3, slug),
     color = COALESCE($4, color), icon = COALESCE($5, icon), description = COALESCE($6, description),
     active = COALESCE($7, active), sort_order = COALESCE($8, sort_order), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, name, slug, color, icon, description, active, sort_order]
  );
  return rows[0] || null;
}

async function remove(id) {
  await pool.query('UPDATE categories SET active = false WHERE id = $1', [id]);
}

module.exports = { findAll, findById, create, update, remove };
