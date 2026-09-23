import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const sports=read('../public/sports-engine.js');
const presentation=read('../public/match-presentation.js');
const control=read('../public/control.js');
const html=read('../public/index.html');
const portal=read('../public/portal/index.html');

test('basquete usa relógio regressivo de dez minutos por quarto',()=>{
  assert.match(sports,/BASKETBALL:\{unit:'ponto',clock:\{mode:'countdown',seconds:600\}/);
  assert.ok(control.includes("state.clockDirection=cfg.mode==='countdown'?'DOWN':'UP'"));
  assert.match(presentation,/coverage\.clockDirection === 'DOWN'/);
});
test('segmentos multiesportivos são apresentados como AO VIVO e não PRÉ-JOGO',()=>{
  assert.match(presentation,/SEGMENT_PHASES\.has\(phase\).*status: 'AO VIVO'/s);
});
test('cabine permite editar relógio e operar segmento sem relógio',()=>{
  assert.match(html,/id="editClock"/); assert.match(html,/id="noClock"/);
  assert.match(control,/function editClock\(\)/); assert.match(control,/function setNoClock\(\)/);
  assert.match(control,/clockDisabled=true/);
});
test('esportes por sets podem operar sem relógio por padrão',()=>{
  assert.match(sports,/TENNIS:\{clock:\{mode:'none'\}/);
  assert.match(sports,/VOLLEYBALL:\{clock:\{mode:'none'\}/);
});
test('portal traduz eventos de pontos para português',()=>{
  assert.match(portal,/POINT_2'\)return'2 pontos'/);
  assert.match(portal,/POINT_3'\)return'3 pontos'/);
});
