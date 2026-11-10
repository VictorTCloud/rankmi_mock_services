#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${MOCK_TOKEN:?Define MOCK_TOKEN en deploy/tailscale-native/.env (copia desde .env.example)}"

MOCK_HOST="${MOCK_HOST:-0.0.0.0}"
MOCK_PORT="${MOCK_PORT:-8080}"

exec python3 "$ROOT/mock_seguros.py" \
  --host "$MOCK_HOST" \
  --port "$MOCK_PORT" \
  --token "$MOCK_TOKEN"
