const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

module.exports = pool;
