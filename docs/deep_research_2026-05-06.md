# Deep Research: TeamViewer-like Remote Access for Pop!_OS COSMIC Wayland

Date: 2026-05-06

## Executive conclusion

A TeamViewer-like product for **Pop!_OS COSMIC Wayland** is feasible, but it cannot be built like old X11 VNC software.

The practical product strategy is:

1. **Viewer first:** use COSMIC's `ScreenCast` portal + PipeWire for screen frames.
2. **Control second:** prefer `RemoteDesktop` portal when COSMIC implements it; otherwise use an explicit privileged Linux input bridge (`ydotoold`/`uinput`) with strong pairing/auth and clear consent.
3. **Cross-platform clients:** browser-first client works on macOS and Windows; native clients can come later.
4. **Unattended access:** limited under pure portal mode because Wayland portals generally require user approval; reliable unattended access needs either compositor support or a privileged local helper.

## What primary sources say

### COSMIC portal capability today

The COSMIC portal manifest currently lists:

- `Access`
- `FileChooser`
- `Screenshot`
- `Settings`
- `ScreenCast`

It does **not** list `RemoteDesktop` or `InputCapture` in the checked manifest.

Source: https://raw.githubusercontent.com/pop-os/xdg-desktop-portal-cosmic/master/data/cosmic.portal

Impact:

- Screen viewing is the realistic first target.
- Native portal-based keyboard/mouse control is not proven on COSMIC yet.

### ScreenCast portal is the right capture path

XDG Desktop Portal `ScreenCast` exposes `OpenPipeWireRemote`, which returns a PipeWire remote file descriptor where screencast streams are available.

Source: https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.ScreenCast.html

Impact:

- The Linux host daemon should use DBus portal calls and PipeWire, not direct framebuffer scraping.
- A Rust daemon is the right long-term choice because it can handle DBus, PipeWire, WebRTC, and native Linux input cleanly.

### RemoteDesktop portal is the clean control path

The XDG `RemoteDesktop` portal is specifically meant to create remote desktop sessions, select devices, start sessions, and send pointer/keyboard/touch events. It can also connect to EIS/libei.

Source: https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.RemoteDesktop.html

Impact:

- If COSMIC adds this portal, we can implement control without a privileged fallback.
- Until then, our software should detect absence and switch modes.

### InputCapture is not enough for TeamViewer-style immediate control

The `InputCapture` portal allows input capture, but the compositor decides when capture becomes active, usually through triggers such as pointer barriers. The docs explicitly say there is no way for an app to activate immediate input capture.

Source: https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.InputCapture.html

Impact:

- `InputCapture` helps software-KVM style workflows, not full remote desktop control by itself.
- For TeamViewer-like remote control, `RemoteDesktop` or `uinput` fallback matters more.

### TeamViewer's own Wayland limitations confirm this direction

TeamViewer states that Wayland support depends on compositor capabilities and xdg-desktop-portal. It notes limitations such as approval being required on first connection, no system-level/pre-login remote control in portal mode, and behavior varying by compositor.

Source: https://community.teamviewer.com/English/discussion/122410/teamviewer-support-on-wayland-experimental-state

Impact:

- TeamViewer has the same fundamental constraint; this is not just an implementation gap.
- Our edge can be COSMIC-specific detection, honest modes, and a controlled fallback.

### ydotool/uinput fallback

`ydotool` works outside X11 by using Linux `uinput` to emulate an input device. Its daemon generally needs access to `/dev/uinput`, often root or special permissions.

Source: https://github.com/ReimuNotMoe/ydotool

Impact:

- This is the most practical near-term control fallback.
- It must be opt-in and secured because it can inject real system-wide input.

## Competitive feature target

TeamViewer-like features we can target:

- unattended device list / pairing
- browser client from Mac/Windows
- viewer-only mode
- remote keyboard/mouse control
- clipboard sync later
- file transfer later
- LAN/Tailscale-first connectivity
- audit log and emergency stop

Features that are hard on COSMIC Wayland right now:

- pre-login/login-screen control
- lock-screen control
- fully unattended portal-only sessions
- control without a privileged helper if `RemoteDesktop` is absent

## Recommended product decision

Build **Cosmic Remote Bridge** with three modes:

| Mode | Name | Requirements | User promise |
|---|---|---|---|
| A | Native Portal | `ScreenCast` + `RemoteDesktop` | secure Wayland-native view/control |
| B | Hybrid | `ScreenCast` + `ydotoold`/`uinput` | practical TeamViewer-like control after explicit setup |
| C | Viewer Only | `ScreenCast` only | reliable screen sharing, no control |

Default should be C or A depending on doctor results. Mode B must require explicit enabling.

## Next engineering move

1. Run `scripts/cosmic-remote-doctor.sh --json` on real Pop!_OS COSMIC.
2. If `viewer_mode=portal-viewer-possible`, implement Rust PipeWire ScreenCast viewer.
3. If `control_mode=viewer-plus-uinput-fallback`, implement guarded `ydotoold` input adapter.
4. Use the existing web dashboard/relay skeleton for Mac/Windows browser access.
