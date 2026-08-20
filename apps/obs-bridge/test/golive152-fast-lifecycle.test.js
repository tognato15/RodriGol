import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dataStore = await readFile(new URL('../public/data-store.js', import.meta.url), 'utf8');
const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
const control = await readFile(new URL('../public/control.js', import.meta.url), 'utf8');

test('Go-Live 1.5.2 atualiza uma partida por patch sem reenviar a coleção completa', () => {
  assert.match(dataStore, /queueRemoteRecordPatch\('match',match\.id,match\)/);
  assert.match(server, /\/api\/data-patch\//);
  assert.match(server, /kind==="match"/);
});

test('Go-Live 1.5.2 replica patches incrementais por WebSocket', () => {
  assert.match(server, /type:"data-patch"/);
  assert.match(dataStore, /envelope\.type==='data-patch'/);
  assert.match(dataStore, /remote-ws-patch/);
});

test('Go-Live 1.5.2 arquiva resultado final por registro incremental', () => {
  assert.match(dataStore, /queueRemoteRecordPatch\('history',normalized\.matchId,normalized\)/);
  assert.match(server, /kind==="history"/);
});

test('Go-Live 1.5.2 mantém transição visual imediata antes da publicação do Studio', () => {
  assert.match(control, /render\(\); updateClockButton\(\); publishScoreboard\(\)\.catch/);
});
