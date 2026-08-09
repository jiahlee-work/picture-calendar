#!/usr/bin/env bash
set -euo pipefail

if [ -n "${MAESTRO_DEV_SERVER_HOST:-}" ]; then
  printf '%s\n' "$MAESTRO_DEV_SERVER_HOST"
  exit 0
fi

for interface in en0 en1; do
  if host_address="$(ipconfig getifaddr "$interface" 2>/dev/null)" && [ -n "$host_address" ]; then
    printf '%s\n' "$host_address"
    exit 0
  fi
done

echo "Could not determine a LAN address for the development server. Set MAESTRO_DEV_SERVER_HOST explicitly." >&2
exit 1
