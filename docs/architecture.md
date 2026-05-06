# Cosmic Remote Bridge Architecture

## Goal

Let a user remotely view and control a Pop!_OS COSMIC Wayland session from another computer/browser, with an honest secure model.

## Components

```text
Browser Client / Mac app / Windows app
  │
  │ WebRTC / secure websocket
  ▼
Cosmic Remote Bridge relay (optional)
  │
  ▼
Cosmic Remote Bridge host agent
  ├─ Video adapter
  │   └─ XDG Desktop Portal ScreenCast → PipeWire frames
  ├─ Input adapter
  │   ├─ Preferred: XDG RemoteDesktop/InputCapture portal
  │   └─ Fallback: ydotool/uinput bridge
  ├─ Pairing/auth
  └─ Health/doctor API
```

## MVP 1: Doctor + capability detection

Before building the actual streamer, we need to know what the target machine supports.

Doctor checks:

- Is session Wayland?
- Is desktop COSMIC?
- Is PipeWire running?
- Is `xdg-desktop-portal` running?
- Is a COSMIC portal backend available?
- Does DBus expose ScreenCast / RemoteDesktop portal names?
- Is `/dev/uinput` present?
- Is `ydotool` installed?
- Are firewall/Tailscale options present?

Output:

- human-readable report
- later: JSON report

## MVP 2: Viewer-only prototype

Capture the screen and display it in a browser.

Preferred implementation:

- Rust daemon using `ashpd` / DBus portal calls
- PipeWire frame consumer
- WebRTC transport

Simpler temporary prototype:

- use existing portal/pipewire capture tools if available
- stream MJPEG/WebSocket on localhost/LAN

## MVP 3: Control prototype

Input path options:

1. Portal input if COSMIC supports it.
2. `ydotoold` bridge if user explicitly enables it.
3. Rust uinput bridge later for tighter control.

Do not hide this behind magic. Input control is sensitive.

## Pairing model

- Service starts bound to `127.0.0.1` by default.
- User explicitly enables LAN/Tailscale bind.
- Pairing creates one-time token.
- Browser client must authenticate before viewer/control.
- Viewer-only and control permissions are separate.

## Host-agent module boundaries

The new `bridge/` scaffold should evolve roughly like this:

```text
bridge/src/
  main.rs                # CLI entrypoint
  app.rs                 # service lifecycle orchestration
  doctor.rs              # capability detection + recommendation
  config.rs              # bind/relay/token/safety flags
  models.rs              # shared capability + control event types
  portal/
    screencast.rs        # ScreenCast session creation / source selection
    remote_desktop.rs    # portal-native input control path
    session.rs           # request/session handles
  pipewire/
    capture.rs           # PipeWire node/frame consumption
  input/
    adapter.rs           # adapter trait + selection rules
    portal.rs            # portal-native control adapter
    ydotool.rs           # ydotool/uinput fallback contract
  relay.rs               # host ↔ relay capability/session publishing
```

## Suggested repo layout later

```text
cosmic-remote-kit/
  bridge/          # Rust host agent scaffold now, real daemon later
  relay/           # signaling prototype
  web/             # browser prototype
  prototype/       # JS/bash diagnostics and experiments
  scripts/         # install/doctor scripts
  docs/            # research/architecture/test notes
```

## First real Linux implementation plan

1. Run doctor script on a Pop!_OS COSMIC machine.
2. Capture output and classify supported modes.
3. If ScreenCast portal works, create viewer-only daemon.
4. If RemoteDesktop/InputCapture is absent, add `ydotool` fallback adapter.
5. Stabilize the relay/client message contract before real transport work.
6. Add WebRTC browser client.
