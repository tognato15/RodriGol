import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const server=fs.readFileSync(path.join(root,'server.mjs'),'utf8');
const portal=fs.readFileSync(path.join(root,'public','portal','index.html'),'utf8');

test('página Classificações busca todas as tabelas publicadas',()=>{
  assert.match(portal,/fetch\('\/api\/public\/standings'/);
  assert.match(portal,/loadHome\(true\)\.then\(\(\)=>loadStandingsFull\(\)\)/);
  assert.match(portal,/stageGroups\.get\(stage\)\.push\(table\)/);
});

test('território América é normalizado para América do Sul',()=>{
  assert.match(server,/function publicContinentLabel/);
  assert.match(server,/return "América do Sul"/);
  assert.match(portal,/function publicContinentName/);
  assert.match(portal,/return'América do Sul'/);
});

test('rodadas públicas carregam fase e grupo para contextualizar ida e volta',()=>{
  assert.match(server,/stageName:stage\?\.name/);
  assert.match(server,/groupName:group\?\.name/);
  assert.match(portal,/function roundDisplayName/);
  assert.match(portal,/parts\.push\(round\.stageName\)/);
});

test('hotsite renderiza confrontos de mata-mata com links de ida e volta',()=>{
  assert.match(portal,/function knockoutMarkup/);
  assert.match(portal,/IDA E VOLTA/);
  assert.match(portal,/knockoutMatchLink\(tie\.firstLegMatchId,'IDA'/);
  assert.match(portal,/knockoutMatchLink\(tie\.secondLegMatchId,'VOLTA'/);
  assert.match(portal,/AGREGADO/);
});

test('aba Jogos inicializa todos os navegadores de rodada e mantém partidas visíveis',()=>{
  assert.match(portal,/querySelectorAll\('\[data-round-browser\]'\)/);
  assert.match(portal,/bindRoundBrowser\(root,item\)/);
  assert.match(portal,/group\.matches\.map\(competitionMatchItem\)\.join\(''\)/);
  assert.match(portal,/data-competition-tab="games"/);
});
