import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.2.4 cruza partida persistida com regiões e live-events",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  assert.match(server,/function samePublicMatch/);
  assert.match(server,/regionState\.get\("live-events"\)/);
  assert.match(server,/function normalizePublicEvent/);
  assert.match(server,/publicRegionMatch\(match\.id,base\)/);
});
