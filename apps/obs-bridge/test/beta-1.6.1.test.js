import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('Beta 1.6.1 oculta relógio em jogo final, intervalo e em andamento sem relógio', async () => {
  const { buildMatchPresentationPayload, MATCH_PHASE } = await import('../public/match-presentation.js');
  const match = { id: 'x', date: '2026-08-03', time: '16:00' };
  const final = buildMatchPresentationPayload(match, { phase: MATCH_PHASE.FINAL, elapsedSeconds: 5400 });
  const unknown = buildMatchPresentationPayload(match, { phase: MATCH_PHASE.LIVE_UNKNOWN, elapsedSeconds: 0 });
  const half = buildMatchPresentationPayload(match, { phase: MATCH_PHASE.HALFTIME, elapsedSeconds: 2700 });
  assert.equal(final.clock, '');
  assert.equal(unknown.clock, '');
  assert.equal(half.clock, '');
  assert.equal(final.clockVisible, false);
});
