import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2A.1 sumário não exibe HOME AWAY ou NEUTRAL como nome de equipe",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/teamName=String\(event\.teamName\|\|""\)/);
  assert.match(app,/lifecycle\?""/);
  assert.doesNotMatch(app,/teamName\|\|event\.team\|\|event\.details/);
});
