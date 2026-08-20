import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
const store=await readFile(new URL('../public/data-store.js',import.meta.url),'utf8');
const storage=await readFile(new URL('../public/storage.js',import.meta.url),'utf8');

test('Go-Live 1.2 mantém sessão administrativa válida após restart',()=>{
  assert.match(server,/createHmac/);
  assert.match(server,/createSessionToken/);
  assert.doesNotMatch(server,/const sessions=new Map/);
});

test('Go-Live 1.2 cria backups automáticos e recuperação de emergência',()=>{
  assert.match(server,/backupCurrentData\("before-import"\)/);
  assert.match(server,/scheduleAutomaticBackup/);
  assert.match(server,/Base recuperada automaticamente do backup/);
  assert.match(server,/\/api\/data\/status/);
});

test('Go-Live 1.2 bloqueia base central suspeitamente vazia',()=>{
  assert.match(store,/remoteKeys\.size<=2&&localKeys\.length>=10/);
  assert.match(store,/rodrigol:remote-storage-conflict/);
});

test('Go-Live 1.2 repete gravação remota que falhar',()=>{
  assert.match(store,/remoteRetryQueue/);
  assert.match(store,/flushRemoteRetries/);
  assert.match(store,/retrying:true/);
});

test('Go-Live 1.2 importa no servidor antes de substituir o navegador',()=>{
  const remoteImport=storage.indexOf("fetch('/api/data/import-backup'");
  const clearLocal=storage.indexOf('localStorage.clear()',remoteImport);
  assert.ok(remoteImport>=0);
  assert.ok(clearLocal>remoteImport);
  assert.match(storage,/Backup da base central exportado com sucesso/);
});
