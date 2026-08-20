import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
const control = await readFile(new URL('../public/control.js', import.meta.url), 'utf8');

test('Go-Live 1.5.3 responde batch com ACK compacto sem ecoar payloads', () => {
  assert.match(server, /sequences:envelopes\.map\(item=>item\.sequence\)/);
  assert.doesNotMatch(server, /count:envelopes\.length,envelopes,serverTimingMs/);
});

test('Go-Live 1.5.3 serializa envelope WebSocket uma vez por comando', () => {
  assert.match(server, /function prepareSocketMessage/);
  assert.match(server, /const frame=prepareSocketMessage\(envelope\);for\(const socket of clients\)sendPrepared\(socket,frame\)/);
});

test('Go-Live 1.5.3 lifecycle publica feed leve e adia snapshot amplo', () => {
  assert.match(control, /publishStudioLiveUpdate\(\)\.catch\(error => log\(error\.message\)\); scheduleStudioSnapshot\(2500\);/);
  const setPhase = control.slice(control.indexOf('function setPhase'), control.indexOf('function makeEvent'));
  assert.doesNotMatch(setPhase, /publishStudioSnapshot\(\)/);
});

test('Go-Live 1.5.3 encerramento evita snapshot amplo bloqueante', () => {
  assert.match(control, /archiveCurrentCoverage\('Cobertura encerrada pelo operador'\); await publishScoreboard\(true\); await publishStudioLiveUpdate\(\); scheduleStudioSnapshot\(2500\)/);
});
