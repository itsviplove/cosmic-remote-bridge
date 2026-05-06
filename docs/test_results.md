# Test Results

Date: 2026-05-05
Environment used for repo checks: OpenClaw workspace on Windows host, not a Pop!_OS COSMIC machine.

## Commands run

### Passed

```powershell
node .\prototype\cosmic-remote-check.js
```

```powershell
node .\prototype\cosmic-remote-check.js --emit-bash
```

```powershell
node .\web\server.js --help
```

```powershell
node .\scripts\run-demo.js --once
```

### Not meaningful on this host

```powershell
bash .\scripts\cosmic-remote-doctor.sh
```

Reason: this doctor script targets a Linux Pop!_OS COSMIC session and checks Linux-specific services, DBus names, and `/dev/uinput`.

## What was verified

- Node package scripts still work for doctor-script generation.
- Prototype daemon/web server entrypoint parses and starts.
- Demo mode writes a capability snapshot and exits cleanly.
- Research docs were updated with current primary-source links.

## What still needs real COSMIC testing

- Whether `xdg-desktop-portal-cosmic` on the target machine exposes working `ScreenCast`.
- Whether DBus introspection shows any `RemoteDesktop` or `InputCapture` capability in practice.
- Whether `ydotoold` plus `/dev/uinput` is available and acceptable as a fallback.
- Whether browser-to-daemon access works on localhost/LAN on Pop!_OS.

## 2026-05-06 deep-research/prototype pass

Passed locally on Windows/Node runtime:

```bash
node --check .\prototype\cosmic-remote-check.js
node --check .\relay\server.js
node --check .\web\server.js
node --check .\scripts\run-demo.js
node --check .\scripts\relay-smoke.js
npm run doctor-script
node .\web\server.js --help
npm run relay-smoke
npm run demo
```

Observed output highlights:

- `npm run doctor-script` regenerated `scripts/cosmic-remote-doctor.sh` successfully.
- `node .\web\server.js --help` printed the local UI usage for `http://127.0.0.1:8787`.
- `npm run relay-smoke` completed with `{ "ok": true }` and a room/capability exchange.
- `npm run demo` wrote `.local-state/capabilities.json` successfully.

Rust toolchain check on this workspace host:

```powershell
cargo --version
rustc --version
```

Result:

- Both commands failed with `CommandNotFoundException` on this Windows workspace host.
- Because of that, this pass added a **Rust host-agent source scaffold** under `bridge/` but could not run `cargo fmt` / `cargo check` here.

Still requires real Pop!_OS COSMIC hardware:

```bash
bash scripts/cosmic-remote-doctor.sh --json
cd bridge && cargo check && cargo run -- doctor --json
```

That result decides whether the first real native prototype should be portal-only viewer or viewer + explicit uinput fallback.
