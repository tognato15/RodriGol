import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const store=fs.readFileSync(new URL('../public/data-store.js',import.meta.url),'utf8');
const control=fs.readFileSync(new URL('../public/overlay-control.js',import.meta.url),'utf8');
const regions=fs.readFileSync(new URL('../public/studio-regions.js',import.meta.url),'utf8');
test('6.9 persiste cards manuais de jogo e escalação',()=>{assert.match(store,/getSidebarLowerState/);assert.match(store,/saveSidebarLowerState/);assert.match(control,/data-lower-add/);assert.match(control,/sidebarLowerPayload/);});
test('6.9 publica escalações e partidas na lateral inferior',()=>{assert.match(regions,/sidebarLowerPayload/);assert.match(regions,/type:'lineup'/);assert.match(regions,/starters/);});
