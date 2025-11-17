-- db/sql/postgres_demo.sql
-- Demo schema for PostgreSQL integration
-- Run with: psql -d mydb -f db/sql/postgres_demo.sql

CREATE TABLE IF NOT EXISTS demo_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample insert (will only insert if email doesn't exist)
INSERT INTO demo_users (name, email)
VALUES ('PG Demo User', 'pg_demo@example.com')
ON CONFLICT (email) DO NOTHING;

-- Additional sample data
INSERT INTO demo_users (name, email)
VALUES 
  ('Alice PostgreSQL', 'alice.pg@example.com'),
  ('Bob Database', 'bob.db@example.com')
ON CONFLICT (email) DO NOTHING;
