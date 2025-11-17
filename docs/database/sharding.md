# Database Sharding Guide

## Overview
Sharding is a database scaling technique that distributes data across multiple servers (shards). Each shard contains a subset of the total data, allowing horizontal scaling for massive datasets.

## Why Sharding?

**Problem:** Single database server can't handle:
- Millions of users
- Terabytes of data
- High throughput requirements

**Solution:** Distribute data across multiple servers
- Each server handles portion of data
- Queries directed to relevant shard(s)
- Linear scalability

## MongoDB Sharding

### Architecture

```
Application
    ↓
Mongos Router (query router)
    ↓
Config Servers (metadata)
    ↓
┌─────────┬─────────┬─────────┐
Shard 1   Shard 2   Shard 3
```

### Shard Key Selection

The shard key determines how data is distributed:

```javascript
// Good shard key: userId (high cardinality, even distribution)
sh.shardCollection("homeconnect.properties", { userId: 1 })

// Good compound shard key
sh.shardCollection("homeconnect.properties", { location: 1, userId: 1 })

// Poor shard key: type (low cardinality, uneven distribution)
sh.shardCollection("homeconnect.properties", { type: 1 }) // DON'T DO THIS
```

### Setting Up Sharding

```bash
# 1. Start config servers (3 recommended)
mongod --configsvr --replSet configReplSet --port 27019 --dbpath /data/configdb

# 2. Start shard servers
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1
mongod --shardsvr --replSet shard2 --port 27028 --dbpath /data/shard2

# 3. Start mongos router
mongos --configdb configReplSet/localhost:27019 --port 27017

# 4. Connect to mongos and add shards
sh.addShard("shard1/localhost:27018")
sh.addShard("shard2/localhost:27028")

# 5. Enable sharding on database
sh.enableSharding("homeconnect")

# 6. Shard a collection
sh.shardCollection("homeconnect.properties", { location: "hashed" })
```

### Shard Key Strategies

#### 1. Hashed Sharding
```javascript
// Even distribution but no range queries
sh.shardCollection("homeconnect.properties", { _id: "hashed" })
```

#### 2. Range Sharding
```javascript
// Supports range queries but risk of hotspots
sh.shardCollection("homeconnect.properties", { createdAt: 1 })
```

#### 3. Compound Sharding
```javascript
// Balance of both approaches
sh.shardCollection("homeconnect.properties", { location: 1, userId: 1 })
```

### Monitoring Shards

```javascript
// View shard distribution
db.properties.getShardDistribution()

// Check balancer status
sh.status()

// List all shards
sh.status().shards
```

## Choosing a Shard Key

### Good Shard Key Characteristics

✅ **High Cardinality**: Many unique values
```javascript
userId: 1  // Good - unique per user
```

✅ **Even Distribution**: Data spread evenly
```javascript
{ location: "hashed" }  // Good - hash ensures distribution
```

✅ **Avoid Hotspots**: No single shard overwhelmed
```javascript
{ timestamp: 1, userId: 1 }  // Good - spreads sequential writes
```

### Bad Shard Key Characteristics

❌ **Low Cardinality**: Few unique values
```javascript
type: 1  // Bad - only 3 values (house, flat, shop)
```

❌ **Monotonically Increasing**: All new data to one shard
```javascript
createdAt: 1  // Bad - newest data always on same shard
```

❌ **Poor Query Patterns**: Forces scatter-gather
```javascript
// If you query by userId but shard by location
```

## Sharding Trade-offs

### Benefits
- Horizontal scaling (add more servers)
- Handle massive datasets
- High throughput

### Costs
- Increased complexity
- Cannot change shard key easily
- Some queries slower (scatter-gather)
- More infrastructure to manage

## When to Shard

**Shard when:**
- Database > 1TB
- Single server can't handle load
- Need to scale beyond vertical limits
- Geographic distribution required

**Don't shard when:**
- Dataset fits on one server
- Can scale vertically
- Application is simple
- Team lacks expertise

## PostgreSQL Sharding

PostgreSQL doesn't have built-in sharding, but options include:

### 1. Citus Extension
```sql
-- Enable Citus
CREATE EXTENSION citus;

-- Distribute table
SELECT create_distributed_table('properties', 'user_id');
```

### 2. Manual Application-Level Sharding
```javascript
// Route queries based on shard key
const shardNumber = hashFunction(userId) % totalShards;
const connection = shardConnections[shardNumber];
```

### 3. Third-party Tools
- **Vitess**: Sharding for MySQL/PostgreSQL
- **pgpool-II**: Connection pooling and load balancing

## Best Practices

1. **Choose shard key carefully** - difficult to change later
2. **Monitor shard distribution** - ensure balance
3. **Test thoroughly** - sharding adds complexity
4. **Start simple** - only shard when necessary
5. **Plan queries** - optimize for shard key access
6. **Use hashed sharding** for even distribution
7. **Document strategy** - for team understanding

## Example: Sharding Strategy for Home Connect

```javascript
// Recommended shard key for properties collection
// Hashed userId ensures even distribution
sh.shardCollection("homeconnect.properties", { userId: "hashed" })

// Alternative: Location-based for geographic queries
sh.shardCollection("homeconnect.properties", { location: 1, userId: 1 })
```

This allows:
- Even data distribution
- Queries by userId are efficient (single shard)
- Scale to millions of properties
- Geographic distribution possible
