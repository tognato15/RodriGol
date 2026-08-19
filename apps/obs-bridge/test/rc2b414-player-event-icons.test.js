import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.4.1.4 Portal cruza eventos mesmo com equipe ausente e usa scorers como fallback",async()=>{
  const html=await readFile(new URL("public/portal/index.html",root),"utf8");
  assert.match(html,/function eventBelongsToSide/);
  assert.match(html,/if\(!eventTeam\)return true/);
  assert.match(html,/const scorers=side==='HOME'/);
  assert.match(html,/normalize\('NFD'\)/);
});
