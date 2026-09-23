import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const control=read('../public/control.js');
const clubs=read('../public/clubs.js');
const clubsHtml=read('../public/clubs.html');
const matches=read('../public/matches.js');
const matchesHtml=read('../public/matches.html');
const portal=read('../public/portal/index.html');

test('clubes aceitam várias modalidades preservando compatibilidade com sport legado',()=>{
  assert.match(clubsHtml,/name="sports" value="BASKETBALL"/);
  assert.match(clubs,/sports:\s*\[?\s*\]?|sports,sport:sports\[0\]/);
  assert.match(matches,/clubSports\(c\)\.includes\(sport\)/);
});
test('futebol americano integra cadastros e portal',()=>{
  assert.match(matchesHtml,/AMERICAN_FOOTBALL/);
  assert.match(portal,/AMERICAN_FOOTBALL:'Futebol americano'/);
});
test('cabine de basquete usa eventos de 1 2 e 3 pontos',()=>{
  assert.match(control,/BASKETBALL:\['POINT_1','POINT_2','POINT_3'/);
  assert.match(control,/POINT_3: \{ label: '\+3 PONTOS'/);
});
test('rugby e futebol americano possuem pontuações próprias',()=>{
  assert.match(control,/RUGBY_TRY: \{ label: 'TRY'.*points: 5/);
  assert.match(control,/TOUCHDOWN: \{ label: 'TOUCHDOWN'.*points: 6/);
  assert.match(control,/FIELD_GOAL: \{ label: 'FIELD GOAL'.*points: 3/);
});
test('data padrão de nova partida usa calendário local e não UTC',()=>{
  assert.match(matches,/function localDateKey\(\)/);
  assert.match(matches,/\$\('date'\)\.value=localDateKey\(\)/);
  assert.doesNotMatch(matches,/\$\('date'\)\.value=new Date\(\)\.toISOString\(\)\.slice/);
});
