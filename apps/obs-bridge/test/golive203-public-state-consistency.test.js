import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('../public/portal/index.html', import.meta.url), 'utf8');

test('a fase canônica não pode ser rebaixada por beforeKickoff antigo', () => {
  assert.match(server, /const phaseRank=publicPhaseRank\(phase\)/);
  assert.match(server, /const beforeKickoff=phaseRank>0&&phaseRank<=20/);
  assert.match(server, /const isFinal=phaseRank>=90/);
});

test('cards públicos exibem a faixa de gols somente em futebol e futsal', () => {
  assert.match(portal, /showGoalStrip=\['FOOTBALL','FUTSAL'\]\.includes\(sportKey\)/);
  assert.match(portal, /goalStrip=showGoalStrip\?/);
});

test('a modalidade pública continua sendo lida do campo sport ou modality', () => {
  assert.match(portal, /match\.sport\|\|match\.modality\|\|'FOOTBALL'/);
});
