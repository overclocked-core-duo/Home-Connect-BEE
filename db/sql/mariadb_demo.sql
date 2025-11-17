-- db/sql/mariadb_demo.sql
-- Demo schema for MariaDB integration
-- Run with: mysql -u root -p testdb < db/sql/mariadb_demo.sql

CREATE TABLE IF NOT EXISTS demo_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample insert (IGNORE will skip if email already exists)
INSERT IGNORE INTO demo_users (name, email) 
VALUES ('Maria Demo User', 'maria_demo@example.com');

-- Additional sample data
INSERT IGNORE INTO demo_users (name, email)
VALUES 
  ('Charlie MariaDB', 'charlie.maria@example.com'),
  ('Diana MySQL', 'diana.mysql@example.com');
