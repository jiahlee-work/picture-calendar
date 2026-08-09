#!/usr/bin/env bash
set -euo pipefail

export PATH="$PATH:$HOME/.maestro/bin"

APP_PORT="8081"
APP_HOST="$(scripts/resolve-dev-server-host.sh)"
METRO_HEALTH_URL="http://localhost:${APP_PORT}"
METRO_LOG="${TMPDIR:-/tmp}/pical-app-e2e-metro.log"
METRO_PID=""

cleanup() {
  if [ -n "$METRO_PID" ] && kill -0 "$METRO_PID" >/dev/null 2>&1; then
    kill "$METRO_PID" >/dev/null 2>&1 || true
    wait "$METRO_PID" >/dev/null 2>&1 || true
  fi
}

wait_for_app_server() {
  local attempts=0

  until curl --silent --fail --max-time 2 "${METRO_HEALTH_URL}/status" >/dev/null; do
    attempts=$((attempts + 1))

    if [ "$attempts" -gt 60 ]; then
      echo "App Metro did not start on ${METRO_HEALTH_URL}." >&2
      echo "Metro log: ${METRO_LOG}" >&2
      exit 1
    fi

    sleep 1
  done
}

if ! command -v maestro >/dev/null 2>&1; then
  echo "maestro CLI not found. Install Maestro before running E2E checks." >&2
  exit 127
fi

scripts/ensure-ios-simulator.sh
trap cleanup EXIT

if ! curl --silent --fail --max-time 2 "${METRO_HEALTH_URL}/status" >/dev/null; then
  EXPO_DEV_SERVER_PORT="$APP_PORT" \
    REACT_NATIVE_PACKAGER_HOSTNAME="$APP_HOST" \
    ./node_modules/.bin/expo start --dev-client --port "$APP_PORT" --host lan --clear \
    >"$METRO_LOG" 2>&1 &
  METRO_PID="$!"
fi

wait_for_app_server
maestro test -e "DEV_SERVER_HOST=${APP_HOST}" .maestro/open-app-dev-client.yaml
maestro test -e "DEV_SERVER_HOST=${APP_HOST}" .maestro/e2e-core-navigation.yaml
