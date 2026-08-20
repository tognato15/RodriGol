import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Go-Live 1.5.1 publica regioes Studio em lote', async () => {
  const bridge = await read('public/bridge-client.js');
  const regions = await read('public/studio-regions.js');
  assert.match(bridge, /export function publishCommands/);
  assert.match(bridge, /\/api\/commands\/batch/);
  assert.match(regions, /publishCommands\(\[/);
  assert.doesNotMatch(regions, /await Promise\.all\(\[\s*command\(\{type:'show',region:'round-scoreboard'/);
});

test('Go-Live 1.5.1 Bridge aceita lote de comandos', async () => {
  const server = await read('server.mjs');
  assert.match(server, /pathname==="\/api\/commands\/batch"/);
  assert.match(server, /commands\.length>20/);
  assert.match(server, /commands\.map\(command=>broadcast\(command,"api-batch"\)\)/);
});

test('Go-Live 1.5.1 grava dados no disco de forma agrupada sem bloquear resposta HTTP', async () => {
  const server = await read('server.mjs');
  assert.match(server, /DATA_PERSIST_DEBOUNCE_MS=120/);
  assert.match(server, /function flushQueuedPersistence/);
  assert.match(server, /queuePersistData\(\)\.catch\(\(\)=>\{\}\);json\(response,202/);
  assert.doesNotMatch(server, /dataRevision\+=1;await queuePersistData\(\);const envelope=broadcastDataChange/);
});

test('Go-Live 1.5.1 expõe tempo interno de processamento dos comandos', async () => {
  const server = await read('server.mjs');
  assert.match(server, /serverTimingMs/);
  assert.match(server, /performance\.now\(\)/);
});
