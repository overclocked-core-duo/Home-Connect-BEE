#!/bin/bash

echo "🔧 Testing Redis Integration..."

# Check if Redis is running
echo ""
echo "1️⃣ Checking Redis service..."
redis-cli ping || {
  echo "❌ Redis is not running!"
  echo "Start it with: brew services start redis"
  exit 1
}
echo "✅ Redis is running"

# Start the server in background
echo ""
echo "2️⃣ Starting server..."
npm run dev &
SERVER_PID=$!
sleep 3

# Test cache endpoint
echo ""
echo "3️⃣ Testing cache (first request - should be slow)..."
time curl -s http://localhost:8080/api/test/cache | jq

echo ""
echo "4️⃣ Testing cache (second request - should be fast)..."
time curl -s http://localhost:8080/api/test/cache | jq

# Check Redis keys
echo ""
echo "5️⃣ Checking Redis keys..."
redis-cli KEYS "cache:*"

# View cached data
echo ""
echo "6️⃣ Viewing cached data..."
redis-cli GET "cache:/api/test/cache" | jq

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID
echo "✅ Test complete!"