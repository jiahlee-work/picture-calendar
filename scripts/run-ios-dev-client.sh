#!/usr/bin/env bash
set -euo pipefail

# The iOS Simulator can reach the host Metro server through loopback. Using
# localhost avoids LAN address resolution and simulator openurl timeouts.
export REACT_NATIVE_PACKAGER_HOSTNAME="${REACT_NATIVE_PACKAGER_HOSTNAME:-127.0.0.1}"

SIMULATOR_NAME="${IOS_SIMULATOR_NAME:-iPhone 17 Pro}"
SIMULATOR_RUNTIME="${IOS_SIMULATOR_RUNTIME:-}"

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "$command_name not found." >&2
    exit 1
  fi
}

resolve_ios_simulator_udid() {
  local devices_json

  devices_json="$(xcrun simctl list devices available -j)"
  SIMCTL_DEVICES_JSON="$devices_json" \
    IOS_SIMULATOR_NAME="$SIMULATOR_NAME" \
    IOS_SIMULATOR_RUNTIME="$SIMULATOR_RUNTIME" \
    node <<'NODE'
const devicesByRuntime = JSON.parse(process.env.SIMCTL_DEVICES_JSON || "{}").devices || {};
const simulatorName = process.env.IOS_SIMULATOR_NAME || "iPhone 17 Pro";
const simulatorRuntime = process.env.IOS_SIMULATOR_RUNTIME || "";

function runtimeVersion(runtime) {
  const match = runtime.match(/iOS-([\d-]+)/);

  if (!match) {
    return [];
  }

  return match[1].split("-").map((part) => Number.parseInt(part, 10) || 0);
}

function normalizedRuntime(runtime) {
  return runtime.replace(/-/g, ".");
}

function compareVersionDesc(left, right) {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const diff = (right[index] || 0) - (left[index] || 0);

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

const candidates = Object.entries(devicesByRuntime)
  .flatMap(([runtime, devices]) => {
    return devices
      .filter((device) => device.isAvailable !== false && device.name === simulatorName)
      .filter(() => {
        return !simulatorRuntime
          || runtime.includes(simulatorRuntime)
          || normalizedRuntime(runtime).includes(simulatorRuntime);
      })
      .map((device) => ({
        name: device.name,
        runtime,
        state: device.state,
        udid: device.udid,
        version: runtimeVersion(runtime),
      }));
  })
  .sort((left, right) => {
    if (left.state === "Booted" && right.state !== "Booted") {
      return -1;
    }

    if (right.state === "Booted" && left.state !== "Booted") {
      return 1;
    }

    return compareVersionDesc(left.version, right.version);
  });

const selectedDevice = candidates[0];

if (!selectedDevice) {
  const availableNames = new Set();

  for (const devices of Object.values(devicesByRuntime)) {
    for (const device of devices) {
      if (device.isAvailable !== false && device.name.includes("iPhone")) {
        availableNames.add(device.name);
      }
    }
  }

  console.error(`No available iOS simulator named "${simulatorName}" was found.`);
  console.error(`Available iPhone simulators: ${Array.from(availableNames).sort().join(", ")}`);
  process.exit(1);
}

console.error(`Using ${selectedDevice.name} (${selectedDevice.runtime}) ${selectedDevice.udid}`);
process.stdout.write(selectedDevice.udid);
NODE
}

boot_ios_simulator() {
  local simulator_udid="$1"

  xcrun simctl boot "$simulator_udid" >/dev/null 2>&1 || true
  open -a Simulator --args -CurrentDeviceUDID "$simulator_udid" >/dev/null 2>&1 || open -a Simulator >/dev/null
  xcrun simctl bootstatus "$simulator_udid" -b >/dev/null
}

run_expo_ios() {
  local simulator_udid="$1"
  shift

  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec expo run:ios --device "$simulator_udid" "$@"
    return
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack pnpm exec expo run:ios --device "$simulator_udid" "$@"
    return
  fi

  echo "pnpm not found. Open a new terminal or run source ~/.zshrc, then try again." >&2
  exit 1
}

require_command node
require_command open
require_command xcrun

IOS_SIMULATOR_UDID="$(resolve_ios_simulator_udid)"
boot_ios_simulator "$IOS_SIMULATOR_UDID"
run_expo_ios "$IOS_SIMULATOR_UDID" "$@"
