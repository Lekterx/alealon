const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM communes ORDER BY micro_region, name');
  return rows;
}

async function findByMicroRegion(microRegion) {
  const { rows } = await pool.query('SELECT * FROM communes WHERE micro_region = $1 ORDER BY name', [microRegion]);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM communes WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findByMicroRegion, findById };
