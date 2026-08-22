import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const studio = fs.readFileSync(new URL('../public/studio-regions.js', import.meta.url), 'utf8');
const multi = fs.readFileSync(new URL('../public/multicabine.js', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('../public/portal/index.html', import.meta.url), 'utf8');
const overlay = fs.readFileSync(new URL('../../overlay-studio/public/app.js', import.meta.url), 'utf8');
const overlayHtml = fs.readFileSync(new URL('../../overlay-studio/public/index.html', import.meta.url), 'utf8');

test('Go-Live 1.6.1 Portal prioriza placar live sobre snapshot consolidado', () => {
  const start = server.indexOf('const collections=[');
  const end = server.indexOf('].filter(Array.isArray);', start);
  const block = server.slice(start, end);
  assert.ok(block.indexOf('round-scoreboard') < block.indexOf('public-match-data'));
});

test('Go-Live 1.6.1 payload Studio carrega placar de pênaltis da cobertura', () => {
  assert.match(studio, /penaltiesHome:Number\(s\.penaltiesHome\)\|\|0,penaltiesAway:Number\(s\.penaltiesAway\)\|\|0/);
  assert.match(multi, /penaltiesHome:Number\(state\.penaltiesHome\)\|\|0,penaltiesAway:Number\(state\.penaltiesAway\)\|\|0/);
});

test('Go-Live 1.6.1 Portal usa formato de disputa separado do placar regulamentar', () => {
  assert.match(portal, /function penaltyScoreText/);
  assert.match(portal, /`\(\$\{pHome\}\) \$\{home\} × \$\{away\} \(\$\{pAway\}\)`/);
  assert.match(portal, /class="main-score">\$\{esc\(penaltyScoreText\(match,false\)\)\}/);
});

test('Go-Live 1.6.1 Overlay exibe pênaltis ao redor do placar principal e nos cards', () => {
  assert.match(overlayHtml, /id="homePenalty"/);
  assert.match(overlayHtml, /id="awayPenalty"/);
  assert.match(overlay, /function penaltyScoreText/);
  assert.match(overlay, /paintMainPenalties\(state,beforeKickoff\)/);
  assert.match(overlay, /const score=beforeKickoff\?scheduledDisplay\(m\):penaltyScoreText\(m,false\)/);
});
