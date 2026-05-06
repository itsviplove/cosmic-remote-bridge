#!/usr/bin/env node

const script = String.raw`#!/usr/bin/env bash
set -u

ok() { printf "[OK]   %s\n" "$1"; }
warn() { printf "[WARN] %s\n" "$1"; }
fail() { printf "[MISS] %s\n" "$1"; }
info() { printf "[INFO] %s\n" "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

JSON_MODE=0
if [ "\${1-}" = "--json" ]; then
  JSON_MODE=1
fi

JSON_LINES=""
json_add() {
  key="$1"
  value="$2"
  escaped=$(json_escape "$value")
  if [ -n "$JSON_LINES" ]; then
    JSON_LINES="$JSON_LINES,\n"
  fi
  JSON_LINES="$JSON_LINES  \"$key\": \"$escaped\""
}

record() {
  level="$1"
  message="$2"
  if [ "$JSON_MODE" -eq 1 ]; then
    printf '[%s] %s\n' "$level" "$message" >&2
  else
    case "$level" in
      OK) ok "$message" ;;
      WARN) warn "$message" ;;
      MISS) fail "$message" ;;
      INFO) info "$message" ;;
    esac
  fi
}

section() {
  if [ "$JSON_MODE" -eq 0 ]; then
    printf "\n== %s ==\n" "$1"
  fi
}

has_portal_iface() {
  iface="$1"
  have busctl && busctl --user introspect org.freedesktop.portal.Desktop /org/freedesktop/portal/desktop 2>/dev/null | grep -q "$iface"
}

portal_backend_file=""
if [ -d /usr/share/xdg-desktop-portal/portals ]; then
  portal_backend_file=$(find /usr/share/xdg-desktop-portal/portals -maxdepth 1 -type f \( -name '*cosmic*.portal' -o -name '*gnome*.portal' -o -name '*kde*.portal' -o -name '*wlr*.portal' -o -name '*gtk*.portal' \) 2>/dev/null | head -n 1)
fi

section "Session"
record INFO "XDG_SESSION_TYPE=\${XDG_SESSION_TYPE:-unknown}"
record INFO "XDG_CURRENT_DESKTOP=\${XDG_CURRENT_DESKTOP:-unknown}"
record INFO "DESKTOP_SESSION=\${DESKTOP_SESSION:-unknown}"

if [ "\${XDG_SESSION_TYPE:-}" = "wayland" ]; then record OK "Wayland session detected"; else record WARN "Not a Wayland session, or variable missing"; fi
printf "%s" "\${XDG_CURRENT_DESKTOP:-}\${DESKTOP_SESSION:-}" | grep -iq cosmic && record OK "COSMIC-like desktop variables detected" || record WARN "Could not prove COSMIC from environment variables"

section "Core commands"
for c in dbus-send busctl systemctl pactl pw-cli pipewire xdg-desktop-portal; do
  if have "$c"; then record OK "$c found"; else record MISS "$c missing"; fi
done

section "PipeWire"
if systemctl --user is-active --quiet pipewire 2>/dev/null; then record OK "pipewire user service active"; else record WARN "pipewire user service not active or systemctl unavailable"; fi
if have pw-cli; then
  pw-cli info all >/dev/null 2>&1 && record OK "pw-cli can talk to PipeWire" || record WARN "pw-cli exists but could not query PipeWire"
fi

section "Portals"
if systemctl --user is-active --quiet xdg-desktop-portal 2>/dev/null; then record OK "xdg-desktop-portal active"; else record WARN "xdg-desktop-portal not active or systemctl unavailable"; fi

if have busctl; then
  busctl --user list 2>/dev/null | grep -q 'org.freedesktop.portal.Desktop' && record OK "Desktop portal DBus name present" || record MISS "Desktop portal DBus name not visible"
  has_portal_iface 'ScreenCast' && record OK "ScreenCast portal appears in DBus introspection" || record WARN "ScreenCast portal not proven by introspection"
  has_portal_iface 'RemoteDesktop' && record OK "RemoteDesktop portal appears in DBus introspection" || record WARN "RemoteDesktop portal not proven by introspection"
  has_portal_iface 'InputCapture' && record OK "InputCapture portal appears in DBus introspection" || record WARN "InputCapture portal not proven by introspection"
fi

section "Portal backend packages/processes"
ps aux | grep -E 'xdg-desktop-portal-(cosmic|gnome|kde|wlr|gtk)' | grep -v grep || record WARN "No obvious portal backend process found"
if [ -n "$portal_backend_file" ]; then
  if [ "$JSON_MODE" -eq 0 ]; then
    find /usr/share/xdg-desktop-portal/portals -maxdepth 1 -type f 2>/dev/null | sed 's#^#[INFO] portal file: #'
  else
    record INFO "Portal backend file detected: $portal_backend_file"
  fi
else
  record WARN "Portal backend directory not found or no common backend file matched"
fi

section "Input injection fallback"
if [ -e /dev/uinput ]; then record OK "/dev/uinput exists"; else record WARN "/dev/uinput missing; uinput fallback may need kernel module or permissions"; fi
if have ydotool; then record OK "ydotool installed"; else record WARN "ydotool not installed; fallback input bridge unavailable"; fi
if systemctl --user is-active --quiet ydotool 2>/dev/null || systemctl is-active --quiet ydotool 2>/dev/null; then record OK "ydotool service appears active"; else record WARN "ydotool service not active or not installed"; fi

section "Network helpers"
if have tailscale; then record OK "tailscale installed"; else record WARN "tailscale not installed; LAN/local-only testing still possible"; fi
if [ "$JSON_MODE" -eq 0 ] && have ss; then ss -ltnp 2>/dev/null | grep -E ':5900|:3389|:8080|:8443|:9000' || info "No common remote-control dev ports listening"; fi

section "Recommendation"
viewer_mode="blocked-missing-portals"
control_mode="none"
recommendation="Gather real-machine data first"

if has_portal_iface 'ScreenCast'; then
  record OK "Try viewer-only portal/PipeWire prototype first"
  viewer_mode="portal-viewer-possible"
  recommendation="Start with viewer mode via ScreenCast + PipeWire"
else
  record WARN "ScreenCast portal is not proven; compositor/portal support may block native capture"
fi

if has_portal_iface 'RemoteDesktop'; then
  record OK "Native remote-control portal may be possible"
  control_mode="portal-control-possible"
  recommendation="Test native portal control before any privileged fallback"
elif [ -e /dev/uinput ] || have ydotool; then
  record WARN "Native remote-control portal not proven; use explicit uinput/ydotool fallback only with user consent"
  control_mode="viewer-plus-uinput-fallback"
  if [ "$viewer_mode" = "portal-viewer-possible" ]; then
    recommendation="Use ScreenCast for viewing and ydotool/uinput only as opt-in control fallback"
  fi
else
  record MISS "No safe input-control path detected yet"
fi

if [ "$JSON_MODE" -eq 1 ]; then
  json_add "session_type" "\${XDG_SESSION_TYPE:-unknown}"
  json_add "current_desktop" "\${XDG_CURRENT_DESKTOP:-unknown}"
  json_add "desktop_session" "\${DESKTOP_SESSION:-unknown}"
  json_add "viewer_mode" "$viewer_mode"
  json_add "control_mode" "$control_mode"
  json_add "recommendation" "$recommendation"
  json_add "portal_backend_file" "$portal_backend_file"
  printf '{\n%s\n}\n' "$JSON_LINES"
fi
`;

const args = new Set(process.argv.slice(2));

if (args.has('--emit-bash')) {
  console.log(script.replaceAll('\\${', '${'));
} else {
  console.log('COSMIC Remote Kit doctor generator');
  console.log('');
  console.log('Generate Linux doctor script:');
  console.log('  node ./prototype/cosmic-remote-check.js --emit-bash > ./scripts/cosmic-remote-doctor.sh');
  console.log('');
  console.log('Then copy/run on Pop!_OS COSMIC:');
  console.log('  bash cosmic-remote-doctor.sh');
  console.log('');
  console.log('Optional JSON mode on Linux:');
  console.log('  bash cosmic-remote-doctor.sh --json');
}
