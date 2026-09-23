import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');

test('quartos e sets são reconhecidos como fases em andamento', () => {
  assert.match(server, /QUARTO\|PERÍODO\|PERIODO\|SET/);
  assert.match(server, /if\(\/\^\(\[1-5\]\)º\?\\s\*\(QUARTO\|PERÍODO\|PERIODO\|SET/);
});

test('a situação pública não volta para o status antigo de programado', () => {
  assert.match(server, /isFinal\?"FINAL":\(phase\|\|"EM ANDAMENTO"\)/);
});

test('a modalidade não é rebaixada para futebol quando existe modalidade específica', () => {
  assert.match(server, /sportCandidates\.find\(value=>value!=="FOOTBALL"\)/);
});
