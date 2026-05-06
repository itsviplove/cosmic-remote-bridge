# cosmic-remote-host

This directory is the planned Rust host agent for **Cosmic Remote Bridge**.

## Why it is a skeleton right now

The current workspace does not have `cargo` or `rustc`, so this pass provides a **source-level scaffold** and module boundaries rather than a compiled binary.

That still moves the project forward by locking in:

- host lifecycle shape
- doctor/capability model
- portal and PipeWire integration seams
- input adapter contracts for portal-native control vs `ydotoold` fallback
- relay/client handshake expectations

## Intended responsibilities

- detect host capabilities honestly
- run viewer-only mode when ScreenCast is available
- expose control only when an approved adapter is available
- connect to a relay or local client with explicit pairing
- keep viewer/control permissions separate

## Planned modules

- `src/main.rs` - CLI entrypoint
- `src/app.rs` - lifecycle orchestration
- `src/config.rs` - runtime config
- `src/models.rs` - shared capability/session models
- `src/doctor.rs` - capability detection and recommendations
- `src/portal/` - XDG portal session boundaries
- `src/pipewire/` - frame-capture boundary
- `src/input/` - control adapter traits and implementations
- `src/relay.rs` - relay handshake/session outline

## First compile/test commands to run on a Rust-enabled machine

```bash
cd bridge
cargo fmt
cargo check
cargo run -- --help
```

## First Pop!_OS COSMIC commands after that

```bash
cd cosmic-remote-kit
bash scripts/cosmic-remote-doctor.sh --json
cd bridge
cargo run -- doctor --json
```
