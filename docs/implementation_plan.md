# Implementation Plan

Last updated: 2026-05-05

## What primary-source research says now

- The COSMIC portal backend currently advertises `Access`, `FileChooser`, `Screenshot`, `Settings`, and `ScreenCast` in its `cosmic.portal` file. It does **not** advertise `RemoteDesktop` or `InputCapture` there.
- The upstream portal specs define `ScreenCast`, `RemoteDesktop`, and `InputCapture` as separate interfaces. That means a COSMIC remote-control starter should assume **screen sharing may be possible before input control is**.
- `ydotool` remains a Linux `uinput`-based fallback and requires the persistent `ydotoold` daemon, which in turn needs access to `/dev/uinput`.

Primary sources:

- COSMIC portal manifest: https://raw.githubusercontent.com/pop-os/xdg-desktop-portal-cosmic/master/data/cosmic.portal
- xdg-desktop-portal `ScreenCast`: https://raw.githubusercontent.com/flatpak/xdg-desktop-portal/main/data/org.freedesktop.portal.ScreenCast.xml
- xdg-desktop-portal `RemoteDesktop`: https://raw.githubusercontent.com/flatpak/xdg-desktop-portal/main/data/org.freedesktop.portal.RemoteDesktop.xml
- xdg-desktop-portal `InputCapture`: https://raw.githubusercontent.com/flatpak/xdg-desktop-portal/main/data/org.freedesktop.portal.InputCapture.xml
- ydotool project: https://github.com/ReimuNotMoe/ydotool

## Recommended delivery phases

### Phase 0 — Machine truth first

1. Run the doctor script on a real Pop!_OS COSMIC machine.
2. Save raw output.
3. Classify machine into one of:
   - `portal-viewer-possible`
   - `portal-control-possible`
   - `viewer-plus-uinput-fallback`
   - `blocked-missing-portals`

Exit criteria:
- We know whether COSMIC exposes only ScreenCast or more than that.
- We know whether `/dev/uinput` and `ydotoold` are realistic fallback options.

### Phase 1 — Viewer-only localhost prototype

Goal: prove browser viewing without pretending control works.

Pieces:
- Linux-side daemon skeleton that performs capability detection.
- Session model for `unknown`, `viewer-ready`, `control-ready`.
- Browser client that polls capability state and shows a placeholder stream panel.
- Relay/client contract for capability publication, permission state, and future viewer/control messages.
- Optional fake stream mode for UI work before PipeWire integration.

Exit criteria:
- Browser client loads locally.
- Health endpoint reports mode and missing requirements.
- UI makes clear whether control is unavailable.

### Phase 2 — Real ScreenCast integration

Preferred path:
- Rust daemon using `ashpd` to request portal access.
- PipeWire consumer for frames.
- WebRTC or temporary MJPEG/WebSocket transport.

Important note:
- This repo does **not** claim that COSMIC remote input is currently available.
- If ScreenCast works but remote input does not, stop at viewer mode and say so clearly.

Exit criteria:
- On a COSMIC machine with working ScreenCast, user can approve screen share and see frames remotely.

### Phase 3 — Explicit control fallback

If COSMIC still lacks `RemoteDesktop` / `InputCapture`:
- Add opt-in local input bridge using `ydotoold`.
- Restrict to localhost or trusted-network bind by default.
- Require explicit pairing token.
- Log every control session.
- Offer viewer-only mode separately.
- Keep a narrow adapter contract so a future native portal path can replace the backend without changing the client event model.

Exit criteria:
- Mouse move/click and simple key send work through the local bridge.
- Security model is visible and documented.

### Phase 4 — Native portal control if COSMIC grows support

When COSMIC backend advertises `RemoteDesktop` and/or `InputCapture`:
- Prefer that path over `uinput` fallback.
- Keep fallback behind explicit advanced setup only.

Exit criteria:
- Control works without privileged device injection.

## Immediate next tasks for Viplove

1. Run `bash cosmic-remote-doctor.sh` on the Pop!_OS COSMIC machine.
2. Inspect whether the portal backend lists `cosmic.portal` and whether DBus introspection shows `ScreenCast` only or also `RemoteDesktop`.
3. If Rust is available on that machine, run `cd bridge && cargo check` and `cargo run -- doctor --json`.
4. If ScreenCast works, start the prototype web client from this repo and verify capability reporting.
5. If control is needed before native portal support exists, test whether `ydotoold` + `/dev/uinput` can be enabled safely on that machine.

## Strong assumptions still pending real-machine confirmation

- Assumption: the COSMIC backend's portal manifest reflects the practical feature surface on the target machine.
- Assumption: a Pop!_OS COSMIC session will expose `org.freedesktop.portal.Desktop` normally through `xdg-desktop-portal`.
- Assumption: WebRTC is the likely long-term transport, but the repo should use a simpler fake/local transport first for UI and state testing.
