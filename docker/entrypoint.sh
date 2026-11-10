#!/bin/sh
set -e

if [ -z "${MOCK_TOKEN}" ]; then
  echo "MOCK_TOKEN must be set (non-empty)." >&2
  exit 1
fi

exec python /app/mock_seguros.py \
  --host "${MOCK_HOST:-0.0.0.0}" \
  --port "${MOCK_PORT:-8080}" \
  --token "${MOCK_TOKEN}"
