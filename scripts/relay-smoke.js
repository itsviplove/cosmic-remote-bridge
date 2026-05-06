#!/usr/bin/env node
import { spawn } from 'node:child_process';

const port = 8899;
const child = spawn(process.execPath, ['./relay/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

const wait = ms => new Promise(r => setTimeout(r, ms));
const api = async (path, options = {}) => {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) }
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  return body;
};

try {
  await wait(500);
  const room = await api('/room/create', { method: 'POST', body: '{}' });
  const auth = { authorization: `Bearer ${room.token}` };
  await api(`/room/${room.id}/capability`, { method: 'POST', headers: auth, body: JSON.stringify({ viewer_mode: 'portal-viewer-possible', control_mode: 'viewer-plus-uinput-fallback' }) });
  await api(`/room/${room.id}/send/client`, { method: 'POST', headers: auth, body: JSON.stringify({ type: 'ping' }) });
  const hostPoll = await api(`/room/${room.id}/poll/host`, { headers: auth });
  if (hostPoll.messages.length !== 1 || hostPoll.messages[0].body.type !== 'ping') throw new Error('message routing failed');
  const status = await api(`/room/${room.id}/status`, { headers: auth });
  console.log(JSON.stringify({ ok: true, room: status.id, capability: status.capability }, null, 2));
} finally {
  child.kill();
}
