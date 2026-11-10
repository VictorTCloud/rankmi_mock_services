#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if ! command -v tailscale >/dev/null 2>&1; then
  echo "Instala Tailscale: https://tailscale.com/download" >&2
  exit 1
fi

ARGS=()
if [[ -n "${TS_AUTHKEY:-}" ]]; then
  ARGS+=(--auth-key="$TS_AUTHKEY")
fi
if [[ -n "${TS_HOSTNAME:-}" ]]; then
  ARGS+=(--hostname="$TS_HOSTNAME")
fi

if ((${#ARGS[@]} > 0)); then
  sudo tailscale up "${ARGS[@]}"
else
  echo "Sin TS_AUTHKEY ni TS_HOSTNAME en .env; ejecutando tailscale up interactivo."
  sudo tailscale up
fi

tailscale status
