#!/usr/bin/env node
import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 8790);
const HOST = process.env.HOST || '127.0.0.1';
const rooms = new Map();

function json(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error('invalid json')); }
    });
  });
}

function roomSnapshot(room) {
  return {
    id: room.id,
    createdAt: room.createdAt,
    hostSeenAt: room.hostSeenAt,
    clientSeenAt: room.clientSeenAt,
    capability: room.capability,
    pendingForHost: room.toHost.length,
    pendingForClient: room.toClient.length
  };
}

function getRoom(id) {
  const room = rooms.get(id);
  if (!room) throw new Error('room not found');
  return room;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      return json(res, 200, {
        name: 'Cosmic Remote Bridge Relay Prototype',
        warning: 'Signaling only. No video capture or input injection here.',
        endpoints: ['/room/create', '/room/:id/capability', '/room/:id/send/:side', '/room/:id/poll/:side']
      });
    }

    if (req.method === 'POST' && url.pathname === '/room/create') {
      const id = crypto.randomBytes(4).toString('hex');
      const token = crypto.randomBytes(16).toString('hex');
      rooms.set(id, { id, token, createdAt: new Date().toISOString(), hostSeenAt: null, clientSeenAt: null, capability: null, toHost: [], toClient: [] });
      return json(res, 201, { id, token, hostUrl: `/room/${id}/poll/host`, clientUrl: `/room/${id}/poll/client` });
    }

    const match = url.pathname.match(/^\/room\/([^/]+)\/(capability|send|poll|status)(?:\/([^/]+))?$/);
    if (!match) return json(res, 404, { error: 'not found' });
    const [, id, action, side] = match;
    const room = getRoom(id);
    const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (auth !== room.token) return json(res, 401, { error: 'bad token' });

    if (action === 'status' && req.method === 'GET') return json(res, 200, roomSnapshot(room));

    if (action === 'capability' && req.method === 'POST') {
      const body = await readBody(req);
      room.capability = { ...body, updatedAt: new Date().toISOString() };
      room.hostSeenAt = new Date().toISOString();
      return json(res, 200, { ok: true, room: roomSnapshot(room) });
    }

    if (action === 'send' && req.method === 'POST') {
      if (!['host', 'client'].includes(side)) return json(res, 400, { error: 'side must be host or client' });
      const body = await readBody(req);
      const msg = { from: side, at: new Date().toISOString(), body };
      if (side === 'host') { room.hostSeenAt = msg.at; room.toClient.push(msg); }
      else { room.clientSeenAt = msg.at; room.toHost.push(msg); }
      return json(res, 200, { ok: true });
    }

    if (action === 'poll' && req.method === 'GET') {
      if (!['host', 'client'].includes(side)) return json(res, 400, { error: 'side must be host or client' });
      const queue = side === 'host' ? room.toHost : room.toClient;
      const messages = queue.splice(0, 100);
      const now = new Date().toISOString();
      if (side === 'host') room.hostSeenAt = now; else room.clientSeenAt = now;
      return json(res, 200, { messages, room: roomSnapshot(room) });
    }

    return json(res, 405, { error: 'method not allowed' });
  } catch (err) {
    return json(res, err.message === 'room not found' ? 404 : 500, { error: err.message });
  }
});

if (process.argv.includes('--help')) {
  console.log(`Cosmic Remote Bridge relay prototype\n\nUsage:\n  node relay/server.js\n\nEnv:\n  HOST=127.0.0.1 PORT=8790\n\nThis is signaling/control-message scaffolding only. It does not capture video or inject input.`);
} else {
  server.listen(PORT, HOST, () => {
    console.log(`Cosmic Remote Bridge relay prototype listening on http://${HOST}:${PORT}`);
  });
}
