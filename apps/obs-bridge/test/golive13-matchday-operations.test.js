import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('Go-Live 1.3 Cabine não grava ao apenas selecionar tipo de evento', async()=>{
  const code=await read('public/control.js');
  assert.match(code,/state\.selectedType = button\.dataset\.type; document\.querySelectorAll/);
  assert.doesNotMatch(code,/state\.selectedType = button\.dataset\.type; saveState\(\); render\(\)/);
});

test('Go-Live 1.3 publica evento sem bloquear a Cabine esperando rede', async()=>{
  const code=await read('public/control.js');
  assert.match(code,/Promise\.allSettled\(\[publishScoreboard\(\),publishStudio(?:Snapshot|LiveUpdate)\(\)\]\)/);
  assert.match(code,/function renderEventFast\(\)/);
});

test('Go-Live 1.3 oferece cobranças de pênaltis separadas do placar', async()=>{
  const html=await read('public/index.html');
  const code=await read('public/control.js');
  const server=await read('server.mjs');
  assert.match(html,/PENALTY_SCORED/);
  assert.match(html,/PENALTY_MISSED/);
  assert.match(code,/penaltiesHome/);
  assert.match(code,/PÊNALTIS.*penaltiesHome/s);
  assert.match(server,/penalties:\{/);
});

test('Go-Live 1.3 mata-mata de ida e volta aguarda os dois jogos', async()=>{
  const code=await read('public/match-lifecycle.js');
  assert.match(code,/tie\.firstLegMatchId&&tie\.secondLegMatchId&&matchFinished\(tie\.firstLegMatchId\)&&matchFinished\(tie\.secondLegMatchId\)/);
  assert.match(code,/if\(!tieComplete\)\{tie\.winnerClubId=''/);
});

test('Go-Live 1.3 deduplica eventos do Portal por conteúdo e não pelo id da fonte', async()=>{
  const code=await read('server.mjs');
  const start=code.indexOf('function mergeUniquePublicEvents');
  const end=code.indexOf('function richestPlayers',start);
  const block=code.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.doesNotMatch(block,/String\(event\.id/);
  assert.match(block,/String\(event\.type/);
  assert.match(block,/String\(event\.player/);
});
