#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Kill existing processes on ports
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true

# Create database if not exists
createdb akarsu_advisory 2>/dev/null || true

# Install dependencies
echo "Installing backend dependencies..."
cd "$ROOT/backend" && npm install

echo "Installing frontend dependencies..."
cd "$ROOT/frontend" && npm install

# Seed database
echo "Seeding database..."
cd "$ROOT/backend" && node seed.js

# Start backend
echo "Starting backend..."
cd "$ROOT/backend" && node server.js &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend..."
for i in {1..30}; do
  curl -s http://localhost:3001/api/health > /dev/null 2>&1 && break
  sleep 1
done

# Start frontend
echo "Starting frontend..."
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  Akarsu Advisory is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Admin:    admin@akarsuadvisory.com (check seed output for password)"
echo "========================================="

wait
