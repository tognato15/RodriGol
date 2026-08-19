import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("RC2A.5 remove substituição da tela branca em Cabine e Multicabine",async()=>{
  const studio=await read("public/studio-regions.js");
  const multi=await read("public/multicabine.js");
  assert.match(studio,/\['YELLOW_CARD','RED_CARD','SUBSTITUTION'\]/);
  assert.match(multi,/\['YELLOW_CARD','RED_CARD','SUBSTITUTION'\]/);
});

test("RC2A.5 lateral publica jogadores atuais com histórico da troca",async()=>{
  const studio=await read("public/studio-regions.js");
  const multi=await read("public/multicabine.js");
  for(const source of [studio,multi]){
    assert.match(source,/function annotatedOperationalLineup/);
    assert.match(source,/lineup\.onField/);
    assert.match(source,/\$\{value\} \(\$\{outgoing\}\)/);
  }
});
