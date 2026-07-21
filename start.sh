#!/bin/sh
set -eu
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
APP_ROOT="${RUNTIME_PROJECT_SOURCE:-$ROOT_DIR}"
mode="${1:-check}"
port="${PORT:-${BACKEND_PORT:-}}"
JWT_ISSUER="${JWT_ISSUER:-akarsu-advisory}"
JWT_AUDIENCE="${JWT_AUDIENCE:-akarsu-advisory-web}"
PUBLIC_TENANT_ID="${PUBLIC_TENANT_ID:-${TENANT_ID:-${GOVERNANCE_TENANT_ID:-}}}"
ADVISORY_ACTIVE_KEY_VERSION="${ADVISORY_ACTIVE_KEY_VERSION:-v1}"
PUBLIC_APP_URL="${PUBLIC_APP_URL:-${NEXTAUTH_URL:-${port:+http://127.0.0.1:$port}}}"
if [ -z "${ADVISORY_DATA_KEYS_JSON:-}" ] && [ "${NODE_ENV:-development}" != production ];then
  data_key="$(node -e 'const c=require("crypto"),s=process.env.SECRET_KEY||process.env.JWT_SECRET||"";process.stdout.write(c.createHash("sha256").update(s).digest("hex"))')"
  ADVISORY_DATA_KEYS_JSON="{\"v1\":\"$data_key\"}"
fi
export JWT_ISSUER JWT_AUDIENCE PUBLIC_TENANT_ID ADVISORY_ACTIVE_KEY_VERSION PUBLIC_APP_URL ADVISORY_DATA_KEYS_JSON
required(){ eval "value=\${$1:-}";[ -n "$value" ]||{ echo "$1 is required" >&2;exit 1;};}
config(){ for x in DATABASE_URL JWT_SECRET JWT_ISSUER JWT_AUDIENCE PUBLIC_TENANT_ID ADVISORY_DATA_KEYS_JSON ADVISORY_ACTIVE_KEY_VERSION PUBLIC_APP_URL;do required "$x";done;[ "${#JWT_SECRET}" -ge 32 ]||{ echo 'JWT_SECRET must contain at least 32 characters' >&2;exit 1;};node -e 'const k=JSON.parse(process.env.ADVISORY_DATA_KEYS_JSON)[process.env.ADVISORY_ACTIVE_KEY_VERSION];if(!/^[a-f0-9]{64}$/i.test(k||""))throw Error("invalid active key")';[ "${NODE_ENV:-}" != production ]||required CORS_ORIGIN;}
case "$mode" in
  check)(cd "$APP_ROOT/backend"&&npm run check);(cd "$APP_ROOT/frontend"&&npm run build);;
  migrate)config;[ "${ALLOW_SCHEMA_MIGRATION:-}" = 1 ]||{ echo 'Set ALLOW_SCHEMA_MIGRATION=1 after backup approval' >&2;exit 1;};psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/backend/db/migrations/001_governed_advisory.sql";;
  start)config;[ -n "$port" ]||{ echo 'PORT or BACKEND_PORT is required' >&2;exit 1;};case "$port" in *[!0-9]*)echo 'runtime port must be numeric' >&2;exit 1;;esac;if lsof -tiTCP:"$port" -sTCP:LISTEN>/dev/null 2>&1;then echo "runtime port $port is occupied" >&2;exit 1;fi;cd "$APP_ROOT/backend";exec npm start;;
  *)echo 'usage: ./start.sh check|migrate|start' >&2;exit 2;;
esac
