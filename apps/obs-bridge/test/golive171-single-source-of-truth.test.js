import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');
const overlay=await readFile(new URL('../../overlay-studio/public/app.js',import.meta.url),'utf8');
const overlayHtml=await readFile(new URL('../../overlay-studio/public/index.html',import.meta.url),'utf8');

test('Go-Live 1.7.1 prioriza cobertura persistida para placar canônico',()=>{
  assert.match(server,/coverage\.homeScore\?\?firstValue/);
  assert.match(server,/coverage\.awayScore\?\?firstValue/);
  assert.match(server,/stateRevision:publicStateRevision\(matchId\)/);
});

test('Go-Live 1.7.1 usa mata-mata persistido para agregado e pênaltis',()=>{
  assert.match(server,/function publicCanonicalKnockout/);
  assert.match(server,/publicRecord\('rodrigol-knockout-v1'/);
  assert.match(server,/aggregate:\{home:Number\(tie\.aggregateHome\)/);
});

test('Go-Live 1.7.1 rejeita estado público mais antigo no Portal',()=>{
  assert.match(portal,/incomingRevision<baseRevision\)return base/);
  assert.match(portal,/merged\.stateRevision=Math\.max/);
});

test('Go-Live 1.7.1 mantém pênaltis compactos em uma linha',()=>{
  assert.match(portal,/match-list-score[^}]*white-space:nowrap/);
  assert.match(portal,/word-break:keep-all/);
});

test('Go-Live 1.7.1 logo do Portal sempre volta para hoje',()=>{
  assert.match(portal,/brand-link'\)\?\.addEventListener\('click',\(\)=>\{portalSelectedDate=today\(\)/);
});

test('Go-Live 1.7.1 servidor republica estado canônico ao Studio',()=>{
  assert.match(server,/function scheduleCanonicalStudioBroadcast/);
  assert.match(server,/region:'round-scoreboard'/);
  assert.match(server,/region:'scoreboard'/);
  assert.match(server,/key\.startsWith\('rodrigol-coverage-v1:'\).*scheduleCanonicalStudioBroadcast/);
});

test('Go-Live 1.7.1 Overlay inicia neutro sem partida fictícia',()=>{
  assert.match(overlayHtml,/<body class="studio-loading">/);
  assert.match(overlayHtml,/id="homeName">CARREGANDO\.\.\./);
  assert.doesNotMatch(overlay,/const demoMatches=/);
  assert.match(overlay,/document\.body\.classList\.remove\('studio-loading'\)/);
});
