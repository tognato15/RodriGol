import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);

test("RC2A.5 card principal usa onField após substituição",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/home\.onField/);
  assert.match(app,/away\.onField/);
});

test("RC2A.5 card lateral formata substituição como atual e substituído",async()=>{
  const app=await readFile(new URL("public/app.js",root),"utf8");
  assert.match(app,/\$\{number\} - \$\{name\} \(\$\{outNumber\} - \$\{outName\}\)/);
});
