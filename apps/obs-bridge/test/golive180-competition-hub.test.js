import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const portal=fs.readFileSync(new URL('../public/portal/index.html',import.meta.url),'utf8');
const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');

test('API pública expõe metadados completos da classificação',()=>{
  assert.match(server,/stageName:stage\.name/);
  assert.match(server,/groupName:group\.name/);
  assert.match(server,/goalsFor,goalsAgainst/);
  assert.match(server,/crest:publicClubAsset/);
});

test('API pública oferece lista e hotsite de competições publicadas',()=>{
  assert.match(server,/function publicCompetitions\(\)/);
  assert.match(server,/function publicCompetitionHub\(id\)/);
  assert.match(server,/\/api\/public\/competitions/);
});

test('classificação completa mostra estatísticas tradicionais',()=>{
  assert.match(portal,/fullStandingTable/);
  assert.match(portal,/>J<\/th><th>V<\/th><th>E<\/th><th>D<\/th><th>GP<\/th><th>GC<\/th><th>SG<\/th><th>PTS<\/th>/);
  assert.match(portal,/standingsFilters/);
});

test('portal possui central e hotsite de competição',()=>{
  assert.match(portal,/competitionCards/);
  assert.match(portal,/view-competition/);
  assert.match(portal,/loadCompetitionHub/);
  assert.match(portal,/hash\.startsWith\('competition='/);
});

test('tabelas podem representar fase e grupo sem assumir pontos corridos únicos',()=>{
  assert.match(portal,/table\.groupName\|\|table\.stageName\|\|table\.name/);
  assert.match(server,/stageType:stage\.type/);
  assert.match(server,/groupId:meta\.groupId/);
});
