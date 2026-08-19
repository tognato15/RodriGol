import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.2 API de partida publica fatos e XI atual sem banco",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  assert.match(server,/clock:\{elapsedSeconds:/);
  assert.match(server,/facts:\{referee:/);
  assert.match(server,/lineups:\{/);
  assert.doesNotMatch(server,/lineups:[\s\S]{0,500}bench:/);
});
