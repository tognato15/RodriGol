import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.3 Portal adota identidade integrada",async()=>{
  const portal=await readFile(new URL("public/portal/index.html",root),"utf8");
  assert.match(portal,/CENTRAL AO VIVO/);
  assert.match(portal,/NAVEGAÇÃO/);
  assert.match(portal,/OUTROS JOGOS/);
  assert.match(portal,/function renderRightSidebar/);
});
