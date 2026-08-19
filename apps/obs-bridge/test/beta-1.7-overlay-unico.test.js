import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

test('Bridge serve Overlay Studio na raiz e preserva legado em /legacy', async () => {
  const server = await read('server.mjs');
  assert.match(server, /const studioRoot=/);
  assert.match(server, /const legacyRoot=/);
  assert.match(server, /pathname\.startsWith\("\/legacy\/"\)/);
  assert.match(server, /await serve\(overlayRoot,overlayPath,response\)/);
});

test('Bridge adapta regiões legadas para regiões Studio', async () => {
  const server = await read('server.mjs');
  assert.match(server, /ticker:"legacy-disabled"/);
  assert.match(server, /"side-alert":"legacy-disabled"/);
  assert.match(server, /function normalizeCommand/);
});

test('Cabine e Multicabine publicam somente pela arquitetura Studio atual', async () => {
  const control = await read('public/control.js');
  const multicabine = await read('public/multicabine.js');
  assert.match(control, /publishStudioSnapshot/);
  assert.match(multicabine, /publishStudioRegions/);
  assert.match(multicabine, /publishCommand/);
  for (const source of [control, multicabine]) {
    assert.doesNotMatch(source, /region:\s*['"]ticker['"]/);
    assert.doesNotMatch(source, /region:\s*['"]side-alert['"]/);
  }
});

test('Mesa Editorial publica somente regiões Studio', async () => {
  const editorial = await read('public/editorial.js');
  const html = await read('public/editorial.html');
  assert.match(editorial, /editorial-highlight/);
  assert.match(editorial, /resolveStudioRegion/);
  assert.match(editorial, /buildStudioPayload/);
  assert.doesNotMatch(editorial, /region:\s*channel/);
  assert.doesNotMatch(editorial, /region:\s*['"]ticker['"]/);
  assert.doesNotMatch(editorial, /region:\s*['"]side-alert['"]/);
  assert.match(html, /value="editorial-highlight"/);
  assert.doesNotMatch(html, /value="studio-breaking-ticker"/);
});
