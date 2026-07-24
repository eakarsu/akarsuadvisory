#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
[ -f "$ROOT_DIR/.env" ] || { echo '.env is required' >&2; exit 1; }
set -a
. "$ROOT_DIR/.env"
set +a

mode="${1:-start}"
required() { eval "value=\${$1:-}"; [ -n "$value" ] || { echo "$1 is required" >&2; exit 1; }; }
configure() {
  for name in DATABASE_URL JWT_SECRET JWT_ISSUER JWT_AUDIENCE PUBLIC_TENANT_ID ADVISORY_DATA_KEYS_JSON ADVISORY_ACTIVE_KEY_VERSION PUBLIC_APP_URL OPENROUTER_API_KEY OPENROUTER_MODEL OPENROUTER_BASE_URL BACKEND_PORT FRONTEND_PORT; do required "$name"; done
  [ "${#JWT_SECRET}" -ge 32 ] || { echo 'JWT_SECRET must contain at least 32 characters' >&2; exit 1; }
  [ "$OPENROUTER_BASE_URL" = 'https://openrouter.ai/api/v1' ] || { echo 'OPENROUTER_BASE_URL is invalid' >&2; exit 1; }
  node -e 'const k=JSON.parse(process.env.ADVISORY_DATA_KEYS_JSON)[process.env.ADVISORY_ACTIVE_KEY_VERSION];if(!/^[a-f0-9]{64}$/i.test(k||""))throw Error("invalid active key")'
  case "$BACKEND_PORT:$FRONTEND_PORT" in *[!0-9:]*) echo 'runtime ports must be numeric' >&2; exit 1;; esac
  [ "$BACKEND_PORT" != "$FRONTEND_PORT" ] || { echo 'BACKEND_PORT and FRONTEND_PORT must differ' >&2; exit 1; }
}

case "$mode" in
  check)
    (cd "$ROOT_DIR/backend" && npm run check)
    (cd "$ROOT_DIR/frontend" && npm run build)
    ;;
  migrate)
    configure
    [ "${ALLOW_SCHEMA_MIGRATION:-}" = 1 ] || { echo 'Set ALLOW_SCHEMA_MIGRATION=1 for the isolated runtime database' >&2; exit 1; }
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/db/migrations/001_governed_advisory.sql"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/db/migrations/002_runtime_ai.sql"
    ;;
  start)
    configure
    for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
      if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "runtime port $port is occupied" >&2; exit 1; fi
    done
    [ -d "$ROOT_DIR/backend/node_modules" ] || { echo 'backend dependencies are not installed' >&2; exit 1; }
    [ -d "$ROOT_DIR/frontend/node_modules" ] || { echo 'frontend dependencies are not installed' >&2; exit 1; }
    psql "$DATABASE_URL" -Atqc 'SELECT 1' >/dev/null
    echo "Starting Akarsu Advisory API on $BACKEND_PORT and UI on $FRONTEND_PORT; persistent state is unchanged."
    exec node "$ROOT_DIR/runtime-launcher.js"
    ;;
  *) echo 'usage: ./start.sh [check|migrate|start]' >&2; exit 2;;
esac
