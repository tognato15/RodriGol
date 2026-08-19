import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2A.3 reduz velocidade do carrossel do scoreboard",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/distance\/36\*1000/);
  assert.match(app,/Math\.max\(12000,/);
  assert.doesNotMatch(app,/distance\/52\*1000/);
});
