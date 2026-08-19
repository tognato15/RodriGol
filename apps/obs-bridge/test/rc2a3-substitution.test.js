import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2A.3 substituição usa campos pesquisáveis e aceita fallback manual",async()=>{
  const html=await readFile(new URL("public/index.html",root),"utf8");
  const js=await readFile(new URL("public/control.js",root),"utf8");
  assert.match(html,/list="substitutionOutList"/);
  assert.match(html,/list="substitutionInList"/);
  assert.match(html,/Selecione ou digite quem sai/);
  assert.match(js,/function substitutionLineupsSource/);
  assert.match(js,/Digite manualmente quem sai/);
  assert.match(js,/operational\[side\]\.onField/);
  assert.match(js,/operational\[side\]\.bench/);
});
