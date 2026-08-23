import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const bridge=await readFile(new URL('../public/bridge-client.js',import.meta.url),'utf8');
const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');

test('Go-Live 1.6.4 envia comandos operacionais pelo WebSocket persistente',()=>{
  assert.match(bridge,/const managedSockets = new Set\(\)/);
  assert.match(bridge,/publishViaSocket\('publish-command'/);
  assert.match(bridge,/publishViaSocket\('publish-commands'/);
  assert.match(bridge,/transport:'websocket'/);
});

test('Go-Live 1.6.4 servidor recebe comando e lote pelo WebSocket',()=>{
  assert.match(server,/message\?\.type==="publish-command"/);
  assert.match(server,/message\?\.type==="publish-commands"/);
  assert.match(server,/type:"command-ack"/);
  assert.match(server,/consumeClientSocketFrames\(socket,buffer\)/);
});

test('Go-Live 1.6.4 suporta frames WebSocket fragmentados',()=>{
  assert.match(server,/socket\._rodrigolWsFragment=\[payload\]/);
  assert.match(server,/Buffer\.concat\(socket\._rodrigolWsFragment\)/);
});

test('Go-Live 1.6.4 não cria tempestade HTTP após falha de batch',()=>{
  assert.match(bridge,/batchCircuitUntil = Date\.now\(\) \+ 30000/);
  assert.match(bridge,/transport:'http-failed'/);
  assert.doesNotMatch(bridge,/batchCircuitUntil = Date\.now\(\) \+ 120000[\s\S]{0,120}publishSequentially\(commands\)/);
});

test('Portal mostra autores centralizados abaixo de cada equipe',()=>{
  assert.match(portal,/class="match-team-copy"/);
  assert.match(portal,/class="match-team-name"/);
  assert.match(portal,/class="team-scorers/);
  assert.match(portal,/justify-items:center/);
});

test('Portal recupera minuto do gol pela cronologia quando faltante no scorer',()=>{
  assert.match(portal,/function goalEventEntries\(match,side\)/);
  assert.match(portal,/if\(row\.minute\)continue/);
  assert.match(portal,/normalizePlayerName\(item\.player\)===normalizePlayerName\(row\.player\)/);
  assert.match(portal,/\\d\{1,3\}\(\?:\\\+\\d\{1,2\}\)\?/);
});
