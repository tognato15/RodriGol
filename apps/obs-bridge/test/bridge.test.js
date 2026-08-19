import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("Beta 1.0.1 publica scoreboards grandes e preserva payload em lista", async () => {
  const server = await readFile(root + "server.mjs", "utf8");
  const control = await readFile(root + "public/overlay-control.js", "utf8");
  assert.match(server, /12_000_000/);
  assert.match(server, /Array\.isArray\(incoming\)/);
  assert.match(server, /\["show","update"\]\.includes\(command\.type\)/);
  assert.match(control, /bridgeApiUrl/);
  assert.match(control, /type:'show',region:'round-scoreboard'/);
  assert.match(control, /PUBLICADO · \$\{payload\.length\} JOGO\(S\)/);
});

test("Beta 1.5.2 exige inclusão explícita dos confrontos na fila lateral", async () => {
  const html = await readFile(root + "public/overlay-control.html", "utf8");
  const js = await readFile(root + "public/overlay-control.js", "utf8");
  assert.match(html, /DISPONÍVEIS PARA ADICIONAR/);
  assert.match(html, /id="sidebarAvailable"/);
  assert.match(js, /data-side-add/);
  assert.match(js, /migrateSidebarQueueBeta152/);
  assert.match(js, /filter\(item=>item\.type!==['"]knockout['"]\)/);
});
