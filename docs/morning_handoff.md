# Morning Handoff for Viplove

## What this project is now

`cosmic-remote-kit` is the starter repo for a TeamViewer-like tool for **Pop!_OS COSMIC Wayland → Mac/Windows/browser**.

It currently contains:

- Deep research and product plan.
- COSMIC capability doctor script.
- Local web dashboard prototype.
- Signaling relay prototype for future browser/host communication.
- A Rust host-agent scaffold in `bridge/` with portal/PipeWire/input module boundaries.

## Main truth

COSMIC currently advertises `ScreenCast` in its portal manifest, but `RemoteDesktop` / `InputCapture` are not proven there. So we should build:

1. **screen viewing first** via ScreenCast + PipeWire;
2. **control second** via native RemoteDesktop portal if available;
3. otherwise explicit `ydotoold`/`uinput` fallback.

## Test this first on Pop!_OS COSMIC

Copy or open this repo on the Pop!_OS machine, then run:

```bash
cd cosmic-remote-kit
bash scripts/cosmic-remote-doctor.sh --json | tee cosmic-capabilities.json
```

Important fields:

- `viewer_mode`
- `control_mode`
- `recommendation`
- `portal_backend_file`

If `viewer_mode` says `portal-viewer-possible`, we proceed to the PipeWire viewer prototype.

If `control_mode` says `portal-control-possible`, great — COSMIC native control may work.

If `control_mode` says `viewer-plus-uinput-fallback`, control requires explicit `ydotoold`/`uinput` setup.

## Try local dashboard demo

On any machine with Node 18+:

```bash
npm run demo
npm run web
```

Open:

```text
http://127.0.0.1:8787
```

## Try relay prototype

```bash
npm run relay-smoke
npm run relay
```

Relay URL:

```text
http://127.0.0.1:8790
```

The relay is signaling/message scaffolding only. It does not capture screen or inject input yet.

## Morning test commands I recommend

On the Pop!_OS COSMIC machine:

```bash
cd cosmic-remote-kit
bash scripts/cosmic-remote-doctor.sh --json | tee cosmic-capabilities.json
```

If Rust is installed there:

```bash
cd cosmic-remote-kit/bridge
cargo check
cargo run -- --help
cargo run -- doctor --json
```

Then, back in repo root, validate the existing JS prototypes:

```bash
cd ../
npm run relay-smoke
npm run demo
npm run web
```

## Next build I recommend

Turn the `bridge/` scaffold into a real Rust host agent:

```text
cosmic-remote-host
  doctor
  portal-viewer
  relay-connect
  ydotool-input-adapter
```

First feature: viewer-only browser stream.

Second feature: guarded control adapter.
