#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

AVD_NAME="${ANDROID_AVD_NAME:-Pixel_8_Pro_API_33}"
ADB="$ANDROID_HOME/platform-tools/adb"
EMULATOR="$ANDROID_HOME/emulator/emulator"
LAUNCH_LABEL="com.pical.android.emulator"
LAUNCH_PLIST="/tmp/$LAUNCH_LABEL.plist"
METRO_PORT="${EXPO_DEV_SERVER_PORT:-8081}"

has_connected_android_device() {
  "$ADB" devices | awk 'NR > 1 && $2 == "device" { found = 1 } END { exit found ? 0 : 1 }'
}

wait_for_android_boot() {
  local attempts=0

  until has_connected_android_device && [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    attempts=$((attempts + 1))

    if [ "$attempts" -gt 90 ]; then
      echo "Android emulator did not finish booting within 180 seconds." >&2
      exit 1
    fi

    sleep 2
  done
}

run_expo_android() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec expo run:android "$@"
    return
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack pnpm exec expo run:android "$@"
    return
  fi

  echo "pnpm not found. Open a new terminal or run source ~/.zshrc, then try again." >&2
  exit 1
}

setup_metro_port_reverse() {
  "$ADB" reverse "tcp:$METRO_PORT" "tcp:$METRO_PORT" >/dev/null
}

write_android_emulator_launch_agent() {
  cat > "$LAUNCH_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LAUNCH_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$EMULATOR</string>
    <string>-avd</string>
    <string>$AVD_NAME</string>
    <string>-netdelay</string>
    <string>none</string>
    <string>-netspeed</string>
    <string>full</string>
  </array>
  <key>StandardOutPath</key>
  <string>/tmp/pical-android-emulator.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/pical-android-emulator.log</string>
  <key>WorkingDirectory</key>
  <string>$(pwd)</string>
</dict>
</plist>
EOF
}

start_android_emulator() {
  local user_id

  user_id="$(id -u)"
  write_android_emulator_launch_agent

  if ! launchctl print "gui/$user_id/$LAUNCH_LABEL" >/dev/null 2>&1; then
    launchctl bootstrap "gui/$user_id" "$LAUNCH_PLIST"
  fi

  launchctl kickstart -k "gui/$user_id/$LAUNCH_LABEL"
}

if [ ! -x "$ADB" ]; then
  echo "adb not found at $ADB" >&2
  exit 1
fi

if [ ! -x "$EMULATOR" ]; then
  echo "emulator not found at $EMULATOR" >&2
  exit 1
fi

"$ADB" start-server >/dev/null

if ! has_connected_android_device; then
  start_android_emulator
fi

wait_for_android_boot
setup_metro_port_reverse

run_expo_android "$@"
