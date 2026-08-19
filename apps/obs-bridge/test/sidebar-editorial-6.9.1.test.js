import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const control=fs.readFileSync(new URL('../public/overlay-control.js',import.meta.url),'utf8');
const regions=fs.readFileSync(new URL('../public/studio-regions.js',import.meta.url),'utf8');
test('6.9.1 limita o carrossel inferior a partidas de hoje ou futuras',()=>{assert.match(control,/sidebarLowerEligibleMatches/);assert.match(control,/String\(match\.date\|\|''\)>=today/);assert.match(regions,/String\(item\.date\|\|''\)>=today/);});
test('6.9.1 envia autores e minutos dos gols para o card lateral',()=>{assert.match(control,/sidebarLowerGoals/);assert.match(control,/homeGoals/);assert.match(control,/awayGoals/);assert.match(regions,/homeGoals:match\.homeGoals/);});
