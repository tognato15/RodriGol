import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');

test('Go-Live 1.7.2 reconhece fases em português como estado ao vivo',()=>{
  for(const phase of ['1º TEMPO','2º TEMPO','INTERVALO','EM ANDAMENTO','PÊNALTIS','PRORROGAÇÃO']) assert.match(server,new RegExp(phase));
  assert.match(server,/\['FIRST_HALF','1º TEMPO'/);
  assert.match(server,/\['SECOND_HALF','2º TEMPO'/);
});

test('Go-Live 1.7.2 mantém pré-jogo fora da descoberta ao vivo',()=>{
  assert.match(server,/live:!beforeKickoff&&!isFinal/);
  assert.match(server,/if\(match\?\.live\)byId\.set/);
});

test('Go-Live 1.7.2 usa equipes da partida como fallback visual do agregado',()=>{
  assert.match(server,/baseMatch\?\.knockout\?\.tieHome\|\|baseMatch\?\.home/);
  assert.match(server,/baseMatch\?\.knockout\?\.tieAway\|\|baseMatch\?\.away/);
});

test('Go-Live 1.7.2 compacta pênaltis no placar principal',()=>{
  assert.match(portal,/main-score\.has-penalties/);
  assert.match(portal,/has-penalties/);
  assert.match(portal,/white-space:nowrap/);
});

test('Go-Live 1.7.2 remove o slider editorial da home pública',()=>{
  assert.match(portal,/\.portal-main \.editorial-hero\{display:none!important/);
});
