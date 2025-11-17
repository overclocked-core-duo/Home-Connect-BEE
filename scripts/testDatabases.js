/**
 * Example script to demonstrate database connections
 * Run with: node scripts/testDatabases.js
 */

const { demonstrateHashing } = require('../security/hashing');

console.log('\n====================================');
console.log('  BEE Home Connect - Database Demo');
console.log('====================================\n');

// Demonstrate hashing examples
demonstrateHashing();

// MongoDB is already connected in server.js
console.log('[INFO] MongoDB connection is handled by server.js');
console.log('[INFO] To enable other databases, uncomment them in server.js\n');

// Example: Testing Redis (if enabled)
async function testRedis() {
  try {
    const { connectRedis, setCache, getCache } = require('../db/redis');
    await connectRedis();
    
    console.log('[Redis] Testing cache operations...');
    await setCache('test-key', 'Hello from Redis!', 60);
    const value = await getCache('test-key');
    console.log('[Redis] Retrieved from cache:', value);
  } catch (err) {
    console.log('[Redis] Not available or not configured:', err.message);
  }
}

// Example: Testing PostgreSQL (if enabled)
async function testPostgres() {
  try {
    const { connectPostgres, executeQuery } = require('../db/postgres');
    await connectPostgres();
    
    console.log('[PostgreSQL] Testing query...');
    const result = await executeQuery('SELECT version()');
    console.log('[PostgreSQL] Version:', result[0].version);
  } catch (err) {
    console.log('[PostgreSQL] Not available or not configured:', err.message);
  }
}

// Example: Testing MariaDB (if enabled)
async function testMariaDB() {
  try {
    const { connectMariaDB, executeQuery } = require('../db/mariadb');
    await connectMariaDB();
    
    console.log('[MariaDB] Testing query...');
    const result = await executeQuery('SELECT VERSION() as version');
    console.log('[MariaDB] Version:', result[0].version);
  } catch (err) {
    console.log('[MariaDB] Not available or not configured:', err.message);
  }
}

// Example: Testing InfluxDB (if enabled)
function testInflux() {
  try {
    const { connectInflux, recordAPICall } = require('../db/influx');
    connectInflux();
    
    console.log('[InfluxDB] Recording sample metric...');
    recordAPICall('/api/test', 'GET', 150);
    console.log('[InfluxDB] Metric recorded');
  } catch (err) {
    console.log('[InfluxDB] Not available or not configured:', err.message);
  }
}

// Example: Testing Neo4j (if enabled)
async function testNeo4j() {
  try {
    const { connectNeo4j, createNode } = require('../db/neo4j');
    connectNeo4j();
    
    console.log('[Neo4j] Creating sample node...');
    await createNode('TestNode', { name: 'Test', timestamp: new Date().toISOString() });
    console.log('[Neo4j] Node created');
  } catch (err) {
    console.log('[Neo4j] Not available or not configured:', err.message);
  }
}

// Run tests if databases are enabled
console.log('\n=== Optional Database Tests ===');
console.log('Uncomment database connections in server.js to enable these tests\n');

// Uncomment to test when databases are configured:
testRedis();
// testPostgres();
// testMariaDB();
// testInflux();
// testNeo4j();

console.log('\n====================================');
console.log('  Demo Complete!');
console.log('====================================\n');
