import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('../public/portal/index.html', import.meta.url), 'utf8');

test('publicação preserva a modalidade real do registro e da camada ao vivo', () => {
  assert.match(server, /sport:match\.sport\|\|match\.modality\|\|"FOOTBALL"/);
  assert.match(server, /sport:firstValue\(x=>x\?\.sport\|\|x\?\.modality,baseMatch\?\.sport\|\|baseMatch\?\.modality\|\|"FOOTBALL"\)/);
});

test('Portal traduz modalidades com aliases em português', () => {
  assert.match(portal, /BASQUETE:'Basquete'/);
  assert.match(portal, /BEISEBOL:'Beisebol'/);
  assert.match(portal, /function sportLabel\(value='FOOTBALL'\)/);
});
