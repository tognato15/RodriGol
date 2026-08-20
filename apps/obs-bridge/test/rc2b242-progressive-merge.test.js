import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2B.2.4.2 isola publicação extra do Portal",async()=>{
  const regions=await readFile(new URL("public/studio-regions.js",root),"utf8");
  const liveStart=regions.indexOf("export async function publishStudioLiveUpdate");
  const snapshotStart=regions.indexOf("export async function publishStudioSnapshot");
  const liveBlock=regions.slice(liveStart,snapshotStart);
  const snapshotBlock=regions.slice(snapshotStart);
  assert.doesNotMatch(liveBlock,/public-match-data/);
  assert.match(snapshotBlock,/region:'public-match-data'/);
});

test("RC2B.2.4.2 agrega eventos e usa a escalação mais completa",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  assert.match(server,/function mergeUniquePublicEvents/);
  assert.match(server,/function richestPlayers/);
  assert.match(server,/function mergeLineupSources/);
  assert.match(server,/regionState\.get\("public-match-data"\)/);
});
