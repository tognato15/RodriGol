import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("RC2B.2.4.1+ publica dados completos da Cabine para o Portal",async()=>{
  const regions=await readFile(new URL("../public/studio-regions.js",import.meta.url),"utf8");
  const server=await readFile(new URL("../server.mjs",import.meta.url),"utf8");
  assert.match(regions,/region:'public-match-data',payload:all/);
  assert.match(server,/regionState\.get\("public-match-data"\)/);
  assert.match(server,/function mergeUniquePublicEvents/);
  assert.match(server,/function mergeLineupSources/);
});
