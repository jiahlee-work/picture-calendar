#!/usr/bin/env bash
set -euo pipefail

export PATH="$PATH:$HOME/.maestro/bin"

STORYBOOK_PORT="8082"
STORYBOOK_HOST="$(scripts/resolve-dev-server-host.sh)"
METRO_HEALTH_URL="http://localhost:${STORYBOOK_PORT}"
METRO_LOG="${TMPDIR:-/tmp}/pical-storybook-metro.log"
METRO_PID=""

cleanup() {
  if [ -n "$METRO_PID" ] && kill -0 "$METRO_PID" >/dev/null 2>&1; then
    kill "$METRO_PID" >/dev/null 2>&1 || true
    wait "$METRO_PID" >/dev/null 2>&1 || true
  fi
}

wait_for_storybook_server() {
  local attempts=0

  until curl --silent --fail --max-time 2 "${METRO_HEALTH_URL}/status" >/dev/null; do
    attempts=$((attempts + 1))

    if [ "$attempts" -gt 60 ]; then
      echo "Storybook Metro did not start on ${METRO_HEALTH_URL}." >&2
      echo "Metro log: ${METRO_LOG}" >&2
      exit 1
    fi

    sleep 1
  done
}

if ! command -v maestro >/dev/null 2>&1; then
  echo "maestro CLI not found. Install Maestro before running UI visual checks." >&2
  exit 127
fi

scripts/ensure-ios-simulator.sh
./node_modules/.bin/sb-rn-get-stories --config-path ./.rnstorybook
trap cleanup EXIT

if ! curl --silent --fail --max-time 2 "${METRO_HEALTH_URL}/status" >/dev/null; then
  STORYBOOK_ENABLED=true \
    EXPO_DEV_SERVER_PORT="$STORYBOOK_PORT" \
    REACT_NATIVE_PACKAGER_HOSTNAME="$STORYBOOK_HOST" \
    ./node_modules/.bin/expo start --dev-client --port "$STORYBOOK_PORT" --host lan --clear \
    >"$METRO_LOG" 2>&1 &
  METRO_PID="$!"
fi

wait_for_storybook_server
maestro test -e "DEV_SERVER_HOST=${STORYBOOK_HOST}" .maestro/open-storybook-dev-client.yaml
maestro test .maestro/storybook-screenshots.yaml
