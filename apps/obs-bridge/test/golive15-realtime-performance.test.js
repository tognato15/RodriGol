import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Go-Live 1.5 usa WebSocket como caminho principal para sincronizacao central', async () => {
  const source = await read('public/data-store.js');
  assert.match(source, /createManagedSocket/);
  assert.match(source, /type!=='data-change'/);
  assert.match(source, /setInterval\(pollRemoteData,60000\)/);
  assert.doesNotMatch(source, /setInterval\(pollRemoteData,7000\)/);
});

test('Go-Live 1.5 reduz health polling da Cabine', async () => {
  const source = await read('public/control.js');
  assert.match(source, /setInterval\(\(\) => \{ if\(!document\.hidden\)health\(\); \}, 30000\)/);
  assert.doesNotMatch(source, /health\(\); \}, 5000\)/);
});

test('Go-Live 1.5 nao arquiva o historico completo a cada lance', async () => {
  const source = await read('public/control.js');
  const start = source.indexOf('async function publishEvent()');
  const end = source.indexOf('function undoLast()', start);
  const block = source.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.doesNotMatch(block, /archiveCurrentCoverage\('Timeline atualizada'\)/);
  assert.match(source, /archiveCurrentCoverage\('Cobertura encerrada pelo operador'\)/);
});

test('Go-Live 1.5 publica scoreboard incremental depois da primeira carga', async () => {
  const source = await read('public/control.js');
  assert.match(source, /scoreboardFullPublished/);
  assert.match(source, /type: full\?'show':'update'/);
  assert.match(source, /scoreboardDynamicPayload/);
});

test('Go-Live 1.5 separa update imediato e snapshot pesado adiado', async () => {
  const regions = await read('public/studio-regions.js');
  const control = await read('public/control.js');
  assert.match(regions, /export async function publishStudioLiveUpdate/);
  assert.match(regions, /export function scheduleStudioSnapshot/);
  assert.match(control, /publishStudioLiveUpdate\(\)/);
  assert.match(control, /scheduleStudioSnapshot\(5000\)/);
});


test('Go-Live 1.5 Portal recebe invalidação em tempo real por SSE', async () => {
  const server = await read('server.mjs');
  const portal = await read('public/portal/index.html');
  assert.match(server, /\/api\/public\/events/);
  assert.match(server, /text\/event-stream/);
  assert.match(portal, /new EventSource\('\/api\/public\/events'\)/);
  assert.match(portal, /30000/);
});

test('Go-Live 1.5 reduz render secundario da Cabine em repouso', async () => {
  const source = await read('public/control.js');
  assert.match(source, /renderOtherMatches\(\); \}, 15000/);
});
