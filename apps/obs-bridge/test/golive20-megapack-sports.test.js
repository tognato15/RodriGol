import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const root=new URL('../public/',import.meta.url);const read=p=>readFile(new URL(p,root),'utf8');
test('cadastros oferecem as 20 modalidades oficiais',async()=>{const html=await read('matches.html');for(const x of ['Basquete','Beisebol','Boxe','Críquete','Football','Futsal','Handebol','Hockey','Hóquei Sobre Grama','Hóquei Sobre Patins','Judô','Netball','Polo aquático','Rugby','Rugby League','Tênis','Tênis de Mesa','Vôlei','Vôlei de Praia'])assert.match(html,new RegExp(x));});
test('clubes aceitam múltiplas modalidades oficiais',async()=>{const html=await read('clubs.html');assert.match(html,/name="sports"/);assert.match(html,/RUGBY_LEAGUE/);assert.match(html,/BEACH_VOLLEYBALL/);});
test('basquete possui quatro quartos e pontuação 1 2 3',async()=>{const js=await read('sports-engine.js');assert.match(js,/BASKETBALL:[\s\S]*Q1[\s\S]*Q4[\s\S]*POINT_1[\s\S]*POINT_3/);});
test('modalidades segmentadas possuem sets innings rounds e períodos',async()=>{const js=await read('sports-engine.js');for(const x of ['SET_5','INNING_9','length:12','P3'])assert.match(js,new RegExp(x));});
test('cabine usa perfil da modalidade para eventos e fases',async()=>{const js=await read('control.js');assert.match(js,/sportProfile\(sport\)/);assert.match(js,/phaseOptions\(sport\)/);assert.match(js,/profile\.events/);});
test('servidor mantém partida explicitamente no ar no feed público',async()=>{const js=await read('../server.mjs');assert.match(js,/onAirId[\s\S]*publicMatch\(stored\)[\s\S]*byId\.set/);});
test('ambiente local sincroniza controle e portal pelo servidor central',async()=>{const js=await read('data-store.js');assert.match(js,/remoteStorageEnabled:true/);});
