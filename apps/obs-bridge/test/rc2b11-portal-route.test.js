import test from "node:test";
import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.1.1 portal permanece dentro do public do Bridge",async()=>{
  const server=await readFile(new URL("server.mjs",root),"utf8");
  await stat(new URL("public/portal/index.html",root));
  assert.match(server,/new URL\("\.\/public\/portal\/"/);
  assert.match(server,/pathname==="\/portal"/);
  assert.match(server,/serve\(bridgeRoot,"\/portal\/index\.html",response\)/);
});
