#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

MOCK_PORT="${MOCK_PORT:-8080}"
TAILSCALE_SERVE_PORT="${TAILSCALE_SERVE_PORT:-443}"

if ! command -v tailscale >/dev/null 2>&1; then
  echo "Instala Tailscale: https://tailscale.com/download" >&2
  exit 1
fi

exec sudo tailscale serve --bg --http="$TAILSCALE_SERVE_PORT" "http://127.0.0.1:${MOCK_PORT}"
