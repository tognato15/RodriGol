import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
test("RC2B.4 publica cronologia completa e mata-mata",async()=>{const regions=await readFile(new URL("public/studio-regions.js",root),"utf8");assert.match(regions,/chronology:\(s\.events\|\|\[\]\)\.map/);assert.doesNotMatch(regions,/chronology:\(s\.events\|\|\[\]\)\.slice\(0,8\)/);assert.match(regions,/function publicKnockoutForMatch/);assert.match(regions,/knockout:publicKnockoutForMatch\(match\)/);});
test("RC2B.4 API preserva substituições sem expor banco",async()=>{const server=await readFile(new URL("server.mjs",root),"utf8");assert.match(server,/substitutions:uniqueSubs/);assert.match(server,/starters:starters\.slice\(0,11\)/);});
test("RC2B.4 Cabine sugere jogadores para gol e cartões",async()=>{const control=await readFile(new URL("public/control.js",root),"utf8");const page=await readFile(new URL("public/index.html",root),"utf8");assert.match(page,/eventPlayerList/);assert.match(control,/function renderEventPlayerOptions/);assert.match(control,/\['GOAL','YELLOW_CARD','RED_CARD'\]/);});
