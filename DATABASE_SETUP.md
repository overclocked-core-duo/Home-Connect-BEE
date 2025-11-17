# PostgreSQL & MariaDB Integration Guide

This guide explains how to set up and use the PostgreSQL and MariaDB integrations in the BEE Home Connect backend.

## 📋 Prerequisites

- **PostgreSQL** 12+ or **MariaDB** 10.5+
- Node.js packages (already installed):
  - `pg` - PostgreSQL client
  - `mysql2` - MariaDB/MySQL client

## 🚀 Quick Start

### 1. Install Database Servers

#### Option A: Local Installation

**PostgreSQL (macOS):**
```bash
brew install postgresql
brew services start postgresql
```

**MariaDB (macOS):**
```bash
brew install mariadb
brew services start mariadb
```

#### Option B: Docker

**PostgreSQL:**
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homeconnect \
  -p 5432:5432 \
  postgres:15
```

**MariaDB:**
```bash
docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=homeconnect \
  -p 3306:3306 \
  mariadb:10
```

### 2. Create Databases

**PostgreSQL:**
```bash
# Using psql
psql -U postgres
CREATE DATABASE homeconnect;
\q

# Or using createdb command
createdb homeconnect
```

**MariaDB:**
```bash
# Using mysql client
mysql -u root -p
CREATE DATABASE homeconnect;
exit;
```

### 3. Run Schema Scripts

**PostgreSQL:**
```bash
psql -U postgres -d homeconnect -f db/sql/postgres_demo.sql
```

**MariaDB:**
```bash
mysql -u root -p homeconnect < db/sql/mariadb_demo.sql
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```env
# PostgreSQL
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/homeconnect

# MariaDB
MARIADB_HOST=localhost
MARIADB_USER=root
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=homeconnect
```

### 5. Start the Server

```bash
npm run dev
```

You should see:
```
[Postgres] Connected successfully: 2025-11-17T...
[MariaDB] Connected successfully: 2025-11-17T...
[Server] Running at http://localhost:8080
[Database] Test endpoints available at http://localhost:8080/db/*
```

## 🧪 Testing the Integration

### Test Connection

**PostgreSQL:**
```bash
curl http://localhost:8080/db/postgres/time
```

Response:
```json
{
  "ok": true,
  "time": "2025-11-17T13:30:45.123Z"
}
```

**MariaDB:**
```bash
curl http://localhost:8080/db/mariadb/time
```

Response:
```json
{
  "ok": true,
  "time": "2025-11-17T13:30:45.000Z"
}
```

### Get Users

**PostgreSQL:**
```bash
curl http://localhost:8080/db/postgres/users
```

**MariaDB:**
```bash
curl http://localhost:8080/db/mariadb/users
```

Response:
```json
{
  "ok": true,
  "users": [
    {
      "id": 1,
      "name": "PG Demo User",
      "email": "pg_demo@example.com"
    }
  ]
}
```

### Create User

**PostgreSQL:**
```bash
curl -X POST http://localhost:8080/db/postgres/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

**MariaDB:**
```bash
curl -X POST http://localhost:8080/db/mariadb/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

## 📡 Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/db/postgres/time` | Test PostgreSQL connection |
| GET | `/db/mariadb/time` | Test MariaDB connection |
| GET | `/db/postgres/users` | Get all users from PostgreSQL |
| GET | `/db/mariadb/users` | Get all users from MariaDB |
| POST | `/db/postgres/users` | Create user in PostgreSQL |
| POST | `/db/mariadb/users` | Create user in MariaDB |

## 📁 Project Structure

```
db/
├── postgres.js           # PostgreSQL connection pool
├── mariadb.js           # MariaDB connection pool
└── sql/
    ├── postgres_demo.sql # PostgreSQL schema
    └── mariadb_demo.sql  # MariaDB schema

routes/
└── dbTest.js            # Database test endpoints
```

## 🔧 Configuration Details

### PostgreSQL Connection

The `db/postgres.js` file uses the `pg` package with connection pooling:

```javascript
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### MariaDB Connection

The `db/mariadb.js` file uses `mysql2/promise` with connection pooling:

```javascript
const pool = mysql.createPool({
  host: process.env.MARIADB_HOST,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  connectionLimit: 10,
});
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use parameterized queries** - All queries use `$1`, `$2` or `?` placeholders
3. **Validate inputs** - All POST endpoints validate required fields
4. **Use strong passwords** - Change default passwords in production
5. **Limit connections** - Connection pools prevent resource exhaustion

## 🐛 Troubleshooting

### PostgreSQL Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list
# or
docker ps

# Start PostgreSQL
brew services start postgresql
# or
docker start postgres
```

### MariaDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
```bash
# Check if MariaDB is running
brew services list
# or
docker ps

# Start MariaDB
brew services start mariadb
# or
docker start mariadb
```

### Table Does Not Exist

```
Error: relation "demo_users" does not exist
```

**Solution:**
Run the schema files:
```bash
# PostgreSQL
psql -d homeconnect -f db/sql/postgres_demo.sql

# MariaDB
mysql homeconnect < db/sql/mariadb_demo.sql
```

### Authentication Failed

**PostgreSQL:**
```bash
# Reset password
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
```

**MariaDB:**
```bash
# Reset root password
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
```

## 📊 Database Schema

### demo_users Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL/INT AUTO_INCREMENT | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

## 🎯 Usage Examples

### Query with Parameters

**PostgreSQL:**
```javascript
const pg = require('./db/postgres');
const result = await pg.query(
  'SELECT * FROM demo_users WHERE email = $1',
  ['user@example.com']
);
```

**MariaDB:**
```javascript
const maria = require('./db/mariadb');
const rows = await maria.query(
  'SELECT * FROM demo_users WHERE email = ?',
  ['user@example.com']
);
```

### Transaction Example

**PostgreSQL:**
```javascript
const client = await pg.pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO demo_users...');
  await client.query('UPDATE ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

## ✅ Success Indicators

When properly configured, you should see:

```
[Postgres] Connected successfully: 2025-11-17T...
[MariaDB] Connected successfully: 2025-11-17T...
```

If databases are not configured:
```
[Postgres] Connection check failed: getaddrinfo ENOTFOUND
[Postgres] Database endpoints will return errors until configured
```

This is normal and won't crash the server - the endpoints will simply return errors until databases are set up.

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MariaDB Documentation](https://mariadb.com/kb/en/)
- [node-postgres (pg) Guide](https://node-postgres.com/)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)

---

**Database integration complete!** 🎉 The system gracefully handles missing databases and provides clear error messages.
