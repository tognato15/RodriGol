import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.4.1.3 relógio principal nunca retrocede na mesma fase",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/function currentMainClockSeconds/);
  assert.match(app,/Number\(payload\.elapsedSeconds\)/);
  assert.match(app,/mainClockPhase===phase/);
  assert.match(app,/Math\.max\(next,localNow\)/);
  assert.match(app,/mainClockRunning=running&&shouldShowClock/);
});
