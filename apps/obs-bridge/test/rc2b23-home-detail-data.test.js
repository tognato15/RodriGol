import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2B.2.3 Home preserva dados completos do round-summary",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  const start=server.indexOf("function publicMatchesForDate(date)");
  const end=server.indexOf("function publicStandings()",start);
  const block=server.slice(start,end);
  assert.match(block,/function publicMatchesForDate/);
  assert.match(server,/function mergePublicMatch/);
  assert.match(server,/events:Array\.isArray\(live\.events\)&&live\.events\.length\?live\.events/);
  assert.match(block,/publicRegionMatch\(item\.matchId\|\|item\.id\)/);
  assert.doesNotMatch(block,/events:\[\]/);
});
