import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("RC2B.1 cria API pública somente leitura sem exigir sessão",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/pathname==="\/api\/public\/home"/);
  assert.match(server,/pathname==="\/api\/public\/matches"/);
  assert.match(server,/pathname==="\/api\/public\/standings"/);
  assert.match(server,/pathname==="\/api\/public\/news"/);
  assert.doesNotMatch(server,/pathname==="\/api\/public\/home"[\s\S]{0,120}requireAuth/);
});

test("API pública expõe somente dados editoriais necessários ao Portal",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/function publicMatch/);
  assert.match(server,/lineups:\{/);
  assert.doesNotMatch(server,/lineups:[\s\S]{0,500}bench:/);
  assert.doesNotMatch(server,/lineups:[\s\S]{0,500}reserves:/);
  assert.match(server,/function publicNews/);
});

test("RC2B.1 serve Portal Público separado do control e overlay",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/const portalRoot=/);
  assert.match(server,/pathname==="\/portal"/);
  assert.match(server,/serve\(bridgeRoot,"\/portal\/index\.html",response\)/);
});
