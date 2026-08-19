import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.4.1.5 tick do relógio não redesenha formulário de eventos",async()=>{
  const control=await readFile(new URL("public/control.js",root),"utf8");
  const timer=control.slice(control.indexOf("function ensureTickTimer"),control.indexOf("function stopTickTimer"));
  assert.match(control,/function renderClockTick/);
  assert.match(timer,/renderClockTick\(\)/);
  assert.doesNotMatch(timer,/\brender\(\)/);
  assert.match(control,/function updateDatalistStable/);
});
