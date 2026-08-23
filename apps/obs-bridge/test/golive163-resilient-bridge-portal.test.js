import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const bridge=await readFile(new URL('../public/bridge-client.js',import.meta.url),'utf8');
const portal=await readFile(new URL('../public/portal/index.html',import.meta.url),'utf8');

test('Go-Live 1.6.3 serializa e consolida lotes do Bridge',()=>{
  assert.match(bridge,/let batchInFlight = false/);
  assert.match(bridge,/pendingBatch = null/);
  assert.match(bridge,/mergeBatch\(pendingBatch\.commands, items\)/);
  assert.match(bridge,/queueMicrotask\(drainBatchQueue\)/);
});

test('Go-Live 1.6.3 abre circuito do batch e usa fallback sequencial',()=>{
  assert.match(bridge,/batchCircuitUntil = Date\.now\(\) \+ 120000/);
  assert.match(bridge,/publishSequentially\(commands\)/);
  assert.match(bridge,/error instanceof BridgeRequestError && error\.status === 0/);
});

test('Portal compacto remove horário duplicado de partidas programadas',()=>{
  assert.match(portal,/rightStatus=scheduled\?'':status/);
  assert.match(portal,/match-list-status:empty\{display:none\}/);
});

test('Portal compacto publica linha fina de autores dos gols',()=>{
  assert.match(portal,/function scorerListText/);
  assert.match(portal,/class=\"match-scorers\"/);
  assert.match(portal,/match\.scorers\?\.home/);
  assert.match(portal,/match\.scorers\?\.away/);
});

test('Portal compacto usa um seletor de data com calendário mensal',()=>{
  assert.match(portal,/id=\"datePickerButton\"/);
  assert.match(portal,/id=\"calendarPopover\"/);
  assert.match(portal,/function renderCalendar/);
  assert.match(portal,/data-calendar-date/);
});
