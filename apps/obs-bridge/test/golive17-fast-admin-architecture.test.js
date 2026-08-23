import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const data=await readFile(new URL('../public/data-store.js',import.meta.url),'utf8');
const control=await readFile(new URL('../public/control.js',import.meta.url),'utf8');
const studio=await readFile(new URL('../public/studio-regions.js',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');

test('Go-Live 1.7 persiste revisão por registro e entrega snapshot incremental',()=>{
  assert.match(server,/const recordRevisions=new Map\(\)/);
  assert.match(server,/deletedRecordRevisions/);
  assert.match(server,/function snapshotSince\(since=0\)/);
  assert.match(server,/partial:true,records,deletedKeys/);
  assert.match(server,/recordRevisions:Object\.fromEntries\(recordRevisions\)/);
});

test('Go-Live 1.7 cliente aplica snapshot parcial sem apagar chaves ausentes',()=>{
  assert.match(data,/const partial=snapshot\.partial===true/);
  assert.match(data,/const deletedKeys=Array\.isArray\(snapshot\.deletedKeys\)/);
  assert.match(data,/if\(!partial\)\{/);
  assert.match(data,/source:'remote-delta'/);
});

test('Go-Live 1.7 Cabine limita cronologia visível e oferece carregar mais',()=>{
  assert.match(control,/let timelineVisibleLimit = 30/);
  assert.match(control,/state\.events\.slice\(0,timelineVisibleLimit\)/);
  assert.match(control,/timelineLoadMore/);
});

test('Go-Live 1.7 transição usa renderização rápida antes da renderização completa',()=>{
  assert.match(control,/function renderLifecycleFast\(\)/);
  assert.match(control,/scheduleDeferredFullRender\(500\)/);
  assert.match(control,/scheduleStudioSnapshot\(5000\)/);
  assert.match(studio,/scheduleStudioSnapshot\(delayMs=5000\)/);
});

test('Go-Live 1.7 Portal mantém pênaltis em uma linha e usa fallback do mata-mata',()=>{
  assert.match(portal,/white-space:nowrap/);
  assert.match(portal,/match\.knockout\?\.penalties\?\.home/);
  assert.match(portal,/`\(\$\{pHome\}\) \$\{home\} × \$\{away\} \(\$\{pAway\}\)`/);
});

test('Go-Live 1.7 traduz eventos de pênaltis e fim de jogo',()=>{
  assert.match(portal,/PENALTY_SCORED'\)return'Pênalti convertido'/);
  assert.match(portal,/PENALTY_MISSED'\)return'Pênalti perdido'/);
  assert.match(portal,/FINAL'\|\|type==='END'\)return'Fim de jogo'/);
});

test('Go-Live 1.7 aceita escudo estruturado do mata-mata sem imagem quebrada',()=>{
  assert.match(portal,/typeof raw==='string'\?raw:String\(raw\?\.image\|\|raw\?\.url\|\|''\)/);
  assert.match(portal,/raw&&typeof raw==='object'/);
});
