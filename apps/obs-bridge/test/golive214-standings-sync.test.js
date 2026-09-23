import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('2.1.4 sincronização recalcula e publica classificação importada',async()=>{
  const matches=await readFile(new URL('public/matches.js',root),'utf8');
  assert.match(matches,/publishAutomaticStandings/);
  assert.match(matches,/calculationMode:'AUTO'/);
  assert.match(matches,/publishedTableIds\.push\(target\.id\)/);
  assert.match(matches,/calculateStandingTable\(target\.id,\{mode:'OFFICIAL'\}\)/);
  assert.match(matches,/await flushDataSync\(\)/);
});
test('2.1.4 portal continua lendo classificação pública e hub',async()=>{
  const server=await readFile(new URL('server.mjs',root),'utf8');
  assert.match(server,/function publicStandings\(\)/);
  assert.match(server,/return \{\.\.\.competition,standings,matches,rounds,knockout,news\}/);
  assert.match(server,/pathname===\"\/api\/public\/standings\"/);
});
