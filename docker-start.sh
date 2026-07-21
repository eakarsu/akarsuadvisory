#!/bin/sh
set -eu
cd /app
./start.sh start & backend_pid=$!
nginx -g 'daemon off;' & nginx_pid=$!
trap 'kill "$backend_pid" "$nginx_pid" 2>/dev/null || true' TERM INT
wait "$backend_pid" "$nginx_pid"
