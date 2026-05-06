# Cosmic Remote Bridge

A research + prototype kit for remote control of **Pop!_OS COSMIC Wayland** sessions.

## Current focus

- Prove screen viewing first through `ScreenCast` + PipeWire
- Add control second through COSMIC portal support if available
- Fall back to explicit `ydotoold` / `/dev/uinput` only when needed

## What’s included

- Research docs and implementation plan
- COSMIC capability doctor script
- Local dashboard prototype
- Relay/signaling prototype
- Rust host-agent scaffold
- Smoke tests and handoff docs

## Quick start

```bash
cd cosmic-remote-kit
npm run doctor-script
npm run relay-smoke
npm run demo
npm run web
```

Open:

```text
http://127.0.0.1:8787
```

## Real-machine test

On a Pop!_OS COSMIC machine:

```bash
bash scripts/cosmic-remote-doctor.sh --json | tee cosmic-capabilities.json
```

## Roadmap

- Viewer-only stream prototype
- Real ScreenCast integration
- Guarded control adapter
- Optional browser client
- Safer fallback path with pairing token
