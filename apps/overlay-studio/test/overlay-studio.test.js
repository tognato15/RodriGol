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
  assert.match(html, /COMP\.<\/b><b>AÇÃO<\/b><b>RESULTADO<\/b><b>TEMPO<\/b><b>AUTOR/);
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


test("Alpha 0.4.2 mostra nomes completos no scoreboard e branding social correto", () => {
  assert.match(css, /\.tile-side\{[^}]*flex-direction:column/);
  assert.match(css, /\.tile-team\{[^}]*-webkit-line-clamp:2/);
  assert.match(html, /@RODRIGOL\.STUDIO/);
  assert.doesNotMatch(html, /@RODRIGOLTV/);
});
