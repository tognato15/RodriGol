import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.1.1 ticker editorial mede largura real e reavalia layout",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  const css=await readFile(new URL("public/styles.css",root),"utf8");
  assert.match(app,/function renderEditorialMarquee/);
  assert.match(app,/getBoundingClientRect\(\)\.width/);
  assert.match(app,/cloneNode\(true\)/);
  assert.match(app,/rg-highlight-copy/);
  assert.match(css,/width:max-content!important/);
  assert.match(css,/animation:rg-editorial-loop/);
});
