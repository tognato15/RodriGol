import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.2.2+ Portal abre jogo usando dados memorizados da Home",async()=>{
  const html=await readFile(new URL("public/portal/index.html",root),"utf8");
  assert.match(html,/function rememberMatch/);
  assert.match(html,/function rememberedMatch/);
  assert.match(html,/data-match-key/);
  assert.match(html,/const cached=rememberedMatch\(key\)/);
  assert.match(html,/matchPage\(cached\)/);
  assert.match(html,/if\(!cached\)\$\('matchPageContent'\)\.innerHTML='<div class="empty">Partida não encontrada ou indisponível\.<\/div>'/);
});
