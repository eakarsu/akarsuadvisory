#!/bin/sh
set -eu

# Local demo credential bridge (managed by tools/fix_demo_autofill.mjs)
demo_credentials_project_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ -f "$demo_credentials_project_dir/.env" ]; then
  while IFS= read -r demo_credentials_line || [ -n "$demo_credentials_line" ]; do
    case "$demo_credentials_line" in ''|'#'*) continue ;; esac
    demo_credentials_line="${demo_credentials_line#export }"
    demo_credentials_key="${demo_credentials_line%%=*}"
    demo_credentials_value="${demo_credentials_line#*=}"
    case "$demo_credentials_key" in
      NODE_ENV|ENABLE_DEMO_CREDENTIAL_AUTOFILL|DEMO_EMAIL|DEMO_PASSWORD|SEED_ADMIN_EMAIL|SEED_ADMIN_PASSWORD|SEED_USER_EMAIL|SEED_USER_PASSWORD|PROVISION_ADMIN_EMAIL|PROVISION_ADMIN_PASSWORD|BOOTSTRAP_ADMIN_EMAIL|BOOTSTRAP_ADMIN_PASSWORD|ADMIN_EMAIL|ADMIN_PASSWORD|DEFAULT_EMAIL|DEFAULT_PASSWORD|DEMO_TENANT|BOOTSTRAP_TENANT_SLUG|GOVERNANCE_TENANT_ID|TENANT_ID) ;;
      *) continue ;;
    esac
    [ -n "${!demo_credentials_key+x}" ] && continue
    demo_credentials_first="${demo_credentials_value:0:1}"
    demo_credentials_last="${demo_credentials_value: -1}"
    if { [ "$demo_credentials_first" = '"' ] && [ "$demo_credentials_last" = '"' ]; } || { [ "$demo_credentials_first" = "'" ] && [ "$demo_credentials_last" = "'" ]; }; then
      demo_credentials_value="${demo_credentials_value:1:${#demo_credentials_value}-2}"
    fi
    export "$demo_credentials_key=$demo_credentials_value"
  done < "$demo_credentials_project_dir/.env"
fi
demo_credentials_email=""
demo_credentials_password=""
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
demo_credentials_tenant="${DEMO_TENANT:-${BOOTSTRAP_TENANT_SLUG:-${GOVERNANCE_TENANT_ID:-${TENANT_ID:-}}}}"
if [ -n "${PROVISION_ADMIN_EMAIL:-}" ] && [ -n "${PROVISION_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$PROVISION_ADMIN_EMAIL"
  demo_credentials_password="$PROVISION_ADMIN_PASSWORD"
elif [ -n "${BOOTSTRAP_ADMIN_EMAIL:-}" ] && [ -n "${BOOTSTRAP_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$BOOTSTRAP_ADMIN_EMAIL"
  demo_credentials_password="$BOOTSTRAP_ADMIN_PASSWORD"
elif [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$SEED_ADMIN_EMAIL"
  demo_credentials_password="$SEED_ADMIN_PASSWORD"
elif [ -n "${SEED_USER_EMAIL:-}" ] && [ -n "${SEED_USER_PASSWORD:-}" ]; then
  demo_credentials_email="$SEED_USER_EMAIL"
  demo_credentials_password="$SEED_USER_PASSWORD"
elif [ -n "${DEMO_EMAIL:-}" ] && [ -n "${DEMO_PASSWORD:-}" ]; then
  demo_credentials_email="$DEMO_EMAIL"
  demo_credentials_password="$DEMO_PASSWORD"
elif [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  demo_credentials_email="$ADMIN_EMAIL"
  demo_credentials_password="$ADMIN_PASSWORD"
elif [ -n "${DEFAULT_EMAIL:-}" ] && [ -n "${DEFAULT_PASSWORD:-}" ]; then
  demo_credentials_email="$DEFAULT_EMAIL"
  demo_credentials_password="$DEFAULT_PASSWORD"
fi
if [ "${NODE_ENV:-development}" != production ] && [ "${ENABLE_DEMO_CREDENTIAL_AUTOFILL:-true}" = true ] && [ -n "$demo_credentials_email" ] && [ -n "$demo_credentials_password" ]; then
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export NEXT_PUBLIC_DEMO_EMAIL="$demo_credentials_email"
  export NEXT_PUBLIC_DEMO_PASSWORD="$demo_credentials_password"
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export VITE_DEMO_EMAIL="$demo_credentials_email"
  export VITE_DEMO_PASSWORD="$demo_credentials_password"
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
  export REACT_APP_DEMO_EMAIL="$demo_credentials_email"
  export REACT_APP_DEMO_PASSWORD="$demo_credentials_password"
  if [ -n "$demo_credentials_tenant" ]; then
    export NEXT_PUBLIC_DEMO_TENANT="$demo_credentials_tenant"
    export VITE_DEMO_TENANT="$demo_credentials_tenant"
    export REACT_APP_DEMO_TENANT="$demo_credentials_tenant"
  else
    unset NEXT_PUBLIC_DEMO_TENANT VITE_DEMO_TENANT REACT_APP_DEMO_TENANT
  fi
else
  export NEXT_PUBLIC_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  export REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
  unset NEXT_PUBLIC_DEMO_EMAIL NEXT_PUBLIC_DEMO_PASSWORD NEXT_PUBLIC_DEMO_TENANT
  unset VITE_DEMO_EMAIL VITE_DEMO_PASSWORD VITE_DEMO_TENANT
  unset REACT_APP_DEMO_EMAIL REACT_APP_DEMO_PASSWORD REACT_APP_DEMO_TENANT
fi
unset demo_credentials_email demo_credentials_password demo_credentials_tenant demo_credentials_project_dir demo_credentials_line demo_credentials_key demo_credentials_value demo_credentials_first demo_credentials_last

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
    if [ "${NODE_ENV:-development}" != production ] && [ "${ENABLE_DEMO_CREDENTIAL_AUTOFILL:-true}" = true ]; then
      [ "${ALLOW_SCHEMA_MIGRATION:-}" = 1 ] || [ "${ALLOW_SCHEMA_MIGRATION:-}" = true ] || { echo 'ALLOW_SCHEMA_MIGRATION=1 is required for local demo startup' >&2; exit 1; }
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/db/migrations/001_governed_advisory.sql"
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/db/migrations/002_runtime_ai.sql"
      node "$ROOT_DIR/backend/scripts/create-admin.js"
    fi
    psql "$DATABASE_URL" -Atqc 'SELECT 1' >/dev/null
    echo "Starting Akarsu Advisory API on $BACKEND_PORT and UI on $FRONTEND_PORT."
    exec node "$ROOT_DIR/runtime-launcher.js"
    ;;
  *) echo 'usage: ./start.sh [check|migrate|start]' >&2; exit 2;;
esac
