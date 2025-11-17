# Database Indexing Guide

## Overview
Database indexes improve query performance by creating efficient lookup structures. Think of them like a book's index - instead of scanning every page, you can jump directly to relevant content.

## MongoDB Indexes

### Creating Indexes

```javascript
// Single field index
db.properties.createIndex({ location: 1 })

// Compound index (multiple fields)
db.properties.createIndex({ location: 1, type: 1 })

// Text index for full-text search
db.properties.createIndex({ description: "text" })

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })
```

### Using Mongoose Schema Indexes

```javascript
const propertySchema = new mongoose.Schema({
  location: String,
  type: String,
  price: Number
});

// Define indexes in schema
propertySchema.index({ location: 1, type: 1 });
propertySchema.index({ price: 1 });
```

### Query Performance Analysis

```javascript
// Use explain() to see if indexes are being used
Property.find({ location: 'New York' }).explain('executionStats')

// Look for:
// - "executionStats.totalDocsExamined" vs "executionStats.nReturned"
// - Lower totalDocsExamined = better index usage
```

### Index Types

1. **Ascending (1)**: `{ field: 1 }`
2. **Descending (-1)**: `{ field: -1 }`
3. **Text**: `{ field: "text" }` - for full-text search
4. **Geospatial**: `{ location: "2dsphere" }` - for location queries

### Best Practices

- Index fields used in queries frequently
- Don't over-index - each index adds write overhead
- Monitor index usage with `db.collection.stats()`
- Use compound indexes for multi-field queries

## PostgreSQL Indexes

### Creating Indexes

```sql
-- Single column index
CREATE INDEX idx_properties_location ON properties(location);

-- Composite index
CREATE INDEX idx_properties_loc_type ON properties(location, type);

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index (with condition)
CREATE INDEX idx_active_properties ON properties(status)
WHERE status = 'active';
```

### Checking Index Usage

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM properties WHERE location = 'New York';

-- View all indexes on a table
SELECT * FROM pg_indexes WHERE tablename = 'properties';
```

### Index Types

- **B-tree** (default): General purpose, sorted data
- **Hash**: Fast equality comparisons
- **GiST**: Geometric and full-text search
- **GIN**: Array and JSON data

## Performance Impact

### Before Index
- Scans entire table
- Slow on large datasets
- Linear time complexity O(n)

### After Index
- Direct lookup
- Fast regardless of size
- Logarithmic time O(log n)

## Example Results

```
Without index: 1000ms for 100,000 records
With index: 5ms for 100,000 records
Performance gain: 200x faster
```
