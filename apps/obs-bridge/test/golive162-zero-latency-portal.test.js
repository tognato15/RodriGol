import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');
test('Go-Live 1.6.2 envia placar live diretamente no SSE público',()=>{
  assert.match(server,/notifyPublicEvent\("live",\{region:command\.region,matches:publicLiveMatches\(\),changedMatch:/);
  assert.match(portal,/payload\.kind==='live'&&applyLiveEvent\(payload\)/);
});
test('Go-Live 1.6.2 preserva ordem canônica dos acontecimentos',()=>{
  assert.match(server,/Date\.parse\(a\.createdAt/);
  assert.match(server,/type==='HALFTIME'\)return 45\.5/);
});
test('Go-Live 1.6.2 oferece home compacta com navegação por data e filtro ao vivo',()=>{
  assert.match(portal,/id="datePickerButton"/);
  assert.match(portal,/id="calendarPopover"/);
  assert.match(portal,/id="filterLive"/);
  assert.match(portal,/portalSelectedDate/);
  assert.match(portal,/results-toolbar/);
});
test('Go-Live 1.6.2 mantém fallback público de segurança',()=>{
  assert.match(portal,/setInterval\(\(\)=>\{if\(!document\.hidden\)/);
  assert.match(portal,/30000/);
});
