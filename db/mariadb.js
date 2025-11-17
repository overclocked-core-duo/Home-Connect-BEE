// db/mariadb.js
// MariaDB connection pool using 'mysql2/promise' package
// Schema file: db/sql/mariadb_demo.sql
const mysql = require('mysql2/promise');
const logger = require('../middlewares/logger');

require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.MARIADB_URL, // optional: use uri or individual fields
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Execute a parameterized query
 * @param {String} sql - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query rows
 */
async function query(sql, params) {
  const start = Date.now();
  try {
    const [rows, fields] = await pool.execute(sql, params);
    const duration = Date.now() - start;
    console.log(`[MariaDB] Query executed in ${duration}ms, rows: ${Array.isArray(rows) ? rows.length : 0}`);
    return rows;
  } catch (err) {
    console.error('[MariaDB] Query error:', err.message);
    throw err;
  }
}

module.exports = {
  pool,
  query,
};
