import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../public/${path}`, import.meta.url), 'utf8');

test('Beta 1.5.7.1 normaliza filtros legados e deduplica transições', async () => {
  const multicabine = await read('multicabine.js');
  const control = await read('control.js');
  const store = await read('data-store.js');
  assert.match(multicabine, /matchCompetitionFilter/);
  assert.match(multicabine, /systemEventGroup/);
  assert.match(control, /systemTimelineGroup/);
  assert.match(store, /journeyCompetitionMatches/);
  assert.match(store, /journeyRoundMatches/);
});
