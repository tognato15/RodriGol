import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function mergeRegionPayload(currentPayload, incoming, replace = false) {
  if (Array.isArray(incoming)) return incoming;
  const base = replace ? {} : (currentPayload && typeof currentPayload === 'object' && !Array.isArray(currentPayload) ? { ...currentPayload } : {});
  const merged = { ...base, ...incoming };
  const unset = incoming?.unset;
  if (Array.isArray(unset)) {
    for (const key of unset) {
      if (key && typeof key === 'string') delete merged[key];
    }
  }
  delete merged.unset;
  delete merged.replace;
  return merged;
}

test('show substitui payload anterior (não faz merge)', () => {
  const current = { clock: '44:59', period: '1º TEMPO', homeScore: 1 };
  const incoming = { period: 'INTERVALO', clock: '', clockVisible: false, homeScore: 1 };
  const result = mergeRegionPayload(current, incoming, true);
  assert.equal(result.period, 'INTERVALO');
  assert.equal(result.clock, '');
  assert.equal('finalClock' in result, false);
});

test('update com unset remove relógio obsoleto', () => {
  const current = { clock: '45:00', finalClock: '45:00', period: '1º TEMPO' };
  const incoming = { period: 'INTERVALO', clock: '', unset: ['clock', 'finalClock'] };
  const result = mergeRegionPayload(current, incoming, false);
  assert.equal(result.period, 'INTERVALO');
  assert.equal('clock' in result, false);
  assert.equal('finalClock' in result, false);
});

test('update parcial de relógio preserva placar', () => {
  const current = { homeScore: 2, awayScore: 1, period: '2º TEMPO', clock: '67:00' };
  const incoming = { clock: '67:01', unset: ['finalClock'] };
  const result = mergeRegionPayload(current, incoming, false);
  assert.equal(result.homeScore, 2);
  assert.equal(result.clock, '67:01');
  assert.equal(result.period, '2º TEMPO');
});

test('server.mjs implementa merge com unset e replace em show', async () => {
  const server = await readFile(root + 'server.mjs', 'utf8');
  assert.match(server, /function mergeRegionPayload/);
  assert.match(server, /incoming\?\.unset/);
  assert.match(server, /const replace=command\.type==="show"/);
  assert.match(server, /const bridgeVersion=bridgePackage\.version/);
  assert.match(server, /version:bridgeVersion/);
});
