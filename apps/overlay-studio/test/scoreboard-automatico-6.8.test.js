import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
test("6.8 ativa rolagem somente acima de seis partidas",async()=>{const js=await readFile(root+"public/app.js","utf8");const css=await readFile(root+"public/styles.css","utf8");assert.match(js,/matches\.length>6/);assert.match(js,/dataset\.mode=scrolling\?"MARQUEE":"STATIC"/);assert.match(js,/html\+html/);assert.match(js,/duplicateStart\.offsetLeft/);assert.match(css,/match-tiles\.is-marquee/);});
test("6.8 mantém estados sem relógio legíveis",async()=>{const js=await readFile(root+"public/app.js","utf8");assert.match(js,/auxiliaryClockText/);assert.match(js,/status\.includes\("INTERVALO"\)/);assert.match(js,/roundTimingLabel/);assert.match(js,/return "EM ANDAMENTO"/);});
