import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const multi = fs.readFileSync(new URL('../public/multicabine.js', import.meta.url), 'utf8');
const multiOps = fs.readFileSync(new URL('../public/multicabine-ops.js', import.meta.url), 'utf8');
const control = fs.readFileSync(new URL('../public/control.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('Go-Live 1.6 Multicabine não redesenha toda a grade a cada segundo', () => {
  assert.match(multi, /renderClocksOnly\(\)/);
  assert.doesNotMatch(multi, /setInterval\(\(\) => \{[\s\S]{0,500}render\(\);[\s\S]{0,500}publishOnAir\(\);[\s\S]{0,100}\}, 1000\)/);
});

test('Go-Live 1.6 reduz health da Multicabine para 30 segundos', () => {
  assert.match(multi, /setInterval\(\(\)=>\{if\(!document\.hidden\)health\(\);\},30000\)/);
  assert.doesNotMatch(multi, /setInterval\(health, 2500\)/);
});

test('Go-Live 1.6 não republica Overlay por mudanças remotas', () => {
  assert.match(multi, /window\.addEventListener\('rodrigol:data-changed',\(\)=>scheduleRender\(120\)\)/);
  assert.doesNotMatch(multi, /rodrigol:data-changed'[^\n]*publishOnAir\(true\)/);
});

test('Go-Live 1.6 agrupa quatro regiões Studio em um único batch', () => {
  assert.match(multi, /publishCommands\(\[\{type:'update',region:'round-scoreboard'/);
});

test('Go-Live 1.6 mantém ações rápidas visíveis antes da consolidação', () => {
  assert.match(multi, /function updateRowFast\(match,state\)/);
  assert.match(multi, /function persist\(match,state\)\{updateRowFast\(match,state\);/);
});

test('Go-Live 1.6 preserva atualização pendente quando publicação anterior ainda está em voo', () => {
  assert.match(multi, /pendingOnAirForce/);
  assert.match(multi, /if\(publishingOnAir\)\{pendingOnAirForce=pendingOnAirForce\|\|force;return;\}/);
});

test('Go-Live 1.6 resumo operacional da Multicabine deixa de recalcular a cada 5 segundos', () => {
  assert.match(multiOps, /60000/);
  assert.doesNotMatch(multiOps, /setInterval\(render,5000\)/);
});

test('Go-Live 1.6 Cabine inicia com estado neutro em vez de partida demo', () => {
  assert.match(html, /<body class="cabine-loading">/);
  assert.match(html, /id="homeName">CARREGANDO\.\.\.<\/strong>/);
  assert.match(html, /id="awayName">CARREGANDO\.\.\.<\/strong>/);
  assert.doesNotMatch(html, /id="homeName">PALMEIRAS/);
  assert.match(control, /document\.body\.classList\.remove\('cabine-loading'\)/);
});
