import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
test('6.9.1 reduz a lateral inferior e devolve espaço ao carrossel superior',()=>{assert.match(css,/grid-template-rows:minmax\(0,66%\) minmax\(0,34%\)/);});
test('6.9.1 mostra minuto e autor dos gols no card de partida',()=>{assert.match(js,/side-score-goals/);assert.match(js,/goal\.minute/);assert.match(js,/goal\.player/);});
