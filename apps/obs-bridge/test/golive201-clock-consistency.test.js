import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('../public/portal/index.html', import.meta.url), 'utf8');

test('estado público preserva direção do relógio ao reconstruir a partida', () => {
  assert.match(server, /coverageIsAuthoritative\?\(coverage\.clockDirection\?\?'UP'\)/);
});

test('Portal usa a direção central do relógio também na página da partida', () => {
  assert.match(portal, /clock\.direction\|\|clock\.clockDirection\|\|match\?\.clockDirection\|\|'UP'/);
  assert.match(portal, /String\(clock\.direction\|\|clock\.clockDirection/);
});
