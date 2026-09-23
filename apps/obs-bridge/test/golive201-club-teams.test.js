import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const clubsHtml=fs.readFileSync(new URL('../public/clubs.html',import.meta.url),'utf8');
const clubsJs=fs.readFileSync(new URL('../public/clubs.js',import.meta.url),'utf8');
const matchesJs=fs.readFileSync(new URL('../public/matches.js',import.meta.url),'utf8');

test('editor de clubes permite várias modalidades',()=>{
  assert.match(clubsHtml,/name="sports"/);
  assert.match(clubsHtml,/Um mesmo clube pode participar de várias modalidades/);
});

test('clube pode cadastrar equipes e categorias internas',()=>{
  assert.match(clubsHtml,/Equipes \/ categorias/);
  assert.match(clubsHtml,/Adicionar equipe\/categoria/);
  assert.match(clubsJs,/teams=teamUnits/);
});

test('equipe interna separa modalidade categoria gênero e nível',()=>{
  for(const field of ['sport','category','gender','level']) assert.match(clubsJs,new RegExp(`data-team-field=\\"${field}\\"`));
});

test('clubes antigos continuam disponíveis como equipe principal',()=>{
  assert.match(matchesJs,/if\(!teams\.length\)return \[\{club:c,team:null\}\]/);
});

test('editor de partidas filtra equipes pela modalidade',()=>{
  assert.match(matchesJs,/teamOptionsForSport\(sport\)/);
  assert.match(matchesJs,/normalizeSport\(t\.sport\)===sport/);
});

test('partida preserva clube e identifica a equipe interna escolhida',()=>{
  assert.match(matchesJs,/homeTeamId:/);
  assert.match(matchesJs,/awayTeamId:/);
  assert.match(matchesJs,/m\.homeTeamId,m\.awayTeamId/);
});
