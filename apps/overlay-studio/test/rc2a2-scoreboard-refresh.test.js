import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2A.2 redesenha card quando muda somente a última ação",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/m\.latestScoreboardAction/);
  assert.match(app,/tile-last-action/);
});
