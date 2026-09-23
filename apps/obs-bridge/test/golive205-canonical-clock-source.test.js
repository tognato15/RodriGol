import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('../public/portal/index.html', import.meta.url), 'utf8');

test('coverage persistido é a fonte canônica do relógio público', () => {
  assert.match(server, /coverageIsAuthoritative\?coverage\.elapsedSeconds/);
  assert.match(server, /coverageIsAuthoritative\?coverage\.clockRunning/);
  assert.match(server, /coverageIsAuthoritative\?\(coverage\.clockStartedAt\?\?null\)/);
  assert.match(server, /coverage\.clockDirection\?\?'UP'/);
});

test('portal completo mantém classificação e usa direção do relógio central', () => {
  assert.match(portal, /Classifica/);
  assert.match(portal, /clock\.direction/);
});
