import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("RC2A.1 aceita escalações legadas na substituição",async()=>{
  const engine=await read("public/substitution-engine.js");
  const control=await read("public/control.js");
  assert.match(engine,/function playerList/);
  assert.match(engine,/startingXI/);
  assert.match(engine,/reserves/);
  assert.match(engine,/substitutes/);
  assert.match(control,/substitutionLineupsSource/);
  assert.match(control,/homeStarters/);
  assert.match(control,/homeBench/);
});

test("RC2A.1 envia nome real da equipe ao sumário principal",async()=>{
  const studio=await read("public/studio-regions.js");
  assert.match(studio,/teamName:e\.team==='HOME'\?h\.shortName:e\.team==='AWAY'\?a\.shortName:''/);
});

test("RC2A.1 usa emojis para gol e cartões no scoreboard",async()=>{
  const studio=await read("public/studio-regions.js");
  assert.match(studio,/\['⚽',minute/);
  assert.match(studio,/\['🟨',minute/);
  assert.match(studio,/\['🟥',minute/);
});
