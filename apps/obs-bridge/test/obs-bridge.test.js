import test from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
test("bridge oferece websocket, heartbeat e reconexão compatível",async()=>{const server=await readFile(root+"server.mjs","utf8");assert.match(server,/server\.on\("upgrade"/);assert.match(server,/framePing/);assert.match(server,/\/ws/);});
test("bridge oferece API de comandos e diagnóstico",async()=>{const server=await readFile(root+"server.mjs","utf8");assert.match(server,/\/api\/commands/);assert.match(server,/\/api\/state/);assert.match(server,/\/health/);});
test("redireciona control sem barra e usa recursos absolutos",async()=>{const server=await readFile(root+"server.mjs","utf8");const html=await readFile(root+"public/index.html","utf8");assert.match(server,/pathname==="\/control"/);assert.match(server,/redirect\(response,"\/control\/"\)/);assert.match(html,/href="\/control\/control\.css"/);assert.match(html,/src="\/control\/control\.js"/);});
test("inclui painel profissional de operação",async()=>{const html=await readFile(root+"public/index.html","utf8");assert.match(html,/Cabine de Cobertura/);assert.match(html,/OPERAÇÃO RÁPIDA/);assert.match(html,/REGISTRAR E PUBLICAR/);assert.match(html,/OVERLAYS · PREVIEW/);});

test("oferece a página multicabine real",async()=>{const server=await readFile(root+"server.mjs","utf8");const html=await readFile(root+"public/multicabine.html","utf8");const js=await readFile(root+"public/multicabine.js","utf8");assert.match(server,/\/control\/multicabine\.html/);assert.match(html,/CONTROLE MULTICABINE/);assert.match(js,/clockStartedAt/);});
test("central abre edição da partida pelo identificador",async()=>{const central=await readFile(root+"public/central.js","utf8");const matches=await readFile(root+"public/matches.js","utf8");assert.match(central,/matches\.html\?edit=/);assert.match(matches,/URLSearchParams\(location\.search\)/);});
test("armazenamento preserva listas vazias e relógio por cobertura",async()=>{const store=await readFile(root+"public/data-store.js","utf8");const control=await readFile(root+"public/control.js","utf8");assert.match(store,/if\(!has\(MATCHES_KEY\)\)/);assert.match(control,/clockStartedAt/);assert.doesNotMatch(control,/clockRunning:false}\);\nfunction saveState/);});

test("relógio usa motor compartilhado match-presentation",async()=>{const control=await readFile(root+"public/control.js","utf8");assert.match(control,/from '\.\/match-presentation\.js'/);assert.match(control,/buildClockTickPatch/);assert.doesNotMatch(control,/state\.elapsedSeconds\+\+/);});
test("nova pauta possui fila própria",async()=>{const store=await readFile(root+"public/data-store.js","utf8");const editorial=await readFile(root+"public/editorial.js","utf8");assert.match(store,/agendas/);assert.match(editorial,/editorial\.agendas/);});
test("partida ativa e saída principal são desserializadas corretamente",async()=>{const store=await readFile(root+"public/data-store.js","utf8");assert.match(store,/const stored = parse\(ACTIVE_MATCH_KEY, ''\)/);assert.match(store,/const stored = parse\(ON_AIR_MATCH_KEY, ''\)/);assert.doesNotMatch(store,/localStorage\.getItem\(ACTIVE_MATCH_KEY\) \|\| ''/);});
test("abertura de cabine propaga matchId e cabine canonicaliza a URL",async()=>{const central=await readFile(root+"public/central.js","utf8");const matches=await readFile(root+"public/matches.js","utf8");const control=await readFile(root+"public/control.js","utf8");assert.match(central,/\/control\/\?matchId=/);assert.match(matches,/\/control\/\?matchId=/);assert.match(control,/history\.replaceState/);assert.match(control,/searchParams\.set\('matchId', match\.id\)/);});
test("diagnóstico do Bridge inicia antes da renderização completa",async()=>{const control=await readFile(root+"public/control.js","utf8");assert.match(control,/if \(!response\.ok\) throw new Error/);assert.match(control,/health\(\);\ntry \{\n  render\(\)/);});

test("multicabine publica imediatamente a partida colocada no ar",async()=>{const js=await readFile(root+"public/multicabine.js","utf8");assert.match(js,/function scoreboardPayload/);assert.match(js,/publishOnAir\(true\)/);assert.match(js,/publishCommand/);assert.match(js,/async function command\(body\)\{return publishCommand\(body\);\}/);assert.match(js,/region:'scoreboard'/);});
test("multicabine mantém o relógio da saída OBS atualizado sem abrir a cabine",async()=>{const js=await readFile(root+"public/multicabine.js","utf8");assert.match(js,/buildClockTickPatch/);assert.match(js,/lastStructuralSignature/);assert.match(js,/signature===lastPublishedSignature/);});

test("nova pauta usa formulário visual estruturado",async()=>{const html=await readFile(root+"public/editorial.html","utf8");const js=await readFile(root+"public/editorial.js","utf8");assert.match(html,/id="agendaModal"/);assert.match(html,/id="agendaTitle"/);assert.match(html,/id="agendaPriority"/);assert.match(html,/id="agendaMatch"/);assert.match(js,/openAgendaModal/);assert.match(js,/agendaForm'\)\.onsubmit/);assert.doesNotMatch(js,/prompt\('Título da nova pauta:/);});

test("Sprint 5.2 oferece fluxo editorial completo para pautas",async()=>{const html=await readFile(root+"public/editorial.html","utf8");const js=await readFile(root+"public/editorial.js","utf8");assert.match(html,/id="agendaChannel"/);assert.match(html,/id="agendaFilterLabel"/);assert.match(js,/function moveAgenda/);assert.match(js,/function publishAgenda/);assert.match(js,/appendAgendaHistory/);assert.match(js,/publishScheduled/);assert.match(js,/data-agenda-status/);});

test("Sprint 5.3 oferece central de notícias com rascunhos e publicações",async()=>{const html=await readFile(root+"public/news.html","utf8");const js=await readFile(root+"public/news.js","utf8");const store=await readFile(root+"public/data-store.js","utf8");assert.match(html,/CENTRAL DE NOTÍCIAS/);assert.match(html,/id="articleForm"/);assert.match(html,/id="readerModal"/);assert.match(js,/migratePublishedAgendas/);assert.match(js,/status==='PUBLISHED'/);assert.match(store,/getNewsState/);assert.match(store,/saveNewsState/);});
test("publicação de pauta alimenta a central de notícias",async()=>{const editorial=await readFile(root+"public/editorial.js","utf8");assert.match(editorial,/function syncAgendaToNews/);assert.match(editorial,/syncAgendaToNews\(updated\)/);});

test("Beta 1.0 oferece Central do Overlay com múltiplos scoreboards",async()=>{const html=await readFile(root+"public/overlay-control.html","utf8");const js=await readFile(root+"public/overlay-control.js","utf8");const store=await readFile(root+"public/data-store.js","utf8");assert.match(html,/CENTRAL DO OVERLAY/);assert.match(html,/COLEÇÕES DE SCOREBOARD/);assert.match(html,/id="setActive"/);assert.match(js,/function createCollection/);assert.match(js,/function duplicateCurrent/);assert.match(js,/region:'round-scoreboard'/);assert.match(store,/getOverlayControlState/);assert.match(store,/getActiveScoreboardMatchIds/);});

test("Scoreboard automático usa apenas partidas em andamento",async()=>{const js=await readFile(root+"public/multicabine.js","utf8");assert.match(js,/AUTO_SCOREBOARD_PHASES/);assert.match(js,/FIRST_HALF/);assert.match(js,/LIVE_UNKNOWN/);assert.match(js,/HALFTIME/);assert.match(js,/SECOND_HALF/);assert.match(js,/const roundSource=automaticScoreboardMatches\(allMatches\)/);assert.match(js,/round:roundSource\.map\(studioMatchPayload\)/);});

test("Central de Destaques preserva velocidade e usa somente região editorial Studio",async()=>{const store=await readFile(root+"public/data-store.js","utf8");const html=await readFile(root+"public/ticker.html","utf8");const js=await readFile(root+"public/ticker.js","utf8");const competitions=await readFile(root+"public/competitions.html","utf8");assert.match(store,/yellowTickerSpeed:\s*60[\s\S]*maxItems:\s*6/);assert.match(html,/CENTRAL DE DESTAQUES/);assert.doesNotMatch(html,/id="importNews"/);assert.match(js,/region:'editorial-highlight'/);assert.doesNotMatch(js,/getNewsState/);assert.match(competitions,/EDITOR DE COMPETIÇÕES/);assert.doesNotMatch(js,/region:'ticker'/);});

test("Beta 1.5.4 conecta fases e avança classificados automaticamente",async()=>{const html=await readFile(root+"public/knockout.html","utf8");const js=await readFile(root+"public/knockout.js","utf8");const store=await readFile(root+"public/data-store.js","utf8");assert.match(html,/id="recalculate"/);assert.match(js,/function resolveAdvancement/);assert.match(js,/function connectPreviousPhase/);assert.match(js,/homeSourceTieId/);assert.match(js,/awaySourceTieId/);assert.match(store,/homeSourceTieId/);assert.match(store,/awaySourceTieId/);});

test("Beta 1.5.4.1 separa partidas do confronto e calcula o agregado",async()=>{const store=await readFile(root+"public/data-store.js","utf8");const editor=await readFile(root+"public/knockout.js","utf8");assert.match(store,/firstLegHomeScore/);assert.match(store,/secondLegHomeScore/);assert.match(editor,/AGREGADO AUTOMÁTICO/);assert.match(editor,/firstLegMatchId/);assert.match(editor,/secondLegMatchId/);});

test("Beta 1.5.5.3 preserva velocidade configurada durante atualizações ao vivo", async () => {
  const multicabine = await readFile(root+"public/multicabine.js","utf8");
  assert.match(multicabine,/getOverlayControlState/);
  assert.match(multicabine,/yellowTickerMode/);
  assert.match(multicabine,/yellowTickerSpeed/);
  assert.match(multicabine,/speedSeconds/);
});

test("Beta 1.5.6 calcula classificação oficial e ao vivo",async()=>{
  const engine=await readFile(root+"public/standings-engine.js","utf8");
  const html=await readFile(root+"public/standings.html","utf8");
  const competitions=await readFile(root+"public/competitions.html","utf8");
  const multicabine=await readFile(root+"public/multicabine.js","utf8");
  assert.match(engine,/calculateStandingTable/);
  assert.match(engine,/LIVE_PHASES/);
  assert.match(engine,/adjustmentPoints/);
  assert.match(html,/id="calculationMode"/);
  assert.match(html,/id="overlayMode"/);
  assert.match(competitions,/id="pointsWin"/);
  assert.match(competitions,/id="tieBreakerPreset"/);
  assert.match(multicabine,/standingPanel/);
});

test("Beta 1.5.6.1 preserva tabelas legadas e unifica partidas antes do início",async()=>{
  const store=await readFile(root+"public/data-store.js","utf8");
  const multicabine=await readFile(root+"public/multicabine.js","utf8");
  assert.match(store,/legacyStandingTables/);
  assert.match(store,/normalizeStandingRow/);
  assert.match(store,/publishedTableIds=publishedTableIds\.filter/);
  assert.match(multicabine,/beforeKickoff/);
  assert.match(multicabine,/date:match\.date/);
  assert.match(multicabine,/time:match\.time/);
});


test("6.20 mantém participantes e expõe diagnóstico ao vivo",async()=>{
  const engine=await readFile(root+"public/standings-engine.js","utf8");
  const html=await readFile(root+"public/standings.html","utf8");
  const js=await readFile(root+"public/standings.js","utf8");
  assert.match(engine,/Todos os clubes vinculados à fase\/grupo entram na tabela desde o início/);
  assert.match(engine,/export function standingAudit/);
  assert.match(engine,/export function rankStandingRows/);
  assert.match(html,/id="liveAudit"/);
  assert.match(js,/rodrigol:data-changed/);
  assert.match(js,/rankStandingRows\(rows,comp\)/);
});


test("6.21 implementa substituição real com jogador que sai e entra",async()=>{
  const engine=await readFile(root+"public/substitution-engine.js","utf8");
  const control=await readFile(root+"public/control.js","utf8");
  const multi=await readFile(root+"public/multicabine.js","utf8");
  const html=await readFile(root+"public/index.html","utf8");
  assert.match(engine,/export function applySubstitution/);
  assert.match(engine,/onField/);
  assert.match(engine,/substitutionOut/);
  assert.match(control,/substitutionOut/);
  assert.match(control,/rebuildOperationalLineups/);
  assert.match(multi,/substitutionOptions/);
  assert.match(multi,/Jogador que sai/);
  assert.match(html,/id="substitutionIn"/);
});
