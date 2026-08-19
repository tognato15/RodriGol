import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));

test("6.8.1 usa um único relógio/status acima do placar",async()=>{
  const js=await readFile(root+"public/app.js","utf8");
  assert.match(js,/function roundTimingLabel/);
  assert.match(js,/data-match-timing/);
  assert.match(js,/1ºT \$\{clock\}/);
  assert.match(js,/2ºT \$\{clock\}/);
  assert.match(js,/return "INTERVALO"/);
  assert.match(js,/return "EM ANDAMENTO"/);
  const tileSection=js.slice(js.indexOf("function roundTileHtml"),js.indexOf("function startRoundMarquee"));
  assert.doesNotMatch(tileSection,/<footer>/);
  assert.doesNotMatch(tileSection,/data-live-clock/);
});

test("6.8.1 deixa o scoreboard mais baixo e sem rodapé",async()=>{
  const css=await readFile(root+"public/styles.css","utf8");
  assert.match(css,/Scoreboard compacto 6\.8\.1/);
  assert.match(css,/grid-template-rows:48\.5% 11\.5% 5\.5% 34\.5%/);
  assert.match(css,/\.match-tile footer\{display:none!important\}/);
  assert.match(css,/\.tile-scorebox \.tile-timing/);
});
