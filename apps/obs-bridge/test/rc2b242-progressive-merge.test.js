import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2B.2.4.2 isola publicação extra do Portal",async()=>{
  const regions=await readFile(new URL("public/studio-regions.js",root),"utf8");
  assert.match(regions,/try\{await command\(\{type:'show',region:'public-match-data'/);
  const essential=regions.slice(regions.indexOf("await Promise.all(["),regions.indexOf("try{await command"));
  assert.doesNotMatch(essential,/public-match-data/);
});

test("RC2B.2.4.2 agrega eventos e usa a escalação mais completa",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  assert.match(server,/function mergeUniquePublicEvents/);
  assert.match(server,/function richestPlayers/);
  assert.match(server,/function mergeLineupSources/);
  assert.match(server,/regionState\.get\("public-match-data"\)/);
});
