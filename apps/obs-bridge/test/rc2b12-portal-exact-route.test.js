import test from "node:test";
import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.1.2 portal usa HTML autocontido e rota exata",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  const portal=await readFile(new URL("public/portal/index.html",root),"utf8");
  await stat(new URL("public/portal/index.html",root));
  assert.match(server,/pathname==="\/portal"\|\|pathname==="\/portal\/"/);
  assert.match(server,/serve\(bridgeRoot,"\/portal\/index\.html",response\)/);
  assert.match(portal,/<style>/);
  assert.match(portal,/<script type="module">/);
});
