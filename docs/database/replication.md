# Database Replication Guide

## Overview
Database replication creates copies of your database across multiple servers for:
- **High availability**: If primary fails, secondary takes over
- **Read scalability**: Distribute read queries across replicas
- **Data redundancy**: Backup in case of data loss
- **Geographic distribution**: Serve users from nearest replica

## MongoDB Replication

### Replica Set Architecture

```
Primary (Read/Write)
    ↓
Secondary (Read only) ← Replicates data
    ↓
Secondary (Read only) ← Replicates data
```

### Setting Up Replica Set

```bash
# Start MongoDB instances (3 recommended)
mongod --port 27017 --dbpath /data/db1 --replSet rs0
mongod --port 27018 --dbpath /data/db2 --replSet rs0
mongod --port 27019 --dbpath /data/db3 --replSet rs0

# Connect to one instance
mongosh --port 27017

# Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})

# Check status
rs.status()
```

### Connection String for Replica Set

```javascript
mongoose.connect('mongodb://localhost:27017,localhost:27018,localhost:27019/homeconnect?replicaSet=rs0')
```

### Read Preferences

```javascript
// Read from primary only (default)
User.find().read('primary')

// Read from secondary (better load distribution)
User.find().read('secondary')

// Read from nearest (lowest latency)
User.find().read('nearest')
```

## PostgreSQL Replication

### Streaming Replication (Built-in)

#### Primary Server Configuration

```conf
# postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64
```

#### Standby Server Configuration

```conf
# postgresql.conf
hot_standby = on

# Create standby.signal file
touch /var/lib/postgresql/data/standby.signal

# Configure connection to primary
primary_conninfo = 'host=primary_host port=5432 user=replicator password=secret'
```

### Checking Replication Status

```sql
-- On primary
SELECT * FROM pg_stat_replication;

-- On standby
SELECT * FROM pg_stat_wal_receiver;
```

## Benefits of Replication

### Availability
- Automatic failover to secondary
- Zero or minimal downtime
- Business continuity

### Performance
- Offload read queries to replicas
- Primary handles writes only
- Better resource utilization

### Disaster Recovery
- Geographic distribution
- Point-in-time recovery
- Data backup

## Replication Lag

**What is it?** Time delay between primary and secondary

**Monitor it:**
```javascript
// MongoDB
rs.printSlaveReplicationInfo()

// PostgreSQL
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
```

**Minimize it:**
- Fast network connection
- Adequate hardware resources
- Optimize write operations

## Best Practices

1. **Minimum 3 nodes** for MongoDB replica set (ensures majority)
2. **Geographic distribution** for disaster recovery
3. **Monitor replication lag** regularly
4. **Test failover** scenarios periodically
5. **Use read preferences** appropriately
6. **Secure replication** traffic with SSL/TLS
