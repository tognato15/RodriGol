import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.2.1+ página individual aceita storage e regiões ao vivo",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  assert.match(server,/function publicRegionMatch/);
  assert.match(server,/regionState\.get\("round-summary"\)/);
  assert.match(server,/regionState\.get\("round-scoreboard"\)/);
  assert.match(server,/const base=stored\?publicMatch\(stored\):null/);
  assert.match(server,/publicRegionMatch\(id,base\)\|\|base/);
});
