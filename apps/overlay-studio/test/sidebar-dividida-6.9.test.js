import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
test('6.9 divide a lateral em carrossel superior e inferior',()=>{assert.match(html,/side-upper/);assert.match(html,/side-lower/);assert.match(css,/grid-template-rows:minmax\(0,66%\) minmax\(0,34%\)/);});
test('6.9 renderiza jogo e escalação no carrossel inferior',()=>{assert.match(js,/card\.type==='lineup'/);assert.match(js,/side-score-card/);assert.match(js,/side-lineup-card/);assert.match(js,/data-side-lower-status/);});
