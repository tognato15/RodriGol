import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("RC2A protege acesso remoto com senha administrativa",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/RODRIGOL_ADMIN_PASSWORD/);
  assert.match(server,/Acesso remoto bloqueado/);
  assert.match(server,/rodrigol_session/);
  assert.match(server,/HttpOnly; SameSite=Lax/);
  assert.match(server,/pathname==="\/login"/);
  assert.match(server,/controlAuthorized/);
  assert.match(server,/loginRedirect/);
});

test("RC2A aceita sessão administrativa e bearer token na API",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/bearerAuthorized/);
  assert.match(server,/sessionFor\(request\)/);
  assert.match(server,/function authorized/);
  assert.match(server,/RODRIGOL_API_TOKEN/);
  assert.match(server,/\/api\/session/);
});

test("RC2A protege WebSocket em instalação autenticada",async()=>{
  const server=await read("server.mjs");
  assert.match(server,/wsAuthorized/);
  assert.match(server,/url\.searchParams\.get\("token"\)/);
  assert.match(server,/401 Unauthorized/);
});

test("RC2A sincroniza escudos e logotipos entre dispositivos",async()=>{
  const store=await read("public/data-store.js");
  assert.match(store,/REMOTE_CLUB_CREST_PREFIX/);
  assert.match(store,/REMOTE_COMPETITION_LOGO_PREFIX/);
  assert.match(store,/queueRemoteAsset/);
  assert.match(store,/applyRemoteAssetRecord/);
  assert.match(store,/credentials:'include'/);
});

test("RC2A detecta navegador remoto e habilita persistência compartilhada",async()=>{
  const runtime=await read("public/runtime-config.js");
  const client=await read("public/bridge-client.js");
  assert.match(runtime,/localHost/);
  assert.match(runtime,/remoteStorageEnabled: !localHost/);
  assert.match(runtime,/url\.searchParams\.set\('token',cfg\.apiToken\)/);
  assert.match(client,/credentials: options\.credentials \|\| 'include'/);
});
