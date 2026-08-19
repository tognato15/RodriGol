import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));

test("6.8.2 eleva o relógio/status ao topo do card sem alterar o placar",async()=>{
  const css=await readFile(root+"public/styles.css","utf8");
  assert.match(css,/Scoreboard compacto 6\.8\.2/);
  assert.match(css,/\.match-tile \.tile-main\{\s*position:relative!important;/);
  assert.match(css,/\.match-tile \.tile-scorebox \.tile-timing\{[\s\S]*position:absolute!important;[\s\S]*top:\.12vh!important;/);
  assert.match(css,/left:0!important;[\s\S]*right:0!important;[\s\S]*text-align:center!important;/);
});
