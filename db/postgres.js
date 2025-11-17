// db/postgres.js
// PostgreSQL connection pool using 'pg' package
// Schema file: db/sql/postgres_demo.sql
const { Pool } = require('pg');
const logger = require('../middlewares/logger');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // or use separate env vars:
  // user: process.env.PG_USER,
  // host: process.env.PG_HOST,
  // database: process.env.PG_DATABASE,
  // password: process.env.PG_PASSWORD,
  // port: process.env.PG_PORT,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[Postgres] Unexpected client error', err.message);
});

/**
 * Execute a parameterized query
 * @param {String} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[Postgres] Query executed in ${duration}ms, rows: ${res.rowCount}`);
    return res;
  } catch (err) {
    console.error('[Postgres] Query error:', err.message);
    throw err;
  }
}

module.exports = {
  pool,
  query,
};
