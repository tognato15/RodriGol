import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const data=await readFile(new URL('../public/data-store.js',import.meta.url),'utf8');
const multi=await readFile(new URL('../public/multicabine.js',import.meta.url),'utf8');
const multiHtml=await readFile(new URL('../public/multicabine.html',import.meta.url),'utf8');
const ops=await readFile(new URL('../public/multicabine-ops.js',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');

test('1.6.5 hidrata base remota sem bloquear módulos administrativos',()=>{assert.match(data,/remoteHydrationPromise=new Promise\(resolve=>setTimeout\(resolve,800\)\)\.then\(\(\)=>hydrateRemoteData\(\)\)\.finally/);assert.match(data,/REMOTE_REVISION_KEY/);assert.match(data,/remoteHydrationPending/);assert.match(data,/snapshot\$\{suffix\}/);assert.match(data,/setTimeout\(resolve,800\)/);});
test('1.6.5 multicabine limita renderização e reutiliza mapa de partidas no relógio',()=>{assert.match(multi,/visibleLimit=12/);assert.match(multi,/filtered\.slice\(0,visibleLimit\)/);assert.match(multi,/renderMatchMap\.get\(id\)/);assert.match(multi,/mcLoadMore/);});
test('1.6.5 filtros da multicabine não disparam atualização global pesada',()=>{assert.match(multi,/rodrigol:multicabine-filter/);assert.doesNotMatch(multiHtml,/getCompetitions,getRounds/);});
test('1.6.5 painel operacional posterga cálculo pesado para idle',()=>{assert.match(ops,/requestIdleCallback/);assert.match(ops,/scheduleRender/);});
test('1.6.5 servidor impede regressão de fase finalizada',()=>{assert.match(server,/function publicPhaseRank/);assert.match(server,/resolveCanonicalPublicPhase/);assert.match(server,/changedMatch:changedId\?publicRegionMatch/);});
test('1.6.5 portal possui merge canônico e remove live obsoleto',()=>{assert.match(portal,/function mergePortalMatch/);assert.match(portal,/portalPhaseRank/);assert.match(portal,/payload\.replaceLive/);assert.match(portal,/payload\.changedMatch/);assert.match(portal,/String\(match\.date\)!==String\(portalSelectedDate\)/);});
test('1.6.5 portal não usa classe global empty nos goleadores',()=>{assert.match(portal,/team-scorers\$\{scorers\?'':' is-empty'\}/);assert.doesNotMatch(portal,/team-scorers\$\{scorers\?'':' empty'\}/);});
