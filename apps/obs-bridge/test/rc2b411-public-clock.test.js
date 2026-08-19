import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("RC2B.4.1.1 API publica âncora do relógio", async () => {
  const server = await readFile(new URL("server.mjs", root), "utf8");
  assert.match(server, /startedAt:coverage\.clockStartedAt/);
  assert.match(server, /x=>x\?\.clockStartedAt/);
});

test("RC2B.4.1.1 Portal calcula relógio efetivo", async () => {
  const page = await readFile(new URL("public/portal/index.html", root), "utf8");
  assert.match(page, /function effectivePortalClock/);
  assert.match(page, /data-match-clock/);
  assert.match(page, /setInterval\(refreshVisibleMatchClock,1000\)/);
});
