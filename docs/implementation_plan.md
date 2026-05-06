# Implementation Plan

Last updated: 2026-05-06

## Current truth

- COSMIC advertises `ScreenCast` in its portal manifest.
- `RemoteDesktop` / `InputCapture` are not yet proven there.
- So the build should stay honest: **viewer first, control second**.

## Phases

### Phase 0 — Verify machine truth
- Run the doctor script on a real Pop!_OS COSMIC machine.
- Save raw output.
- Classify the machine:
  - `portal-viewer-possible`
  - `portal-control-possible`
  - `viewer-plus-uinput-fallback`
  - `blocked-missing-portals`

### Phase 1 — Viewer-only prototype
- Daemon capability detection
- Browser state polling
- Placeholder stream panel
- Clear control/unavailable state

### Phase 2 — ScreenCast integration
- `ashpd` portal access
- PipeWire frame capture
- WebRTC or simple local transport

### Phase 3 — Explicit control fallback
- `ydotoold` / `uinput`
- explicit pairing token
- localhost or trusted bind by default
- session logging

### Phase 4 — Native portal control
- Prefer `RemoteDesktop` / `InputCapture` when available
- keep fallback behind advanced setup

## Immediate next tasks

1. Run `bash cosmic-remote-doctor.sh --json` on the COSMIC machine.
2. Check portal support and DBus names.
3. If Rust is available, run `cd bridge && cargo check` and `cargo run -- doctor --json`.
4. If ScreenCast works, move straight to viewer-only prototype work.
