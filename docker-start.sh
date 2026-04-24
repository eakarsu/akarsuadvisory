#!/bin/sh
set -e

# Parse DATABASE_URL if provided
if [ -n "$DATABASE_URL" ]; then
  export DB_USER=$(echo $DATABASE_URL | sed 's|.*://\([^:]*\):.*|\1|')
  export DB_PASSWORD=$(echo $DATABASE_URL | sed 's|.*://[^:]*:\([^@]*\)@.*|\1|')
  export DB_HOST=$(echo $DATABASE_URL | sed 's|.*@\([^:]*\):.*|\1|')
  export DB_PORT=$(echo $DATABASE_URL | sed 's|.*:\([0-9]*\)/.*|\1|')
  export DB_NAME=$(echo $DATABASE_URL | sed 's|.*/\([^?]*\).*|\1|')
fi

# Configure nginx port
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-3001}
sed -i "s|listen 3000|listen ${FRONTEND_PORT}|g" /etc/nginx/http.d/default.conf
sed -i "s|127.0.0.1:3001|127.0.0.1:${BACKEND_PORT}|g" /etc/nginx/http.d/default.conf

# Seed database
echo "Seeding database..."
cd /app/backend
node seed.js || echo "Seed warning (may already exist)"

# Start backend
echo "Starting backend on port ${BACKEND_PORT}..."
PORT=${BACKEND_PORT} node server.js &
BACKEND_PID=$!

# Wait for backend
for i in $(seq 1 30); do
  wget -q -O /dev/null http://127.0.0.1:${BACKEND_PORT}/api/health 2>/dev/null && break
  sleep 1
done

# Start nginx
echo "Starting nginx on port ${FRONTEND_PORT}..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "Akarsu Advisory is running!"
wait $BACKEND_PID $NGINX_PID
