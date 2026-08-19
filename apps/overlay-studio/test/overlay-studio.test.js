import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "public", "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");

test("barra superior aprovada", () => {
  assert.match(html, /currentTime/);
  assert.match(html, /RODRIGOL <b>STUDIO<\/b>/);
  assert.match(html, /coverage-status/);
  assert.doesNotMatch(html, /SISTEMA OPERACIONAL DE REDAÇÃO ESPORTIVA/);
  assert.match(css, /\.datetime>strong\{[^}]*color:var\(--orange\)/);
});

test("jogo principal usa placar compacto e período separado", () => {
  for (const id of ["mainCompetition", "homeName", "awayName", "homeScore", "awayScore", "mainClock", "mainPeriod"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(css, /\.score-line\{[^}]*color:var\(--orange\)/);
  assert.match(css, /\.time-line span\{[^}]*color:#fff/);
  assert.match(app, /function applyMainMatch/);
});

test("Alpha 0.3 contém scoreboard, últimas ações, resumo e destaque", () => {
  for (const id of ["roundMatches", "eventsList", "summaryTrack", "highlightText"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /events-columns/);
  assert.doesNotMatch(html, /ÚLTIMAS AÇÕES/);
  assert.match(app, /"round-scoreboard"/);
  assert.match(app, /"live-events"/);
  assert.match(app, /"round-summary"/);
  assert.match(app, /"editorial-highlight"/);
});

test("overlay ocupa a tela inteira e mantém identidade RodriGol", () => {
  assert.match(css, /width:100vw/);
  assert.match(css, /height:100vh/);
  assert.match(css, /--orange:#ff5b00/);
});


test("Alpha 0.4.2 mantém seis jogos em uma linha e oito últimas ações", () => {
  assert.match(css, /grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css, /grid-template-rows:1fr/);
  assert.match(app, /slice\(0,8\)/);
  assert.match(app, /function fullEventResult/);
  assert.match(css, /\.event-row\{height:12\.5%/);
});

test("rodapé editorial aprovado usa fundo preto", () => {
  assert.match(css, /\.editorial-highlight\{[^}]*background:#020609[^}]*color:#f5f7f8/);
});


test("scoreboard preserva branding social e usa escudos sem nomes visuais", () => {
  assert.match(css, /\.tile-side \.tile-team,\.tile-side\.away \.tile-team\{display:none!important/);
  assert.match(app, /aria-label=\"\$\{escapeHtml\(homeLabel\)\} contra/);
  assert.match(html, /@RODRIGOL\.STUDIO/);
  assert.doesNotMatch(html, /@RODRIGOLTV/);
});

test("Beta mantém período acima do placar e exibe o estádio", () => {
  const periodIndex = html.indexOf('id="mainPeriod"');
  const scoreIndex = html.indexOf('class="score-line"');
  assert.ok(periodIndex >= 0 && periodIndex < scoreIndex);
  assert.match(html, /id="mainVenue"/);
  assert.match(css, /\.period-line\{/);
  assert.match(app, /state\.venue\|\|state\.location/);
});

test("Beta 1.3 compacta nomes em uma linha e reserva espaço para escudos", () => {
  assert.match(app, /compactTeamNames/);
  assert.match(app, /Internacional\":\"Inter/);
  assert.match(app, /displayTeamName/);
  assert.match(css, /tile-crest\{width:33px;height:33px/);
  assert.match(css, /tile-team\{display:block;min-height:0;height:1\.2em/);
});

test("Beta 1.3 mantém velocidade do resumo e usa rodapé apenas editorial", () => {
  assert.match(app, /lastSummaryFingerprint/);
  assert.match(app, /lastHighlightFingerprint/);
  assert.match(app, /headlines/);
  assert.doesNotMatch(app, /ticker:applyHighlight/);
});


test("Beta 1.5.1 exibe confrontos eliminatórios na lateral", () => {
  assert.match(app, /panel\.type==="knockout"/);
  assert.match(app, /CLASSIFICADO/);
  assert.match(css, /\.knockout-panel\{/);
  assert.match(css, /\.knockout-tie\{/);
});

test("Beta 1.5.2 mostra os clubes e o placar de cada confronto", () => {
  assert.match(app, /class="knockout-match"/);
  assert.match(app, /item\.home\|\|"A definir"/);
  assert.match(app, /item\.away\|\|"A definir"/);
  assert.match(css, /\.knockout-match\{/);
  assert.match(css, /\.knockout-tie\{flex:0 0 auto/);
});

test("painel de mata-mata exibe ida, volta e agregado", () => {
  assert.match(app, /IDA ·/);
  assert.match(app, /VOLTA ·/);
  assert.match(app, /AGREGADO ·/);
});


test("Beta 1.5.5.1 rola destaque somente quando ultrapassa a área", () => {
  assert.match(html, /id="highlightWindow"/);
  assert.match(app, /function updateEditorialHighlightMotion/);
  assert.match(app, /function renderEditorialMarquee/);
  assert.match(app, /getBoundingClientRect\(\)\.width/);
  assert.match(css, /#highlightText\.is-scrolling/);
  assert.match(css, /@keyframes rg-editorial-marquee/);
  assert.match(css, /width:max-content!important/);
});

test("Beta 1.5.5.1 aumenta escudos e remove nomes visuais dos seis cards", () => {
  assert.match(css, /width:38px!important/);
  assert.match(css, /\.tile-side \.tile-team,\.tile-side\.away \.tile-team\{display:none!important/);
  assert.match(app, /title=\"\$\{escapeHtml\(homeLabel\)\}\"/);
});

test("Beta 1.5.5.3 mantém velocidade constante e uma única animação da barra amarela", () => {
  assert.match(app, /summaryPixelsPerSecond/);
  assert.match(app, /summaryAnimation\.cancel\(\)/);
  assert.match(app, /track\.animate\(/);
  assert.match(app, /distance\/summaryPixelsPerSecond\(lastSummarySpeed\)/);
  assert.match(app, /Number\.isFinite\(incomingSpeed\).*lastSummarySpeed/);
  assert.doesNotMatch(css, /\.summary-track\{[^}]*animation:marquee 42s/);
});

test('Beta 1.5.6.1 mostra data ou horário e omite pré-jogo, placar e relógio',async()=>{
  assert.match(app,/import.*match-presentation/);
  assert.match(app,/scheduledDisplay/);
  assert.match(app,/if\(beforeKickoff\)value=scheduledDisplay\(mainMatchState\)/);
  assert.match(app,/const score=beforeKickoff\?scheduledDisplay\(m\)/);
  assert.match(app,/const stateLabel=beforeKickoff\?timing/);
});

test('Beta 1.6.1 oculta relógio final e respeita ao vivo sem relógio',()=>{
  assert.match(app,/function isClocklessLive/);
  assert.match(app,/function visibleMatchClock/);
  assert.match(app,/isFinalStatus\(status\)/);
});

test('Beta 1.6.1.1 mantém um único relógio local e aceita atualizações parciais',()=>{
  assert.match(app,/let mainMatchState=\{\},mainClockAnchorSeconds=null/);
  assert.match(app,/function syncMainClock/);
  assert.match(app,/if\(!mainClockTimer\)mainClockTimer=setInterval\(paintMainClock,250\)/);
  assert.match(app,/mergePresentationState\(mainMatchState,p\)/);
  assert.match(app,/if\("competition" in p\)/);
  assert.match(app,/function stopMainClockTimer/);
});


test('Beta 1.6.1.2 oculta completamente o relógio no intervalo e em estados sem cronômetro',()=>{
  assert.match(app,/function isClockHiddenState/);
  assert.match(app,/shouldShowClock\(visual\)/);
  assert.match(app,/el\.hidden=!value/);
  assert.match(app,/el\.style\.display=value\?"":"none"/);
  assert.match(app,/deriveVisualState\(null,\{phase:state\.phase\}\)/);
});


test('Beta 1.6.1.3 sincroniza período, preserva eventos e remove relógio final da lateral',()=>{
  assert.match(app,/function visualMatchStatus/);
  assert.match(app,/return"2º TEMPO"/);
  assert.match(app,/let lastValidEvents=\[\]/);
  assert.match(app,/if\(incoming\.length\)lastValidEvents=incoming\.slice\(0,8\)/);
  assert.match(app,/payload\.clear===true/);
  assert.match(app,/function lowerMatchStatus/);
  assert.match(app,/visual\.isFinal[\s\S]*return'FINAL'/);
  assert.match(app,/if\(visual\.beforeKickoff\)return scheduledDisplay\(card\)/);
  assert.match(app,/mainMatchMessage"\)\.textContent=status\|\|state\.message/);
});
