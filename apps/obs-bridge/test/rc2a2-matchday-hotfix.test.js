import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("RC2A.2 carrega escalação antes dos selects de substituição",async()=>{
  const control=await read("public/control.js");
  const renderBlock=control.slice(control.indexOf("function render()"),control.indexOf("function renderTimeline"));
  assert.ok(renderBlock.indexOf("renderLineups();") < renderBlock.indexOf("renderSubstitutionFields();"));
  assert.match(control,/function substitutionLineupsSource/);
  assert.match(control,/readCoverage\(match\.id,initialState\)/);
  assert.match(control,/substitutionOutList/);
  assert.match(control,/substitutionInList/);
});

test("RC2A.2 Cabine e Multicabine usam emojis compactos no scoreboard",async()=>{
  const studio=await read("public/studio-regions.js");
  const multi=await read("public/multicabine.js");
  for(const source of [studio,multi]){
    assert.match(source,/function compactScoreboardAction/);
    assert.match(source,/\['⚽',minute,player\]/);
    assert.match(source,/\['🟨',minute,player\]/);
    assert.match(source,/\['🟥',minute,player\]/);
    assert.match(source,/latestScoreboardAction:latest\?compactScoreboardAction\(latest\)/);
  }
});
