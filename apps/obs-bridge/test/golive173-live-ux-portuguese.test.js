import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const portal=fs.readFileSync(new URL('../public/portal/index.html',import.meta.url),'utf8');
const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
const studio=fs.readFileSync(new URL('../../overlay-studio/public/app.js',import.meta.url),'utf8');

test('portal traduz fases técnicas para português',()=>{
  assert.match(portal,/SECOND_HALF.*2º TEMPO/);
  assert.match(portal,/FIRST_HALF.*1º TEMPO/);
  assert.match(portal,/PENALTIES.*PÊNALTIS/);
});

test('card do portal usa coluna temporal e faixa inferior de goleadores',()=>{
  assert.match(portal,/match-goal-strip/);
  assert.match(portal,/home-goals/);
  assert.match(portal,/away-goals/);
  assert.match(portal,/portalMinuteLabel/);
});

test('goleadores recuperam minuto a partir dos eventos',()=>{
  assert.match(portal,/goalEventEntries/);
  assert.match(portal,/if\(row\.minute\)continue/);
});

test('estado canônico envia última ação ao scoreboard do Studio',()=>{
  assert.match(server,/latestScoreboardAction:compactCanonicalAction\(latest\)/);
  assert.match(server,/function publicEventLabel/);
});

test('sumário do Studio traduz eventos técnicos',()=>{
  assert.match(studio,/PENALTY_SCORED:"PÊNALTI CONVERTIDO"/);
  assert.match(studio,/SECOND_HALF_START:"INÍCIO DO 2º TEMPO"/);
  assert.match(studio,/YELLOW_CARD:"CARTÃO AMARELO"/);
});
