#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const publicDir = path.join(root, 'public');
const stateDir = path.join(root, '..', '.local-state');
const stateFile = path.join(stateDir, 'capabilities.json');
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '127.0.0.1';

if (process.argv.includes('--help')) {
  console.log('Usage: node ./web/server.js');
  console.log('Serves the prototype web client and capability API on http://' + host + ':' + port);
  process.exit(0);
}

fs.mkdirSync(stateDir, { recursive: true });

function defaultCapabilities() {
  return {
    updatedAt: new Date().toISOString(),
    machine: 'unknown',
    viewerMode: 'unknown',
    controlMode: 'unknown',
    recommendation: 'Run the Linux doctor on the COSMIC machine and paste results here.',
    notes: [
      'This is a local starter UI only.',
      'No PipeWire capture or input injection is wired yet.'
    ]
  };
}

function readCapabilities() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    const fallback = defaultCapabilities();
    fs.writeFileSync(stateFile, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

function serveFile(res, filePath) {
  try {
    const body = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const type = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.css' ? 'text/css; charset=utf-8'
      : ext === '.js' ? 'application/javascript; charset=utf-8'
      : 'text/plain; charset=utf-8';
    send(res, 200, body, type);
  } catch {
    send(res, 404, 'Not found');
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (url.pathname === '/api/health') {
    send(res, 200, JSON.stringify({ ok: true, capabilities: readCapabilities() }, null, 2), 'application/json; charset=utf-8');
    return;
  }

  if (url.pathname === '/api/capabilities' && req.method === 'GET') {
    send(res, 200, JSON.stringify(readCapabilities(), null, 2), 'application/json; charset=utf-8');
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    serveFile(res, path.join(publicDir, 'index.html'));
    return;
  }

  if (url.pathname === '/app.js') {
    serveFile(res, path.join(publicDir, 'app.js'));
    return;
  }

  if (url.pathname === '/styles.css') {
    serveFile(res, path.join(publicDir, 'styles.css'));
    return;
  }

  send(res, 404, 'Not found');
});

server.listen(port, host, () => {
  console.log(`COSMIC Remote prototype UI listening on http://${host}:${port}`);
});
