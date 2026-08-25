import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const server=fs.readFileSync(path.join(root,'server.mjs'),'utf8');
const portal=fs.readFileSync(path.join(root,'public','portal','index.html'),'utf8');
const competitions=fs.readFileSync(path.join(root,'public','competitions.js'),'utf8');
const competitionsHtml=fs.readFileSync(path.join(root,'public','competitions.html'),'utf8');

test('lista pública inclui competições sem depender de classificação publicada',()=>{
  assert.match(server,/return publicArray\(PUBLIC_KEYS\.competitions\)\.map/);
  assert.match(server,/matchCount/);
  assert.match(server,/hasStandings:tableCount>0/);
});

test('competição pública expõe fases, grupos e todas as tabelas ordenadas',()=>{
  assert.match(server,/stageOrder/);
  assert.match(server,/groupOrder/);
  assert.match(server,/const standings=publicStandings\(\)\.filter/);
  assert.match(portal,/standingStagesMarkup/);
});

test('hotsite organiza partidas por rodada e cada jogo leva à página da partida',()=>{
  assert.match(server,/PUBLIC_KEYS\.rounds/);
  assert.match(portal,/roundBrowserMarkup/);
  assert.match(portal,/data-round-select/);
  assert.match(portal,/href="#match=\$\{encodeURIComponent\(match\.id\|\|match\.matchId\|\|''\)\}"/);
});

test('campeonatos são agrupados territorialmente e ordenados por prioridade editorial',()=>{
  assert.match(portal,/competitionGroups/);
  assert.match(portal,/item\.continent/);
  assert.match(portal,/item\.country/);
  assert.match(portal,/Number\(a\.priority\|\|999\)/);
});

test('operador pode escolher destaques e prioridade no editor de competições',()=>{
  assert.match(competitionsHtml,/id="featured"/);
  assert.match(competitionsHtml,/Prioridade editorial/);
  assert.match(competitions,/featured:\$\('featured'\)\.value==='true'/);
});
