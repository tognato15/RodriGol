import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');

test('home pública une agenda do dia com qualquer partida ao vivo',()=>{
  assert.match(server,/unionPublicMatches\(publicMatchesForDate\(target\),publicLiveMatches\(\)\)/);
});

test('detecção de ao vivo não depende da data cadastrada',()=>{
  assert.match(server,/function publicMatchIsLive\(match=\{\},stored=\{\},coverage=\{\}\)/);
  assert.match(server,/phase!=="PROGRAMADO"&&phase!=="FINAL"/);
});

test('partida ao vivo armazenada é forçada como live na resposta pública',()=>{
  assert.match(server,/publicMatchIsLive\(match,stored,coverage\).*\{\.\.\.match,live:true\}/s);
});

test('endpoint público de partidas também preserva jogos ao vivo fora da data',()=>{
  assert.match(server,/\/api\/public\/matches.*unionPublicMatches\(publicMatchesForDate\(date\),publicLiveMatches\(\)\)/s);
});
