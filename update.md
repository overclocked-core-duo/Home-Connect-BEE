📌 Prompt for GitHub Copilot Agent — Add MariaDB & PostgreSQL Integrations

Goal

Add simple integrations for MariaDB (mysql2) and PostgreSQL (pg) to the existing backend. Provide connection modules, small sample queries, example endpoints to test connections, minimal migration/schema SQL files, and .env entries. Keep code CommonJS, small, and integrate with existing error handling and logger.

⸻

High-level tasks (apply directly to the project)
	1.	Add dependencies to package.json:
	•	pg
	•	mysql2
	•	dotenv (if not present)
	2.	Create db/postgres.js (connection pool + small helper).
	3.	Create db/mariadb.js (connection pool + small helper).
	4.	Add routes/dbTest.js with endpoints to test both DBs.
	5.	Wire the test route into existing server.js (import + app.use('/db', router)).
	6.	Add SQL schema files under db/sql/ for minimal demo tables.
	7.	Add .env.example entries and update .gitignore if necessary.
	8.	Update README.md with setup & test instructions.

⸻

Files & Code (copy-paste into the project)

1) package.json changes

Add dependencies (run or update package.json):

npm install pg mysql2 dotenv

(If you want the exact package.json edit, add these to "dependencies".)

⸻

2) db/postgres.js

Create file: db/postgres.js

// db/postgres.js
const { Pool } = require('pg');
const logger = require('../middlewares/logger') || console;

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
  logger.error('Unexpected Postgres client error', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info('postgres query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Postgres query error', err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
};


⸻

3) db/mariadb.js

Create file: db/mariadb.js

// db/mariadb.js
const mysql = require('mysql2/promise');
const logger = require('../middlewares/logger') || console;
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

async function query(sql, params) {
  const start = Date.now();
  try {
    const [rows, fields] = await pool.execute(sql, params);
    const duration = Date.now() - start;
    logger.info('mariadb query', { sql, duration, rows: Array.isArray(rows) ? rows.length : 0 });
    return rows;
  } catch (err) {
    logger.error('MariaDB query error', err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
};

Notes:
	•	These are simple promise-based connection pools; they are safe for basic apps.
	•	Use process.env.MARIADB_URL if you prefer a single URI.

⸻

4) routes/dbTest.js

Create file: routes/dbTest.js

// routes/dbTest.js
const express = require('express');
const router = express.Router();
const pg = require('../db/postgres');
const maria = require('../db/mariadb');

// GET /db/postgres/time
router.get('/postgres/time', async (req, res, next) => {
  try {
    const result = await pg.query('SELECT NOW() AS now');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

// GET /db/mariadb/time
router.get('/mariadb/time', async (req, res, next) => {
  try {
    // MariaDB returns rows array
    const rows = await maria.query('SELECT NOW() as now');
    // sometimes field name differs depending on server; take first field
    const now = rows && rows[0] ? rows[0].now || Object.values(rows[0])[0] : null;
    res.json({ ok: true, time: now });
  } catch (err) {
    next(err);
  }
});

// Optional: simple users demo (create table first in SQL below)
router.get('/postgres/users', async (req, res, next) => {
  try {
    const result = await pg.query('SELECT id, name, email FROM demo_users LIMIT 50');
    res.json({ ok: true, users: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/mariadb/users', async (req, res, next) => {
  try {
    const rows = await maria.query('SELECT id, name, email FROM demo_users LIMIT 50');
    res.json({ ok: true, users: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


⸻

5) Wire routes in server.js

Open server.js and add:

// near other route imports
const dbTestRouter = require('./routes/dbTest');
// after other app.use(...) lines:
app.use('/db', dbTestRouter);

Ensure server.js loads .env via require('dotenv').config() at top (if not already present).

⸻

6) SQL schema files

Create db/sql/postgres_demo.sql:

-- db/sql/postgres_demo.sql
CREATE TABLE IF NOT EXISTS demo_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- sample insert
INSERT INTO demo_users (name, email)
VALUES ('PG Demo', 'pg_demo@example.com')
ON CONFLICT DO NOTHING;

Create db/sql/mariadb_demo.sql:

-- db/sql/mariadb_demo.sql
CREATE TABLE IF NOT EXISTS demo_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO demo_users (name, email) VALUES ('Maria Demo', 'maria_demo@example.com');

Add a short script in scripts/ if you want to automatically run these SQL files (optional).

⸻

7) .env.example updates

Open or create .env.example and add:

# Postgres
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
# or separate vars:
# PG_USER=
# PG_PASSWORD=
# PG_HOST=
# PG_PORT=
# PG_DATABASE=

# MariaDB
MARIADB_URL=
MARIADB_HOST=localhost
MARIADB_USER=root
MARIADB_PASSWORD=
MARIADB_DATABASE=testdb

Also ensure .gitignore contains .env and any cert/keys:

.env
*.pem
*.key
*.crt


⸻

8) README changes (append to README.md)

Add a short section Postgres & MariaDB:

## MariaDB & PostgreSQL (local quickstart)

1. Install DB servers (local or docker).
2. Create databases:
   - Postgres: `createdb mydb` or via psql
   - MariaDB: `CREATE DATABASE testdb;`
3. Populate demo tables:
   - Postgres: `psql -d mydb -f db/sql/postgres_demo.sql`
   - MariaDB: `mysql -u root -p testdb < db/sql/mariadb_demo.sql`
4. Set environment variables (see `.env.example`)
5. Start server: `npm run dev`
6. Test endpoints:
   - `GET /db/postgres/time`
   - `GET /db/mariadb/time`
   - `GET /db/postgres/users`
   - `GET /db/mariadb/users`


⸻

Extra small improvements (optional but recommended)
	•	Add a small startup log in server.js that prints whether Postgres/MariaDB connection pools initialized (attempt a simple health query on startup — but handle failures non-fatally).
	•	Add comments in new files pointing to the SQL schema files.
	•	Keep queries parameterized if you add any input later.

Example startup check snippet:

// server.js (after pool imports)
(async function checkDbs() {
  try {
    const r = await require('./db/postgres').query('SELECT NOW()');
    console.log('Postgres connected', r.rows ? r.rows[0].now : r);
  } catch (e) {
    console.warn('Postgres check failed:', e.message);
  }

  try {
    const rows = await require('./db/mariadb').query('SELECT NOW() as now');
    console.log('MariaDB connected', rows[0] && rows[0].now);
  } catch (e) {
    console.warn('MariaDB check failed:', e.message);
  }
})();

Wrap in try/catch to avoid crashing startup when DBs are absent.

⸻

Testing & Validation

Tell Copilot Agent to:
	1.	Run npm install to ensure packages installed.
	2.	Start app: npm run dev
	3.	Verify GET /db/postgres/time and GET /db/mariadb/time respond (if DBs running).
	4.	If DBs are not present, endpoints should return an error through existing error handler (not crash app).

⸻

Commit message suggestions

When saving changes, use clear commits like:
	•	feat(db): add postgres connection pool and simple query helper
	•	feat(db): add mariadb connection pool and simple query helper
	•	feat(routes): add /db test routes for postgres & mariadb
	•	chore(db): add demo SQL schemas and README instructions

⸻

Final note to Copilot Agent
	•	Keep code minimal and idiomatic CommonJS.
	•	Reuse existing logger and errorHandler middleware.
	•	Do not refactor unrelated parts of the codebase.
	•	Add inline comments for each new file explaining purpose and where to find schema.
	•	If connecting code causes uncaught errors at startup, handle them gracefully and continue (do not crash the app).
	•	Don't generate too many summary markdown files.