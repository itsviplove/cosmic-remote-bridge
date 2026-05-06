# Cosmic Remote Bridge Product Plan

## Product vision

A TeamViewer-like remote access tool optimized for **Pop!_OS COSMIC Wayland**, usable from **macOS, Windows, Linux, and browsers**.

## Non-negotiable design principles

- Wayland-safe: use portals when available.
- Honest modes: never claim control works if the compositor does not expose it.
- Secure by default: localhost-only until paired; no public bind by default.
- Explicit control consent: privileged input bridge is opt-in.
- Kill switch: visible tray/terminal state and emergency stop.

## Architecture

```text
Mac/Windows Browser Client
  │
  │ HTTPS/WebRTC or LAN relay
  ▼
Cosmic Remote Bridge Host Agent on Pop!_OS
  ├─ Capability Doctor
  ├─ Video Capture Adapter
  │   └─ XDG ScreenCast Portal → PipeWire → encoder
  ├─ Input Adapter
  │   ├─ Native: XDG RemoteDesktop portal
  │   └─ Fallback: ydotoold/uinput
  ├─ Pairing/Auth
  ├─ Audit Log
  └─ Emergency Stop
```

## Milestones

### Milestone 0 — Capability proof

Status: mostly done in this repo.

- Doctor script checks COSMIC/Wayland/portals/PipeWire/uinput.
- JSON output provides mode recommendation.
- Web dashboard can display capability snapshot.

### Milestone 1 — Browser dashboard + pairing mock

Goal: make the UX feel like a product before native capture.

Deliverables:

- Host says: `cosmic-remote host --pair`
- Browser opens device page.
- One-time pairing code.
- Viewer/control capability shown honestly.

### Milestone 2 — Viewer-only native prototype

Goal: remote screen view from COSMIC to browser.

Host implementation options:

- Rust preferred: `ashpd` for portal, PipeWire bindings, WebRTC stack.
- Prototype fallback: use external portal-compatible capture command if available.

Deliverables:

- User approves ScreenCast portal prompt.
- Browser receives live screen.
- No input control yet.

### Milestone 3 — Hybrid control prototype

Goal: mouse/keyboard control when native `RemoteDesktop` is unavailable.

Deliverables:

- Explicit setup command for `ydotoold`/`uinput`.
- Pairing-required input endpoint.
- Rate-limited mouse move/click/key events.
- Emergency local kill switch.

### Milestone 4 — Native portal control

Goal: replace fallback where COSMIC supports `RemoteDesktop`.

Deliverables:

- Portal `RemoteDesktop` session.
- Pointer/keyboard event injection through portal methods/EIS.
- No privileged fallback needed in this mode.

### Milestone 5 — TeamViewer-style polish

- Device list
- Unattended pairing where safe
- Tailscale/LAN connectivity mode
- File transfer
- Clipboard sync
- Session recording/audit
- Auto-update later

## Recommended stack

### Host agent

- Rust for real implementation
- DBus portal client: `ashpd` or zbus
- PipeWire client: Rust PipeWire bindings or GStreamer pipeline
- WebRTC: webrtc-rs, GStreamer WebRTC, or LiveKit-style later

### Web/client

- Browser-first HTML/JS
- Later Tauri/Electron wrappers for Mac/Windows if needed

### Connectivity

- Phase 1: localhost/LAN
- Phase 2: Tailscale-friendly direct connections
- Phase 3: relay service if needed

## Morning test path

On the Pop!_OS COSMIC machine:

```bash
cd cosmic-remote-kit
bash scripts/cosmic-remote-doctor.sh --json | tee cosmic-capabilities.json
```

Then send/check:

- `viewer_mode`
- `control_mode`
- whether `ScreenCast`, `RemoteDesktop`, `InputCapture` were detected
- whether `/dev/uinput` and `ydotool` are available

That tells us whether to build Mode A, B, or C first.
