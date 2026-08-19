import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);

test('Go-Live 1.1 produção força storage remoto central',async()=>{
  const data=await readFile(new URL('public/data-store.js',root),'utf8');
  assert.match(data,/remoteStorageEnabled:localHost\?Boolean\(saved\.remoteStorageEnabled\):true/);
  assert.match(data,/function reconcileRemoteSnapshot/);
  assert.match(data,/queueWidePersistence\(key,null,true,false\)/);
});

test('Go-Live 1.1 backup online é importado no servidor',async()=>{
  const storage=await readFile(new URL('public/storage.js',root),'utf8');
  const server=await readFile(new URL('server.mjs',root),'utf8');
  assert.match(storage,/\/api\/data\/import-backup/);
  assert.match(server,/function backupRecords/);
  assert.match(server,/pathname==="\/api\/data\/import-backup"/);
});

test('Go-Live 1.1 home inclui jogos ao vivo de outras datas',async()=>{
  const server=await readFile(new URL('server.mjs',root),'utf8');
  assert.match(server,/function publicLiveMatches/);
  assert.match(server,/unionPublicMatches\(publicMatchesForDate\(target\),publicLiveMatches\(\)\)/);
});
