#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stateFile = path.join(__dirname, '..', '.local-state', 'capabilities.json');

const snapshot = {
  updatedAt: new Date().toISOString(),
  machine: 'demo-localhost',
  viewerMode: 'portal-viewer-possible',
  controlMode: 'viewer-plus-uinput-fallback',
  recommendation: 'Demo snapshot only: on a real COSMIC host, verify ScreenCast first and treat input fallback as opt-in.',
  notes: [
    'This file can be replaced with parsed Linux doctor output later.',
    'No real portal or PipeWire probe is performed on this Windows host.'
  ]
};

fs.mkdirSync(path.dirname(stateFile), { recursive: true });
fs.writeFileSync(stateFile, JSON.stringify(snapshot, null, 2));
console.log('Wrote demo capability snapshot to', stateFile);

if (!process.argv.includes('--once')) {
  console.log('Tip: start the UI with: node ./web/server.js');
}
