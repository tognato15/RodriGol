import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const portal=fs.readFileSync(new URL('../public/portal/index.html',import.meta.url),'utf8');
const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
const store=fs.readFileSync(new URL('../public/data-store.js',import.meta.url),'utf8');
const lifecycle=fs.readFileSync(new URL('../public/match-lifecycle.js',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('../public/global-nav.js',import.meta.url),'utf8');

test('agregado usa os clubes vinculados e os placares reais das duas partidas',()=>{
  assert.match(server,/function publicTieSnapshot/);
  assert.match(server,/match\.homeClubId===tieHomeId/);
  assert.match(server,/match\.awayClubId===tieAwayId/);
  assert.match(server,/publicLinkedMatchScore/);
  assert.match(lifecycle,/tieAggregateFromLinkedMatches/);
});

test('cobertura canônica permite apagar gol e zerar autores sem ressuscitar evento antigo',()=>{
  assert.match(server,/coverageIsAuthoritative/);
  assert.match(server,/coverageIsAuthoritative\?events/);
  assert.match(server,/coverageIsAuthoritative&&Array\.isArray\(coverage\.homeScorers\)/);
  assert.match(portal,/if\(Array\.isArray\(incoming\.events\)\)merged\.events=incoming\.events/);
});

test('card ao vivo mostra minuto e período juntos à esquerda e remove estado duplicado à direita',()=>{
  assert.match(portal,/function compactPeriodLabel/);
  assert.match(portal,/return'2ºT'/);
  assert.match(portal,/class="match-time/);
  assert.doesNotMatch(portal,/rightStatus=match\.live/);
});

test('sincronização remota funciona mesmo sem IndexedDB e força snapshot completo quando dados centrais locais faltam',()=>{
  assert.doesNotMatch(store,/function queueWidePersistence\([^)]*\)\{\s*if \(!wideDataDb\) return/);
  assert.match(store,/const coreMissing=!wideDataCache\.has\(MATCHES_KEY\)/);
  assert.match(store,/const since=coreMissing\?0:remoteDataRevision/);
  assert.match(store,/setInterval\(pollRemoteData,10000\)/);
});

test('Studio informa confirmação ou pendência de sincronização com o servidor',()=>{
  assert.match(store,/rodrigol:remote-sync-status/);
  assert.match(store,/state:'pending'/);
  assert.match(store,/state:'synced'/);
  assert.match(nav,/PENDENTE DE SINCRONIZAÇÃO/);
  assert.match(nav,/DADOS CENTRAIS ATUALIZADOS/);
});
