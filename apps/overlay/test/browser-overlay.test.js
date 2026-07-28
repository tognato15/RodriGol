import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../public/",import.meta.url));
const projectRoot=fileURLToPath(new URL("../../../",import.meta.url));

test("entrega os seis componentes visuais",async()=>{const html=await readFile(root+"index.html","utf8");for(const id of ["scoreboard","ticker","lower-third","side-alert","headline","fullscreen"])assert.match(html,new RegExp(`id="${id}"`));});
test("tema RodriGol segue a identidade da cabine aprovada",async()=>{const css=await readFile(root+"styles.css","utf8");assert.match(css,/--red:#e1252a/);assert.match(css,/--ink:rgba\(5,15,24/);});
test("aceita os comandos do motor de overlay",async()=>{const js=await readFile(root+"app.js","utf8");for(const type of ["show","update","hide","clear","clear-all"])assert.ok(js.includes(type));});
test("publica contrato de prontidão para a futura OBS Bridge",async()=>{const js=await readFile(root+"app.js","utf8");assert.match(js,/rodrigol:overlay-ready/);assert.match(js,/snapshot/);});
test("inclui favicon e elimina o 404 cosmético",async()=>{const html=await readFile(root+"index.html","utf8");const svg=await readFile(root+"assets/favicon.svg","utf8");assert.match(html,/assets\/favicon\.svg/);assert.match(svg,/<svg/);});
test("raiz possui comando npm start",async()=>{const pkg=JSON.parse(await readFile(projectRoot+"package.json","utf8"));assert.equal(pkg.scripts.start,"npm run start -w @rodrigol/obs-bridge");assert.equal(pkg.scripts["start:overlay"],"npm run start -w @rodrigol/browser-overlay");});
test("conecta automaticamente à OBS Bridge com reconexão",async()=>{const js=await readFile(root+"app.js","utf8");assert.match(js,/new WebSocket/);assert.match(js,/scheduleReconnect/);assert.match(js,/message\.type===\"command\"/);});
