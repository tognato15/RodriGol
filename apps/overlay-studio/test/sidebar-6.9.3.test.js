import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../public/app.js', import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../public/styles.css', import.meta.url),'utf8');

test('6.9.3 não soma clockStartedAt ao elapsed efetivo recebido do Bridge',()=>{
  assert.match(app,/let elapsed=Math\.max\(0,Number\(rawIncoming\?\?0\)\|\|0\)/);
  assert.doesNotMatch(app,/anchoredIncoming/);
});

test('6.9.3 força FINAL no card inferior quando a partida está encerrada',()=>{
  assert.match(app,/card\.isFinal===true\|\|visual\.isFinal/);
  assert.match(app,/return'FINAL'/);
});

test('6.9.3 remove visualmente os paginadores das duas laterais',()=>{
  assert.match(css,/\.side-upper>footer,\.side-lower>footer\{display:none!important\}/);
  assert.match(css,/\.side-upper\{grid-template-rows:4\.2vh minmax\(0,1fr\)!important\}/);
  assert.match(css,/\.side-lower\{grid-template-rows:3vh minmax\(0,1fr\)!important\}/);
});
