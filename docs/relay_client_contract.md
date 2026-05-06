# Relay + Client Contract (Prototype)

This document defines the current message vocabulary between:

- **host agent** (`cosmic-remote-host` later)
- **relay** (`relay/server.js` now)
- **browser/native client** (future web app)

It is intentionally small so the browser and host can evolve without pretending video/control is finished.

## Current relay endpoints

- `POST /room/create`
- `POST /room/:id/capability`
- `POST /room/:id/send/:side`
- `GET /room/:id/poll/:side`
- `GET /room/:id/status`

`side` is `host` or `client`.

All room-specific endpoints require:

```http
Authorization: Bearer <room-token>
```

## Room lifecycle

1. Host or coordinator creates a room.
2. Relay returns `id` and `token`.
3. Host publishes capability snapshot.
4. Client polls status/capability before offering control UI.
5. Host and client exchange signaling/control messages.

## Capability payload

The host should publish a capability body shaped like:

```json
{
  "machine": "pop-os-cosmic",
  "viewerMode": "portal-viewer-possible",
  "controlMode": "viewer-only",
  "recommendation": "Viewer first; native control not confirmed.",
  "notes": [
    "ScreenCast available",
    "RemoteDesktop not confirmed"
  ]
}
```

## Proposed client -> host messages

### Request session metadata

```json
{
  "type": "hello",
  "client": {
    "name": "browser",
    "platform": "macos|windows|linux|web"
  }
}
```

### Request viewer attach

```json
{
  "type": "viewer_attach",
  "stream": {
    "preferredTransport": "webrtc",
    "preferredCodec": "vp9"
  }
}
```

### Request control enable

```json
{
  "type": "control_request",
  "mode": "portal|ydotool",
  "reason": "interactive support session"
}
```

### Send input event

```json
{
  "type": "control_event",
  "event": {
    "type": "pointer_move",
    "x": 1200,
    "y": 480,
    "absolute": true
  }
}
```

## Proposed host -> client messages

### Capability snapshot / mode transition

```json
{
  "type": "capability",
  "viewerMode": "portal-viewer-possible",
  "controlMode": "viewer-plus-uinput-fallback",
  "updatedAt": "2026-05-06T00:00:00Z"
}
```

### Pairing / permission state

```json
{
  "type": "permission_state",
  "viewerGranted": true,
  "controlGranted": false,
  "controlReason": "waiting for host-side consent"
}
```

### Viewer transport offer placeholder

```json
{
  "type": "viewer_offer",
  "transport": "webrtc",
  "sdp": "...future..."
}
```

### Control result

```json
{
  "type": "control_result",
  "accepted": false,
  "adapter": "none",
  "message": "Host is in viewer-only mode"
}
```

## Security expectations

- Relay is signaling only and should not imply host trust by itself.
- Viewer and control permissions should remain separate states.
- `ydotool` mode should never auto-enable just because the client asks.
- Default host bind remains localhost until the user explicitly expands scope.

## Short-term implementation order

1. Publish stable capability snapshots from the host.
2. Add client-visible permission state.
3. Add viewer attach handshake.
4. Add control request + explicit adapter selection.
5. Only then add real WebRTC and real input dispatch.
