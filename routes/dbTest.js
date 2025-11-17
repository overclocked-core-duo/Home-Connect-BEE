// routes/dbTest.js
// Test routes for PostgreSQL and MariaDB connections
const express = require('express');
const router = express.Router();
const pg = require('../db/postgres');
const maria = require('../db/mariadb');

/**
 * Test PostgreSQL connection with simple time query
 * GET /db/postgres/time
 */
router.get('/postgres/time', async (req, res, next) => {
  try {
    const result = await pg.query('SELECT NOW() AS now');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

/**
 * Test MariaDB connection with simple time query
 * GET /db/mariadb/time
 */
router.get('/mariadb/time', async (req, res, next) => {
  try {
    const rows = await maria.query('SELECT NOW() as now');
    const now = rows && rows[0] ? rows[0].now || Object.values(rows[0])[0] : null;
    res.json({ ok: true, time: now });
  } catch (err) {
    next(err);
  }
});

/**
 * Get demo users from PostgreSQL
 * GET /db/postgres/users
 * Note: Requires demo_users table (see db/sql/postgres_demo.sql)
 */
router.get('/postgres/users', async (req, res, next) => {
  try {
    const result = await pg.query('SELECT id, name, email FROM demo_users LIMIT 50');
    res.json({ ok: true, users: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * Get demo users from MariaDB
 * GET /db/mariadb/users
 * Note: Requires demo_users table (see db/sql/mariadb_demo.sql)
 */
router.get('/mariadb/users', async (req, res, next) => {
  try {
    const rows = await maria.query('SELECT id, name, email FROM demo_users LIMIT 50');
    res.json({ ok: true, users: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a demo user in PostgreSQL
 * POST /db/postgres/users
 * Body: { name, email }
 */
router.post('/postgres/users', async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email required' });
    }
    
    const result = await pg.query(
      'INSERT INTO demo_users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    
    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a demo user in MariaDB
 * POST /db/mariadb/users
 * Body: { name, email }
 */
router.post('/mariadb/users', async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email required' });
    }
    
    const result = await maria.query(
      'INSERT INTO demo_users (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    // Get the inserted user
    const rows = await maria.query(
      'SELECT id, name, email FROM demo_users WHERE id = ?',
      [result.insertId]
    );
    
    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
