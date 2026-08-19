import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2A.4+ Cabine mantém datalists seguros na substituição",async()=>{
  const js=await readFile(new URL("public/control.js",root),"utf8");
  const start=js.indexOf("function renderSubstitutionFields");
  const end=js.indexOf("function crestPayload",start);
  const block=js.slice(start,end);
  assert.ok(start>=0 && end>start);
  assert.doesNotMatch(block,/\besc\(/);
  assert.match(block,/updateDatalistStable\(outList,options\.outPlayers\)/);
  assert.match(block,/updateDatalistStable\(inList,options\.inPlayers\)/);
  assert.match(js,/function updateDatalistStable/);
  assert.match(js,/escapeHtml\(player\)/);
});
