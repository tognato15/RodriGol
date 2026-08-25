import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const control=read('public/control.js');
const index=read('public/index.html');
const store=read('public/data-store.js');
const portal=read('public/portal/index.html');
const presentation=read('public/match-presentation.js');

test('editar ou excluir evento reconstrói placar sem falhar nos pênaltis',()=>{
  assert.match(control,/let homeScore = 0, awayScore = 0, penaltiesHome = 0, penaltiesAway = 0/);
  assert.match(control,/state\.events = state\.events\.filter/);
  assert.match(control,/rebuildFromEvents\(\); saveState\(\)/);
});

test('gravações remotas da mesma cobertura são serializadas',()=>{
  assert.match(store,/const remoteWriteChains = new Map\(\)/);
  assert.match(store,/const previous=remoteWriteChains\.get\(key\)\|\|Promise\.resolve\(\)/);
  assert.match(store,/remoteWriteChains\.set\(key,request\)/);
});

test('cabine oferece os dois tempos e intervalo da prorrogação',()=>{
  assert.match(index,/EXTRA_TIME_FIRST_HALF/);
  assert.match(index,/EXTRA_TIME_HALFTIME/);
  assert.match(index,/EXTRA_TIME_SECOND_HALF/);
  assert.match(control,/90 \* 60/);
  assert.match(control,/105 \* 60/);
});

test('motor canônico reconhece períodos detalhados da prorrogação',()=>{
  assert.match(presentation,/EXTRA_TIME_FIRST_HALF/);
  assert.match(presentation,/1º TEMPO DA PRORROGAÇÃO/);
  assert.match(presentation,/EXTRA_TIME_SECOND_HALF/);
});

test('relógio do Portal usa clockStartedAt persistido e não a abertura da página',()=>{
  assert.match(portal,/const startedRaw=clock\.startedAt/);
  assert.match(portal,/const origin=Number\.isFinite\(started\)&&started>0\?started/);
});
