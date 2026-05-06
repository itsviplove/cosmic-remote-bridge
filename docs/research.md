# COSMIC / Wayland Remote Desktop Research

## Summary

A remote-control project for Pop!_OS COSMIC should be treated as a **Wayland compositor integration problem**, not a normal desktop app.

The viable architecture is:

- **Screen capture:** XDG Desktop Portal ScreenCast + PipeWire, if COSMIC portal/compositor support is present.
- **Input control:** official RemoteDesktop/InputCapture portals if/when supported; otherwise an explicit local privileged input bridge such as `uinput` / `ydotool`.
- **Transport:** WebRTC for browser access, or LAN-only websocket/MJPEG prototype for early testing.

## Known constraints

### Wayland security model

Wayland blocks arbitrary global screen scraping and input injection by normal apps. That is good security, but it means old X11 remote-control approaches are unreliable.

### COSMIC status risk

COSMIC is newer than GNOME/KDE and has its own compositor/session stack. We should not assume GNOME Remote Desktop APIs work unchanged.

### Portals matter

Remote desktop on modern Linux usually goes through XDG Desktop Portal APIs:

- `ScreenCast` — capture monitor/window streams, typically backed by PipeWire.
- `RemoteDesktop` — remote control/session APIs.
- `InputCapture` — newer portal for input capture/hand-off behavior.

If COSMIC's portal backend lacks one of these, the product must fall back gracefully.

## Recommended product modes

### Mode A — Native portal mode

Best UX, least hacky.

Requirements:

- COSMIC session exposes ScreenCast portal.
- RemoteDesktop/InputCapture portal support exists and works.

Pros:

- Secure permission prompts.
- No privileged input daemon.
- Future-proof.

Cons:

- May not be available yet on COSMIC.

### Mode B — Portal video + uinput input bridge

Most practical near-term prototype.

Requirements:

- ScreenCast/PipeWire works.
- User installs/enables a local input daemon using `/dev/uinput` or `ydotoold`.

Pros:

- Works around missing remote input portal.
- Honest and testable.

Cons:

- Needs explicit setup and security warning.
- Input bridge must be carefully sandboxed/authenticated.

### Mode C — Fallback docs only

If portals are missing, show exact missing pieces and recommend temporary alternatives like SSH/Tailscale plus existing tools, but do not pretend full remote control works.

## Important security principles

- Never expose control service publicly by default.
- Require pairing token or local network/Tailscale auth.
- Separate viewer-only mode from control mode.
- Make input bridge opt-in.
- Log when control is active.
- Provide an emergency kill command.

## Sources to verify during next internet pass

Use primary sources first:

- COSMIC compositor / portal repositories and issues.
- Flatpak XDG Desktop Portal docs.
- PipeWire ScreenCast examples.
- ydotool/uinput docs.
- GNOME/KDE remote desktop designs only as reference, not assumptions.
