const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ email, password_hash, name, role = 'admin' }) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
    [email, password_hash, name, role]
  );
  return rows[0];
}

module.exports = { findByEmail, findById, create };
