import { createManagedSocket } from './bridge-client.js';
const CLUBS_KEY = 'rodrigol-clubs-v1';
const MATCHES_KEY = 'rodrigol-matches-v1';
const ACTIVE_MATCH_KEY = 'rodrigol-active-match-v1';
const ON_AIR_MATCH_KEY = 'rodrigol-on-air-match-v1';
const COVERAGE_PREFIX = 'rodrigol-coverage-v1:';
const HISTORY_KEY = 'rodrigol-history-v1';
const COMPETITIONS_KEY = 'rodrigol-competitions-v1';
const STORAGE_ERROR_KEY = 'rodrigol-storage-error-v1';
const WIDE_DATA_STORE = 'data-records';
const REMOTE_REVISION_KEY = 'rodrigol-remote-data-revision-v1';
const wideDataCache = new Map();
let wideDataDb = null;
let remoteDataRevision = Number(localStorage.getItem(REMOTE_REVISION_KEY)) || 0;
let remoteHydrationPending = false;
const clientInstanceId = crypto.randomUUID?.() || `client-${Date.now()}-${Math.random()}`;
const pendingWideWrites = new Map();
const remoteRetryQueue = new Map();
const remoteWriteChains = new Map();
let remoteRetryTimer = null;
let remoteConflictDetected = false;

// Produção não possui mais seeds esportivos. Dados estruturais devem vir das bases publicadas/remotas.
const seedClubs = [];


const seedCompetitions = [];
export function getCompetitions(){if(!has(COMPETITIONS_KEY))return [];return parse(COMPETITIONS_KEY,[]).map(item=>({...item,logoDataUrl:competitionLogoCache.get(item.id)||''})).sort((a,b)=>(Number(a.priority)||999)-(Number(b.priority)||999)||String(a.name).localeCompare(String(b.name)));}
export function saveCompetitions(items){return write(COMPETITIONS_KEY,items.map(({logoDataUrl,...item})=>item));}
export async function upsertCompetition(item){const items=getCompetitions();const index=items.findIndex(x=>x.id===item.id);const {logoDataUrl,...record}=item;if(logoDataUrl!==undefined)await setCompetitionLogo(item.id,logoDataUrl);const normalized={...record,logoDataUrl:logoDataUrl||competitionLogoCache.get(item.id)||''};if(index>=0)items[index]=normalized;else items.push(normalized);return saveCompetitions(items);}
export function deleteCompetition(id){deleteCompetitionLogo(id).catch(()=>{});return saveCompetitions(getCompetitions().filter(x=>x.id!==id));}
export function getCompetition(id){return getCompetitions().find(x=>x.id===id)||null;}
function inferredCompetitionStages(competition={}){const make=(type,name,order,extra={})=>({id:`${competition.id||'competition'}-${type.toLowerCase()}-${order}`,name,type,order,...extra});switch(competition.format){case'LEAGUE':return[make('LEAGUE','Classificação geral',1)];case'GROUPS':return[make('GROUPS','Fase de grupos',1,{qualifiers:2,groups:[{id:`${competition.id}-group-a`,name:'Grupo A',order:1},{id:`${competition.id}-group-b`,name:'Grupo B',order:2}]})];case'KNOCKOUT':case'CUP':return[make('KNOCKOUT','Fase eliminatória',1)];case'LEAGUE_KNOCKOUT':return[make('LEAGUE','Fase de liga',1),make('KNOCKOUT','Fase eliminatória',2)];case'GROUPS_KNOCKOUT':return[make('GROUPS','Fase de grupos',1,{qualifiers:2,groups:[{id:`${competition.id}-group-a`,name:'Grupo A',order:1},{id:`${competition.id}-group-b`,name:'Grupo B',order:2}]}),make('KNOCKOUT','Fase eliminatória',2)];case'LEAGUE_GROUPS_KNOCKOUT':return[make('LEAGUE','Classificação geral',1),make('GROUPS','Quadrangulares',2,{qualifiers:2,groups:[{id:`${competition.id}-group-a`,name:'Grupo A',order:1},{id:`${competition.id}-group-b`,name:'Grupo B',order:2}]}),make('KNOCKOUT','Semifinais e final',3)];default:return[];}}
export function getCompetitionStages(competitionOrId){const competition=typeof competitionOrId==='string'?getCompetition(competitionOrId):competitionOrId;if(!competition)return[];const source=Array.isArray(competition.stages)&&competition.stages.length?competition.stages:inferredCompetitionStages(competition);return source.map((stage,index)=>({id:String(stage.id||uid('stage')),name:String(stage.name||`Fase ${index+1}`),type:['LEAGUE','GROUPS','KNOCKOUT'].includes(stage.type)?stage.type:'LEAGUE',order:Number(stage.order)||index+1,turns:Math.max(1,Number(stage.turns)||1),qualifiers:Math.max(1,Number(stage.qualifiers)||2),groups:(Array.isArray(stage.groups)?stage.groups:[]).map((group,groupIndex)=>({id:String(group.id||uid('group')),name:String(group.name||`Grupo ${String.fromCharCode(65+groupIndex)}`),order:Number(group.order)||groupIndex+1}))})).sort((a,b)=>a.order-b.order);}
export function standingTableId(competitionId,stageId='',groupId=''){return [competitionId,stageId,groupId].filter(Boolean).join('__');}
export function getStandingTargets(competitionOrId){const competition=typeof competitionOrId==='string'?getCompetition(competitionOrId):competitionOrId;if(!competition)return[];const targets=[];for(const stage of getCompetitionStages(competition)){if(stage.type==='LEAGUE')targets.push({id:standingTableId(competition.id,stage.id),competitionId:competition.id,stageId:stage.id,groupId:'',name:stage.name,label:`${competition.shortName||competition.name} · ${stage.name}`});if(stage.type==='GROUPS')for(const group of stage.groups||[])targets.push({id:standingTableId(competition.id,stage.id,group.id),competitionId:competition.id,stageId:stage.id,groupId:group.id,name:`${stage.name} — ${group.name}`,label:`${competition.shortName||competition.name} · ${stage.name} · ${group.name}`});}return targets;}
export function findCompetitionByName(name=''){const key=String(name).trim().toLowerCase();return getCompetitions().find(x=>[x.name,x.shortName,x.abbreviation].some(v=>String(v||'').trim().toLowerCase()===key))||null;}

const seedMatches = [];

function isWideDataKey(key) {
  return String(key || '').startsWith('rodrigol-')
    && !['rodrigol-runtime-config-v2','rodrigol-storage-error-v1',REMOTE_REVISION_KEY].includes(String(key));
}
function has(key) { return isWideDataKey(key) ? wideDataCache.has(key) : localStorage.getItem(key) !== null; }
function parse(key, fallback) {
  try {
    if (isWideDataKey(key) && wideDataCache.has(key)) {
      const value = wideDataCache.get(key);
      return Array.isArray(fallback) ? (Array.isArray(value) ? structuredClone(value) : fallback) : (structuredClone(value) ?? fallback);
    }
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(value) ? value : fallback) : (value ?? fallback);
  } catch {
    return fallback;
  }
}
function isQuotaError(error) {
  return Boolean(error) && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014);
}
function reportStorageError(key, error, attemptedBytes = 0) {
  const detail = { key, name: error?.name || 'StorageError', message: error?.message || 'Não foi possível salvar os dados.', attemptedBytes, at: new Date().toISOString() };
  try { sessionStorage.setItem(STORAGE_ERROR_KEY, JSON.stringify(detail)); } catch {}
  window.dispatchEvent(new CustomEvent('rodrigol:storage-error', { detail }));
  return detail;
}
function runtimeForDataSync(){
  let saved={};
  try { saved=JSON.parse(localStorage.getItem('rodrigol-runtime-config-v2') || '{}'); } catch {}
  const localHost=['localhost','127.0.0.1','::1'].includes(location.hostname);
  return {
    ...saved,
    bridgeHttp:String(saved.bridgeHttp||location.origin).replace(/\/$/,''),
    remoteStorageEnabled:true
  };
}

function bridgeBaseForData(){ const cfg=runtimeForDataSync(); return String(cfg.bridgeHttp || location.origin).replace(/\/$/,''); }
function authHeadersForData(extra={}){ const token=String(runtimeForDataSync().apiToken||'').trim(); return token?{...extra,Authorization:`Bearer ${token}`}:{...extra}; }
function rememberRemoteRevision(value){ remoteDataRevision=Math.max(remoteDataRevision,Number(value)||0); try{localStorage.setItem(REMOTE_REVISION_KEY,String(remoteDataRevision));}catch{} return remoteDataRevision; }

function queueRemoteRetry(key, value, deleted=false){
  remoteRetryQueue.set(key,{key,value,deleted,attempts:(remoteRetryQueue.get(key)?.attempts||0)+1});
  if(remoteRetryTimer)return;
  remoteRetryTimer=setTimeout(flushRemoteRetries,2000);
}
async function flushRemoteRetries(){
  remoteRetryTimer=null;
  const cfg=runtimeForDataSync();if(!cfg.remoteStorageEnabled||!remoteRetryQueue.size)return;
  for(const [key,item] of [...remoteRetryQueue]){
    try{const response=await fetch(`${bridgeBaseForData()}/api/data/${encodeURIComponent(key)}`,{method:item.deleted?'DELETE':'PUT',credentials:'include',headers:authHeadersForData({'Content-Type':'application/json'}),body:item.deleted?undefined:JSON.stringify({value:item.value,source:clientInstanceId})});if(!response.ok)throw new Error(`Servidor respondeu ${response.status}`);const result=await response.json();rememberRemoteRevision(result.revision);remoteRetryQueue.delete(key);window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'synced',revision:result.revision,retried:true}}));}
    catch(error){item.attempts+=1;remoteRetryQueue.set(key,item);window.dispatchEvent(new CustomEvent('rodrigol:remote-storage-error',{detail:{key,error:error.message,retrying:true,attempts:item.attempts}}));}
  }
  if(remoteRetryQueue.size)remoteRetryTimer=setTimeout(flushRemoteRetries,Math.min(15000,2000+remoteRetryQueue.size*500));
}
function queueWidePersistence(key, value, deleted=false, syncRemote=true){
  if(wideDataDb){
    const operation = new Promise((resolve,reject)=>{
      const tx=wideDataDb.transaction(WIDE_DATA_STORE,'readwrite');
      const store=tx.objectStore(WIDE_DATA_STORE);
      deleted?store.delete(key):store.put(value,key);
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    }).catch(error=>reportStorageError(key,error));
    pendingWideWrites.set(key,operation);
    operation.finally(()=>{if(pendingWideWrites.get(key)===operation)pendingWideWrites.delete(key);});
  }
  const cfg=runtimeForDataSync();
  if(cfg.remoteStorageEnabled&&syncRemote){
    window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'pending'}}));
    const previous=remoteWriteChains.get(key)||Promise.resolve();
    const request=previous.catch(()=>{}).then(()=>fetch(`${bridgeBaseForData()}/api/data/${encodeURIComponent(key)}`,{
      method:deleted?'DELETE':'PUT',credentials:'include',headers:authHeadersForData({'Content-Type':'application/json'}),
      body:deleted?undefined:JSON.stringify({value,source:clientInstanceId})
    })).then(r=>{if(!r.ok)throw new Error(`Servidor respondeu ${r.status}`);return r.json();})
      .then(result=>{rememberRemoteRevision(result.revision);remoteRetryQueue.delete(key);window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'synced',revision:result.revision}}));return result;})
      .catch(error=>{queueRemoteRetry(key,value,deleted);window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'retrying',error:error.message}}));window.dispatchEvent(new CustomEvent('rodrigol:remote-storage-error',{detail:{key,error:error.message,retrying:true}}));return null;})
      .finally(()=>{if(remoteWriteChains.get(key)===request)remoteWriteChains.delete(key);});
    remoteWriteChains.set(key,request);
  }
}
function write(key, value, syncRemote = true) {
  if(isWideDataKey(key)){
    wideDataCache.set(key,structuredClone(value));
    queueWidePersistence(key,value,false,syncRemote);
  }else{
    const serialized=JSON.stringify(value);
    try{localStorage.setItem(key,serialized);}catch(error){
      const detail=reportStorageError(key,error,new Blob([serialized]).size);
      if(isQuotaError(error)){const quotaError=new Error('O armazenamento local do RodriGol está cheio. Nenhum dado novo foi salvo. Abra Controle > Armazenamento e Backup.');quotaError.name='RodriGolQuotaExceededError';quotaError.cause=error;quotaError.detail=detail;throw quotaError;}
      throw error;
    }
  }
  window.dispatchEvent(new CustomEvent('rodrigol:data-changed', { detail: { key, value } }));
  return value;
}
function remove(key) {
  if(isWideDataKey(key)){wideDataCache.delete(key);queueWidePersistence(key,null,true);}else localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('rodrigol:data-changed', { detail: { key, value: null } }));
}


// Armazenamento amplo para escudos. Os metadados dos clubes continuam síncronos,
// enquanto as imagens ficam no IndexedDB para não esgotar o localStorage.
const CLUB_ASSET_DB='rodrigol-assets-v1';
const CLUB_ASSET_STORE='club-crests';
const COMPETITION_ASSET_STORE='competition-logos';
const clubCrestCache=new Map();
const competitionLogoCache=new Map();
function openAssetDb(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window)){resolve(null);return;}const req=indexedDB.open(CLUB_ASSET_DB,3);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(CLUB_ASSET_STORE))db.createObjectStore(CLUB_ASSET_STORE);if(!db.objectStoreNames.contains(COMPETITION_ASSET_STORE))db.createObjectStore(COMPETITION_ASSET_STORE);if(!db.objectStoreNames.contains(WIDE_DATA_STORE))db.createObjectStore(WIDE_DATA_STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
const assetDb=await openAssetDb().catch(()=>null);
wideDataDb=assetDb;
const REMOTE_CLUB_CREST_PREFIX='rodrigol-asset-club-crest:';
const REMOTE_COMPETITION_LOGO_PREFIX='rodrigol-asset-competition-logo:';
function remoteAssetKey(kind,id){return `${kind==='competition'?REMOTE_COMPETITION_LOGO_PREFIX:REMOTE_CLUB_CREST_PREFIX}${id}`;}
function isRemoteAssetKey(key=''){return String(key).startsWith(REMOTE_CLUB_CREST_PREFIX)||String(key).startsWith(REMOTE_COMPETITION_LOGO_PREFIX);}
async function putAssetLocal(storeName,id,value){
  if(!assetDb)return;
  await new Promise((resolve,reject)=>{const tx=assetDb.transaction(storeName,'readwrite');const store=tx.objectStore(storeName);value?store.put(value,id):store.delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  if(storeName===CLUB_ASSET_STORE){if(value)clubCrestCache.set(id,value);else clubCrestCache.delete(id);}
  else{if(value)competitionLogoCache.set(id,value);else competitionLogoCache.delete(id);}
}
function queueRemoteAsset(kind,id,value){
  const cfg=runtimeForDataSync();if(!cfg.remoteStorageEnabled)return;
  const key=remoteAssetKey(kind,id);
  fetch(`${bridgeBaseForData()}/api/data/${encodeURIComponent(key)}`,{
    method:value?'PUT':'DELETE',
    headers:authHeadersForData({'Content-Type':'application/json'}),
    credentials:'include',
    body:value?JSON.stringify({value,source:clientInstanceId}):undefined
  }).then(r=>{if(!r.ok)throw new Error(`Servidor respondeu ${r.status}`);return r.json();})
    .then(result=>{rememberRemoteRevision(result.revision);})
    .catch(error=>window.dispatchEvent(new CustomEvent('rodrigol:remote-storage-error',{detail:{key,error:error.message}})));
}
async function applyRemoteAssetRecord(key,value){
  if(String(key).startsWith(REMOTE_CLUB_CREST_PREFIX)){
    const id=String(key).slice(REMOTE_CLUB_CREST_PREFIX.length);await putAssetLocal(CLUB_ASSET_STORE,id,value||'');return true;
  }
  if(String(key).startsWith(REMOTE_COMPETITION_LOGO_PREFIX)){
    const id=String(key).slice(REMOTE_COMPETITION_LOGO_PREFIX.length);await putAssetLocal(COMPETITION_ASSET_STORE,id,value||'');return true;
  }
  return false;
}

async function loadWideData(){
  if(!wideDataDb)return;
  await new Promise((resolve,reject)=>{const tx=wideDataDb.transaction(WIDE_DATA_STORE,'readonly'),store=tx.objectStore(WIDE_DATA_STORE),req=store.openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){wideDataCache.set(String(cursor.key),cursor.value);cursor.continue();}else resolve();};req.onerror=()=>reject(req.error);});
  const legacyKeys=[];
  for(let index=0;index<localStorage.length;index+=1){const key=localStorage.key(index);if(key&&isWideDataKey(key))legacyKeys.push(key);}
  for(const key of legacyKeys){
    if(!wideDataCache.has(key)){try{wideDataCache.set(key,JSON.parse(localStorage.getItem(key)));}catch{continue;}queueWidePersistence(key,wideDataCache.get(key),false,false);}
  }
  await Promise.allSettled([...pendingWideWrites.values()]);
  for(const key of legacyKeys)localStorage.removeItem(key);
}
async function reconcileRemoteSnapshot(snapshot={}){
  const records=snapshot.records||{};
  const partial=snapshot.partial===true;
  const deletedKeys=Array.isArray(snapshot.deletedKeys)?snapshot.deletedKeys:[];
  const remoteKeys=new Set(Object.keys(records).filter(key=>isWideDataKey(key)));
  const localKeys=[...wideDataCache.keys()].filter(key=>isWideDataKey(key));
  if(!remoteConflictDetected&&remoteKeys.size<=2&&localKeys.length>=10){
    remoteConflictDetected=true;
    const detail={type:'sparse-remote',remoteRecords:remoteKeys.size,localRecords:localKeys.length,revision:Number(snapshot.revision)||0,message:'A base central está vazia ou muito menor que a base local. A sincronização destrutiva foi bloqueada.'};
    window.dispatchEvent(new CustomEvent('rodrigol:remote-storage-conflict',{detail}));
    console.error('[RodriGol] Sincronização bloqueada por segurança:',detail);
    return false;
  }
  if(!partial){
    for(const key of [...wideDataCache.keys()]){
      if(remoteKeys.has(key))continue;
      wideDataCache.delete(key);
      queueWidePersistence(key,null,true,false);
      window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:null,source:'remote'}}));
    }
  }
  for(const key of deletedKeys){
    if(!isWideDataKey(key))continue;
    wideDataCache.delete(key);
    queueWidePersistence(key,null,true,false);
    window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:null,source:'remote-delta'}}));
  }
  for(const [key,value] of Object.entries(records)){
    if(isRemoteAssetKey(key)){await applyRemoteAssetRecord(key,value);continue;}
    if(!isWideDataKey(key))continue;
    const before=JSON.stringify(wideDataCache.get(key));
    const after=JSON.stringify(value);
    wideDataCache.set(key,value);
    queueWidePersistence(key,value,false,false);
    if(before!==after)window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value,source:'remote'}}));
  }
  return true;
}
async function hydrateRemoteData(){
  const cfg=runtimeForDataSync(); if(!cfg.remoteStorageEnabled)return;
  try{
    const coreMissing=!wideDataCache.has(MATCHES_KEY)||!wideDataCache.has(CLUBS_KEY)||!wideDataCache.has(COMPETITIONS_KEY);
    const since=coreMissing?0:remoteDataRevision;
    const suffix=since?`?since=${encodeURIComponent(since)}`:'';
    const response=await fetch(`${bridgeBaseForData()}/api/data/snapshot${suffix}`,{credentials:'include',headers:authHeadersForData()});
    if(!response.ok)throw new Error(`Servidor respondeu ${response.status}`);
    const snapshot=await response.json();
    if(snapshot.unchanged){rememberRemoteRevision(snapshot.revision);return true;}
    const reconciled=await reconcileRemoteSnapshot(snapshot);
    if(reconciled!==false)rememberRemoteRevision(snapshot.revision);
    return reconciled;
  }catch(error){window.dispatchEvent(new CustomEvent('rodrigol:remote-storage-error',{detail:{error:error.message}}));return false;}
}
async function pollRemoteData(){
  const cfg=runtimeForDataSync(); if(!cfg.remoteStorageEnabled||document.hidden)return;
  try{
    const response=await fetch(`${bridgeBaseForData()}/api/data/snapshot?since=${encodeURIComponent(remoteDataRevision)}`,{credentials:'include',headers:authHeadersForData()});
    if(!response.ok)return;
    const snapshot=await response.json();
    if(snapshot.unchanged||(Number(snapshot.revision)||0)<=remoteDataRevision)return;
    const reconciled=await reconcileRemoteSnapshot(snapshot);
    if(reconciled!==false)rememberRemoteRevision(snapshot.revision);
  }catch{}
}
await loadWideData().catch(error=>reportStorageError('wide-data',error));
remoteHydrationPending=runtimeForDataSync().remoteStorageEnabled;
const remoteHydrationPromise=new Promise(resolve=>setTimeout(resolve,150)).then(()=>hydrateRemoteData()).finally(()=>{remoteHydrationPending=false;window.dispatchEvent(new CustomEvent('rodrigol:remote-hydrated',{detail:{revision:remoteDataRevision}}));});
let remoteDataSocket=null;
function applyRemoteDataEnvelope(envelope={}){
  if(envelope.type==='data-patch'){
    const revision=Number(envelope.revision)||0; rememberRemoteRevision(revision);
    if(envelope.source===clientInstanceId)return;
    const key=String(envelope.key||''), patch=envelope.patch||{};
    if(key===MATCHES_KEY&&patch.op==='upsert'&&patch.value?.id){const rows=getMatches();const i=rows.findIndex(x=>x.id===patch.value.id);if(i>=0)rows[i]=patch.value;else rows.push(patch.value);wideDataCache.set(key,rows);queueWidePersistence(key,rows,false,false);window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:rows,source:'remote-ws-patch'}}));return;}
    if(key===HISTORY_KEY&&patch.op==='upsert'&&patch.value?.matchId){const history=getHistoryState();const i=history.entries.findIndex(x=>x.matchId===patch.value.matchId);if(i>=0)history.entries[i]={...history.entries[i],...patch.value};else history.entries.unshift(patch.value);history.entries=history.entries.slice(0,500);wideDataCache.set(key,history);queueWidePersistence(key,history,false,false);window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:history,source:'remote-ws-patch'}}));return;}
    return;
  }
  if(envelope.type!=='data-change')return;
  const revision=Number(envelope.revision)||0;
  rememberRemoteRevision(revision);
  if(envelope.source===clientInstanceId)return;
  const key=String(envelope.key||'');
  if(!key)return;
  if(isRemoteAssetKey(key)){applyRemoteAssetRecord(key,envelope.deleted?null:envelope.value).catch(()=>{});return;}
  if(!isWideDataKey(key))return;
  if(envelope.deleted){
    wideDataCache.delete(key);queueWidePersistence(key,null,true,false);
    window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:null,source:'remote-ws'}}));
    return;
  }
  const before=JSON.stringify(wideDataCache.get(key));
  const after=JSON.stringify(envelope.value);
  wideDataCache.set(key,envelope.value);queueWidePersistence(key,envelope.value,false,false);
  if(before!==after)window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key,value:envelope.value,source:'remote-ws'}}));
}
function startRemoteDataSocket(){
  const cfg=runtimeForDataSync();if(!cfg.remoteStorageEnabled)return;
  remoteDataSocket=createManagedSocket({
    onMessage:event=>{try{applyRemoteDataEnvelope(JSON.parse(event.data));}catch{}},
    onStatus:detail=>window.dispatchEvent(new CustomEvent('rodrigol:remote-data-status',{detail}))
  });
}
startRemoteDataSocket();
// WebSocket é o caminho principal. Polling permanece apenas como rede de segurança.
setInterval(pollRemoteData,10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollRemoteData();});
async function loadClubCrests(){if(!assetDb)return;await new Promise((resolve,reject)=>{const tx=assetDb.transaction(CLUB_ASSET_STORE,'readonly'),store=tx.objectStore(CLUB_ASSET_STORE),req=store.openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){clubCrestCache.set(String(cursor.key),cursor.value||'');cursor.continue();}else resolve();};req.onerror=()=>reject(req.error);});}
async function setClubCrest(id,value){await putAssetLocal(CLUB_ASSET_STORE,id,value||'');queueRemoteAsset('club',id,value||'');}
async function deleteClubCrest(id){await putAssetLocal(CLUB_ASSET_STORE,id,'');queueRemoteAsset('club',id,'');}
await loadClubCrests().catch(()=>{});
async function loadCompetitionLogos(){if(!assetDb)return;await new Promise((resolve,reject)=>{const tx=assetDb.transaction(COMPETITION_ASSET_STORE,'readonly'),store=tx.objectStore(COMPETITION_ASSET_STORE),req=store.openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){competitionLogoCache.set(String(cursor.key),cursor.value||'');cursor.continue();}else resolve();};req.onerror=()=>reject(req.error);});}
async function setCompetitionLogo(id,value){await putAssetLocal(COMPETITION_ASSET_STORE,id,value||'');queueRemoteAsset('competition',id,value||'');}
async function deleteCompetitionLogo(id){await putAssetLocal(COMPETITION_ASSET_STORE,id,'');queueRemoteAsset('competition',id,'');}
await loadCompetitionLogos().catch(()=>{});
async function migrateCompetitionLogos(){const stored=parse(COMPETITIONS_KEY,[]);let changed=false;for(const competition of stored){if(competition?.logoDataUrl){await setCompetitionLogo(competition.id,competition.logoDataUrl).catch(()=>{});delete competition.logoDataUrl;changed=true;}}if(changed)write(COMPETITIONS_KEY,stored);}
await migrateCompetitionLogos().catch(()=>{});

async function migrateClubCrests(){const stored=parse(CLUBS_KEY,[]);let changed=false;for(const club of stored){if(club?.crestDataUrl){await setClubCrest(club.id,club.crestDataUrl).catch(()=>{});delete club.crestDataUrl;changed=true;}}if(changed)write(CLUBS_KEY,stored);}
await migrateClubCrests().catch(()=>{});

export function uid(prefix = 'item') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export function getClubs() { if (!has(CLUBS_KEY)) return []; return parse(CLUBS_KEY, []).map(club=>({...club,crestDataUrl:clubCrestCache.get(club.id)||''})); }
export function saveClubs(clubs) { return write(CLUBS_KEY, clubs.map(({crestDataUrl,...club})=>club)); }
export async function upsertClub(club) { const clubs = getClubs(); const index = clubs.findIndex(item => item.id === club.id); const {crestDataUrl,...record}=club;if(crestDataUrl!==undefined)await setClubCrest(club.id,crestDataUrl);if(index>=0)clubs[index]={...record,crestDataUrl:crestDataUrl||clubCrestCache.get(club.id)||''};else clubs.push({...record,crestDataUrl:crestDataUrl||''});return saveClubs(clubs); }
export function deleteClub(id) { saveClubs(getClubs().filter(item => item.id !== id)); deleteClubCrest(id).catch(()=>{}); saveMatches(getMatches().filter(match => match.homeClubId !== id && match.awayClubId !== id)); }
export function getClub(id) { return getClubs().find(item => item.id === id) || null; }
export function getMatches(){if(!has(MATCHES_KEY))return [];return parse(MATCHES_KEY,[]);}
export function saveMatches(matches) { return write(MATCHES_KEY, matches); }
function queueRemoteRecordPatch(kind,id,value){
  const cfg=runtimeForDataSync(); if(!cfg.remoteStorageEnabled)return;
  const key=kind==='match'?MATCHES_KEY:HISTORY_KEY;
  window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'pending',recordId:id}}));
  fetch(`${bridgeBaseForData()}/api/data-patch/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`,{
    method:'PATCH',credentials:'include',headers:authHeadersForData({'Content-Type':'application/json'}),
    body:JSON.stringify({value,source:clientInstanceId})
  }).then(r=>{if(!r.ok)throw new Error(`Servidor respondeu ${r.status}`);return r.json();})
    .then(result=>{rememberRemoteRevision(result.revision);window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'synced',revision:result.revision,recordId:id}}));})
    .catch(error=>{ // fallback seguro: a fila tradicional reenviará a coleção completa
      queueRemoteRetry(key,wideDataCache.get(key),false);
      window.dispatchEvent(new CustomEvent('rodrigol:remote-sync-status',{detail:{key,state:'retrying',error:error.message,recordId:id}}));
    });
}
export function upsertMatch(match) { const matches = getMatches(); const index = matches.findIndex(item => item.id === match.id); if (index >= 0) matches[index] = match; else matches.push(match); write(MATCHES_KEY,matches,false); queueRemoteRecordPatch('match',match.id,match); return matches; }
export function deleteMatch(id) {
  const activeId = parse(ACTIVE_MATCH_KEY, '');
  const onAirId = parse(ON_AIR_MATCH_KEY, '');
  saveMatches(getMatches().filter(item => item.id !== id));
  if (activeId === id) remove(ACTIVE_MATCH_KEY);
  if (onAirId === id) remove(ON_AIR_MATCH_KEY);
  remove(COVERAGE_PREFIX + id);
}
export function getMatch(id) { return getMatches().find(item => item.id === id) || null; }
export function setActiveMatchId(id) { if (!getMatch(id)) return ''; write(ACTIVE_MATCH_KEY, id); return id; }
export function getActiveMatchId() { const matches = getMatches(); const usable=matches.filter(match=>!match.archivedAt&&!['FINAL','ARCHIVED'].includes(String(match.status||'').toUpperCase())); const stored = parse(ACTIVE_MATCH_KEY, ''); if (stored && usable.some(match => match.id === stored)) return stored; return usable[0]?.id || matches[0]?.id || ''; }
export function getActiveMatch() { const id = getActiveMatchId(); return id ? getMatch(id) : null; }
export function setOnAirMatchId(id) { if (!getMatch(id)) return ''; write(ON_AIR_MATCH_KEY, id); return id; }
export function getOnAirMatchId() {
  const matches = getMatches();
  const stored = parse(ON_AIR_MATCH_KEY, '');
  if (stored && matches.some(match => match.id === stored && !match.archivedAt && !['FINAL','ARCHIVED'].includes(String(match.status||'').toUpperCase()))) return stored;
  const fallback = getActiveMatchId();
  if (fallback) write(ON_AIR_MATCH_KEY, fallback);
  return fallback;
}
export function isMatchOnAir(id) { return Boolean(id) && getOnAirMatchId() === id; }
export function coverageKey(matchId) { return COVERAGE_PREFIX + matchId; }
export function readCoverage(matchId, fallback) { return parse(coverageKey(matchId), fallback); }
export function saveCoverage(matchId, state) { return write(coverageKey(matchId), state); }

const EDITORIAL_KEY = 'rodrigol-editorial-v1';
export function getEditorialState() { const state = parse(EDITORIAL_KEY, { items: {}, agendas: [], scheduled: [], published: [] }); return { ...state, items: state.items || {}, agendas: Array.isArray(state.agendas) ? state.agendas : [], scheduled: Array.isArray(state.scheduled) ? state.scheduled : [], published: Array.isArray(state.published) ? state.published : [] }; }
export function saveEditorialState(state) { return write(EDITORIAL_KEY, state); }

const NEWS_KEY = 'rodrigol-news-v1';
export function getNewsState() {
  const state = parse(NEWS_KEY, { articles: [] });
  return { ...state, articles: Array.isArray(state.articles) ? state.articles : [] };
}
export function saveNewsState(state) { return write(NEWS_KEY, state); }


export function getHistoryState() {
  const state = parse(HISTORY_KEY, { entries: [] });
  return { ...state, entries: Array.isArray(state.entries) ? state.entries : [] };
}
function stripEmbeddedImages(value){if(Array.isArray(value))return value.map(stripEmbeddedImages);if(!value||typeof value!=='object')return value;const result={};for(const [key,item] of Object.entries(value)){if(['crestDataUrl','logoDataUrl','imageDataUrl','photoDataUrl'].includes(key)){if(typeof item==='string'&&item.startsWith('data:'))continue;}result[key]=stripEmbeddedImages(item);}return result;}
function compactHistoryState(state){const clean=stripEmbeddedImages(state);if(Array.isArray(clean?.entries))clean.entries=clean.entries.slice(0,500);return clean;}
export function saveHistoryState(state) { return write(HISTORY_KEY, compactHistoryState(state)); }
export function updateHistoryEntry(matchId, patch) {
  const history = getHistoryState();
  const index = history.entries.findIndex(item => item.matchId === matchId);
  if (index < 0) return null;
  history.entries[index] = { ...history.entries[index], ...patch, updatedAt: new Date().toISOString() };
  saveHistoryState(history);
  return history.entries[index];
}
export function archiveCoverage(entry) {
  const history = getHistoryState();
  const normalized = {
    ...entry,
    id: entry.id || `history-${entry.matchId}-${Date.now()}`,
    archivedAt: entry.archivedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archiveStatus: entry.archiveStatus || (entry.coverage?.phase === 'FINAL' ? 'FINAL' : 'ACTIVE'),
    favorite: Boolean(entry.favorite),
    notes: entry.notes || '',
    tags: Array.isArray(entry.tags) ? entry.tags : []
  };
  const previousIndex = history.entries.findIndex(item => item.matchId === normalized.matchId);
  if (previousIndex >= 0) history.entries[previousIndex] = { ...history.entries[previousIndex], ...normalized };
  else history.entries.unshift(normalized);
  history.entries = history.entries.slice(0, 500);
  const compact=compactHistoryState(history);
  write(HISTORY_KEY,compact,false);
  queueRemoteRecordPatch('history',normalized.matchId,normalized);
  return normalized;
}
export function getHistoryEntry(matchId) { return getHistoryState().entries.find(item => item.matchId === matchId) || null; }
export function deleteHistoryEntry(matchId) { const history = getHistoryState(); history.entries = history.entries.filter(item => item.matchId !== matchId); return saveHistoryState(history); }


const OVERLAY_CONTROL_KEY = 'rodrigol-overlay-control-v1';

function normalizeOverlayCollection(collection = {}, matches = getMatches()) {
  const validIds = new Set(matches.map(match => match.id));
  const matchIds = Array.from(new Set(Array.isArray(collection.matchIds) ? collection.matchIds : []))
    .filter(id => validIds.has(id))
    .slice(0, 6);
  return {
    id: collection.id || uid('scoreboard'),
    name: String(collection.name || 'Novo scoreboard').trim() || 'Novo scoreboard',
    sport: String(collection.sport || 'Futebol').trim() || 'Futebol',
    matchIds,
    createdAt: collection.createdAt || new Date().toISOString(),
    updatedAt: collection.updatedAt || new Date().toISOString()
  };
}

export function getOverlayControlState() {
  const matches = getMatches();
  const fallbackIds = matches.slice(0, 6).map(match => match.id);
  const fallbackCollection = normalizeOverlayCollection({
    id: 'scoreboard-principal',
    name: 'Scoreboard principal',
    sport: 'Futebol',
    matchIds: fallbackIds
  }, matches);
  const raw = parse(OVERLAY_CONTROL_KEY, {
    collections: [fallbackCollection],
    activeCollectionId: fallbackCollection.id,
    activeMainMatchId: fallbackIds[0] || '',
    yellowTickerMode: 'MARQUEE',
    yellowTickerSpeed: 60,
    yellowTickerScope: 'DAY',
    yellowTickerCompetitionId: '',
    yellowTickerRoundId: '',
    yellowTickerIncludeScheduled: true,
    yellowTickerIncludeLive: true,
    yellowTickerIncludeFinal: true,
    mainHighlightMode: 'AUTO',
    mainHighlightInterval: 8,
    mainHighlightItems: [],
    maxItems: 6
  });
  let collections = (Array.isArray(raw.collections) ? raw.collections : [])
    .map(collection => normalizeOverlayCollection(collection, matches));
  if (!collections.length) collections = [fallbackCollection];
  const activeCollectionId = collections.some(item => item.id === raw.activeCollectionId)
    ? raw.activeCollectionId
    : collections[0].id;
  const validMatchIds = new Set(matches.map(match => match.id));
  const activeMainMatchId = validMatchIds.has(raw.activeMainMatchId)
    ? raw.activeMainMatchId
    : (collections.find(item => item.id === activeCollectionId)?.matchIds[0] || matches[0]?.id || '');
  const yellowTickerMode = raw.yellowTickerMode === 'POP' ? 'POP' : 'MARQUEE';
  const yellowTickerSpeed = Math.min(120, Math.max(15, Number(raw.yellowTickerSpeed) || 60));
  const yellowTickerScope = ['DAY','ROUND','BOTH','SELECTED'].includes(raw.yellowTickerScope) ? raw.yellowTickerScope : 'DAY';
  const yellowTickerCompetitionId = String(raw.yellowTickerCompetitionId || '');
  const yellowTickerRoundId = String(raw.yellowTickerRoundId || '');
  const yellowTickerIncludeScheduled = raw.yellowTickerIncludeScheduled !== false;
  const yellowTickerIncludeLive = raw.yellowTickerIncludeLive !== false;
  const yellowTickerIncludeFinal = raw.yellowTickerIncludeFinal !== false;
  const mainHighlightMode = raw.mainHighlightMode === 'MANUAL' ? 'MANUAL' : 'AUTO';
  const mainHighlightInterval = Math.min(30, Math.max(4, Number(raw.mainHighlightInterval) || 8));
  const mainHighlightItems = (Array.isArray(raw.mainHighlightItems) ? raw.mainHighlightItems : []).slice(0, 12).map(item => ({
    id: String(item?.id || uid('highlight')),
    side: ['HOME','AWAY','NEUTRAL'].includes(item?.side) ? item.side : 'NEUTRAL',
    title: String(item?.title || '').slice(0, 50),
    text: String(item?.text || '').slice(0, 100),
    active: item?.active !== false
  }));
  return { collections, activeCollectionId, activeMainMatchId, yellowTickerMode, yellowTickerSpeed, yellowTickerScope, yellowTickerCompetitionId, yellowTickerRoundId, yellowTickerIncludeScheduled, yellowTickerIncludeLive, yellowTickerIncludeFinal, mainHighlightMode, mainHighlightInterval, mainHighlightItems, maxItems: 6 };
}

export function saveOverlayControlState(state) {
  const matches = getMatches();
  let collections = (Array.isArray(state?.collections) ? state.collections : [])
    .map(collection => normalizeOverlayCollection(collection, matches));
  if (!collections.length) {
    collections = [normalizeOverlayCollection({
      name: 'Scoreboard principal',
      matchIds: matches.slice(0, 6).map(match => match.id)
    }, matches)];
  }
  const activeCollectionId = collections.some(item => item.id === state?.activeCollectionId)
    ? state.activeCollectionId
    : collections[0].id;
  const validMatchIds = new Set(matches.map(match => match.id));
  const activeMainMatchId = validMatchIds.has(state?.activeMainMatchId)
    ? state.activeMainMatchId
    : (collections.find(item => item.id === activeCollectionId)?.matchIds[0] || matches[0]?.id || '');
  const yellowTickerMode = state?.yellowTickerMode === 'POP' ? 'POP' : 'MARQUEE';
  const yellowTickerSpeed = Math.min(120, Math.max(15, Number(state?.yellowTickerSpeed) || 60));
  const yellowTickerScope = ['DAY','ROUND','BOTH','SELECTED'].includes(state?.yellowTickerScope) ? state.yellowTickerScope : 'DAY';
  const yellowTickerCompetitionId = String(state?.yellowTickerCompetitionId || '');
  const yellowTickerRoundId = String(state?.yellowTickerRoundId || '');
  const yellowTickerIncludeScheduled = state?.yellowTickerIncludeScheduled !== false;
  const yellowTickerIncludeLive = state?.yellowTickerIncludeLive !== false;
  const yellowTickerIncludeFinal = state?.yellowTickerIncludeFinal !== false;
  const mainHighlightMode = state?.mainHighlightMode === 'MANUAL' ? 'MANUAL' : 'AUTO';
  const mainHighlightInterval = Math.min(30, Math.max(4, Number(state?.mainHighlightInterval) || 8));
  const mainHighlightItems = (Array.isArray(state?.mainHighlightItems) ? state.mainHighlightItems : []).slice(0, 12).map(item => ({
    id: String(item?.id || uid('highlight')),
    side: ['HOME','AWAY','NEUTRAL'].includes(item?.side) ? item.side : 'NEUTRAL',
    title: String(item?.title || '').slice(0, 50),
    text: String(item?.text || '').slice(0, 100),
    active: item?.active !== false
  }));
  return write(OVERLAY_CONTROL_KEY, { collections, activeCollectionId, activeMainMatchId, yellowTickerMode, yellowTickerSpeed, yellowTickerScope, yellowTickerCompetitionId, yellowTickerRoundId, yellowTickerIncludeScheduled, yellowTickerIncludeLive, yellowTickerIncludeFinal, mainHighlightMode, mainHighlightInterval, mainHighlightItems, maxItems: 6 });
}

export function getActiveOverlayCollection() {
  const state = getOverlayControlState();
  return state.collections.find(item => item.id === state.activeCollectionId) || state.collections[0] || null;
}

export function getActiveScoreboardMatchIds() {
  return getActiveOverlayCollection()?.matchIds || [];
}


const STANDINGS_KEY = 'rodrigol-standings-v1';
function normalizeStandingRow(row={},index=0){
  const goalsFor=Number(row.goalsFor ?? row.gf ?? row.goalsScored)||0;
  const goalsAgainst=Number(row.goalsAgainst ?? row.ga ?? row.goalsConceded)||0;
  const points=Number(row.points ?? row.pts)||0;
  return {position:Number(row.position ?? row.pos)||index+1,clubId:String(row.clubId||row.teamId||row.id||''),clubName:String(row.clubName||row.teamName||row.name||row.club||''),points,basePoints:Number(row.basePoints ?? points)||0,adjustmentPoints:Number(row.adjustmentPoints ?? row.adjustment)||0,played:Number(row.played ?? row.games ?? row.matches)||0,wins:Number(row.wins ?? row.w)||0,draws:Number(row.draws ?? row.d)||0,losses:Number(row.losses ?? row.l)||0,goalsFor,goalsAgainst,goalDifference:Number(row.goalDifference ?? row.gd ?? (goalsFor-goalsAgainst))||0};
}
function legacyStandingTables(raw={}){
  const result={};
  const candidates=[raw?.tables,raw?.standings,raw?.competitions,raw?.classifications];
  for(const source of candidates){if(!source||typeof source!=='object'||Array.isArray(source))continue;for(const [id,value] of Object.entries(source)){const rows=Array.isArray(value)?value:Array.isArray(value?.rows)?value.rows:Array.isArray(value?.items)?value.items:null;if(rows&&!result[id])result[id]=rows;}}
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [id,value] of Object.entries(raw)){if(['tables','standings','competitions','classifications','tableMeta','publishedTableIds','publishedCompetitionIds'].includes(id))continue;if(Array.isArray(value)&&!result[id])result[id]=value;}
  return result;
}
export function getStandingsState(){
  const raw=parse(STANDINGS_KEY,{tables:{},tableMeta:{},publishedTableIds:[],publishedCompetitionIds:[]})||{};
  const legacy=legacyStandingTables(raw);
  const sourceTables=raw&&typeof raw.tables==='object'&&!Array.isArray(raw.tables)?raw.tables:{};
  const tables={};
  for(const [id,rows] of Object.entries({...legacy,...sourceTables}))tables[id]=(Array.isArray(rows)?rows:[]).map(normalizeStandingRow).sort((a,b)=>a.position-b.position);
  const tableMeta=raw&&typeof raw.tableMeta==='object'&&!Array.isArray(raw.tableMeta)?{...raw.tableMeta}:{};
  let publishedTableIds=Array.isArray(raw?.publishedTableIds)?raw.publishedTableIds.map(String):[];
  if(!publishedTableIds.length&&Array.isArray(raw?.publishedCompetitionIds))publishedTableIds=raw.publishedCompetitionIds.map(String);
  for(const competition of getCompetitions()){
    const targets=getStandingTargets(competition);
    if(!targets.length)continue;
    const first=targets[0];
    const legacyIds=[competition.id,competition.name,competition.shortName,competition.abbreviation].filter(Boolean).map(String);
    const legacyId=legacyIds.find(id=>Array.isArray(tables[id])&&tables[id].length);
    if(legacyId&&!tables[first.id])tables[first.id]=tables[legacyId].map(row=>({...row}));
    for(const target of targets){if(!tableMeta[target.id])tableMeta[target.id]={id:target.id,competitionId:competition.id,competitionName:competition.name,competitionShortName:competition.shortName||competition.name,season:competition.season||'',stageId:target.stageId||'',groupId:target.groupId||'',name:target.name,label:target.label,calculationMode:'MANUAL',overlayMode:'OFFICIAL'};}
    if(legacyIds.some(id=>publishedTableIds.includes(id))){publishedTableIds=publishedTableIds.filter(id=>!legacyIds.includes(id));publishedTableIds.push(first.id);}
  }
  publishedTableIds=Array.from(new Set(publishedTableIds));
  return {tables,tableMeta,publishedTableIds,publishedCompetitionIds:Array.from(new Set(publishedTableIds.map(id=>String(tableMeta[id]?.competitionId||String(id).split('__')[0]))))};
}
export function saveStandingsState(state){
  const publishedTableIds=Array.isArray(state?.publishedTableIds)?Array.from(new Set(state.publishedTableIds)):Array.isArray(state?.publishedCompetitionIds)?Array.from(new Set(state.publishedCompetitionIds)):[];
  return write(STANDINGS_KEY,{tables:state&&typeof state.tables==='object'&&!Array.isArray(state.tables)?state.tables:{},tableMeta:state&&typeof state.tableMeta==='object'&&!Array.isArray(state.tableMeta)?state.tableMeta:{},publishedTableIds,publishedCompetitionIds:Array.from(new Set(publishedTableIds.map(id=>String(state?.tableMeta?.[id]?.competitionId||String(id).split('__')[0]))))});
}
export function getCompetitionStanding(tableId){return getStandingsState().tables[tableId]||[];}
export function saveCompetitionStanding(tableId,rows=[],meta={}){
  const state=getStandingsState();
  state.tables[tableId]=(Array.isArray(rows)?rows:[]).map(normalizeStandingRow).sort((a,b)=>a.position-b.position);
  state.tableMeta[tableId]={...(state.tableMeta[tableId]||{}),...meta,id:tableId};
  return saveStandingsState(state);
}
export function setPublishedStandings(ids=[]){const state=getStandingsState();state.publishedTableIds=Array.from(new Set(ids));return saveStandingsState(state);}

const SIDEBAR_SEQUENCE_KEY='rodrigol-sidebar-sequence-v1';
export function getSidebarSequenceState(){const state=parse(SIDEBAR_SEQUENCE_KEY,{items:[],intervalSeconds:12});return {items:Array.isArray(state?.items)?state.items:[],intervalSeconds:Math.max(5,Number(state?.intervalSeconds)||12)};}
export function saveSidebarSequenceState(state){return write(SIDEBAR_SEQUENCE_KEY,{items:(Array.isArray(state?.items)?state.items:[]).map(item=>({id:String(item.id||uid('side')),type:['standings','knockout'].includes(item.type)?item.type:'matches',competitionId:String(item.competitionId||''),phaseId:String(item.phaseId||''),roundId:String(item.roundId||''),active:item.active!==false})),intervalSeconds:Math.max(5,Number(state?.intervalSeconds)||12)});}
const SIDEBAR_LOWER_KEY='rodrigol-sidebar-lower-v1';
export function getSidebarLowerState(){const state=parse(SIDEBAR_LOWER_KEY,{items:[],intervalSeconds:10});return {items:Array.isArray(state?.items)?state.items:[],intervalSeconds:Math.max(5,Number(state?.intervalSeconds)||10)};}
export function saveSidebarLowerState(state){return write(SIDEBAR_LOWER_KEY,{items:(Array.isArray(state?.items)?state.items:[]).map(item=>({id:String(item.id||uid('side-lower')),type:item.type==='lineup'?'lineup':'match',matchId:String(item.matchId||''),side:item.type==='lineup'&&(item.side==='away')?'away':'home',active:item.active!==false})).filter(item=>item.matchId),intervalSeconds:Math.max(5,Number(state?.intervalSeconds)||10)});}

const TICKER_KEY = 'rodrigol-ticker-v1';
export function getTickerState() {
  const state = parse(TICKER_KEY, { items: [], enabled: true, intervalSeconds: 10, label: 'DESTAQUE', autoPublish: false, endBehavior: 'CONTINUE', displayMode: 'ROTATE' });
  return {
    enabled: state.enabled !== false,
    intervalSeconds: Math.max(4, Number(state.intervalSeconds) || 10),
    label: state.label || 'DESTAQUE',
    autoPublish: state.autoPublish === true,
    endBehavior: state.endBehavior === 'HIDE_AFTER_CYCLE' ? 'HIDE_AFTER_CYCLE' : 'CONTINUE',
    displayMode: state.displayMode === 'FIXED' ? 'FIXED' : 'ROTATE',
    items: (Array.isArray(state.items) ? state.items : [])
      .filter(item => !item?.sourceEventId)
      .map(item => ({
        ...item,
        status: item.status || (item.active === false ? 'PAUSED' : 'PUBLISHED'),
        scheduledAt: item.scheduledAt || '',
        expiresAt: item.expiresAt || '',
        newsId: item.newsId || ''
      }))
  };
}
export function saveTickerState(state) { return write(TICKER_KEY, getNormalizedTickerState(state)); }
function getNormalizedTickerState(state = {}) {
  return {
    enabled: state.enabled !== false,
    intervalSeconds: Math.max(4, Number(state.intervalSeconds) || 10),
    label: String(state.label || 'DESTAQUE').trim() || 'DESTAQUE',
    autoPublish: state.autoPublish === true,
    endBehavior: state.endBehavior === 'HIDE_AFTER_CYCLE' ? 'HIDE_AFTER_CYCLE' : 'CONTINUE',
    displayMode: state.displayMode === 'FIXED' ? 'FIXED' : 'ROTATE',
    items: (Array.isArray(state.items) ? state.items : [])
      .filter(item => !item?.sourceEventId)
      .slice(0, 100)
      .map(item => ({
        ...item,
        status: item.status || (item.active === false ? 'PAUSED' : 'PUBLISHED'),
        scheduledAt: item.scheduledAt || '',
        expiresAt: item.expiresAt || '',
        newsId: item.newsId || ''
      }))
  };
}
export function enqueueTickerItem(item) {
  const state = getTickerState();
  const normalized = {
    id: item.id || uid('ticker'),
    createdAt: item.createdAt || new Date().toISOString(),
    active: item.active !== false,
    priority: item.priority || 'NORMAL',
    competition: item.competition || '',
    match: item.match || '',
    eventType: item.eventType || 'INFORMAÇÃO',
    minute: item.minute ?? '',
    person: item.person || '',
    text: item.text || '',
    status: item.status || 'PUBLISHED',
    scheduledAt: item.scheduledAt || '',
    expiresAt: item.expiresAt || '',
    newsId: item.newsId || ''
  };
  const index = state.items.findIndex(entry => entry.sourceEventId && entry.sourceEventId === item.sourceEventId);
  if (index >= 0) state.items[index] = { ...state.items[index], ...normalized, sourceEventId: item.sourceEventId };
  else state.items.unshift({ ...normalized, sourceEventId: item.sourceEventId || '' });
  saveTickerState(state);
  return normalized;
}
export function removeTickerItem(id) { const state = getTickerState(); state.items = state.items.filter(item => item.id !== id); return saveTickerState(state); }

const KNOCKOUT_KEY='rodrigol-knockout-v1';
function normalizeKnockoutPhase(phase={},index=0){return {id:String(phase.id||uid('phase')),name:String(phase.name||`Fase ${index+1}`).trim()||`Fase ${index+1}`,order:Number(phase.order)||index+1,legMode:['SINGLE','TWO_LEGS'].includes(phase.legMode)?phase.legMode:'SINGLE',ties:Array.isArray(phase.ties)?phase.ties.map((tie,tieIndex)=>normalizeKnockoutTie(tie,tieIndex)):[]};}
function normalizeKnockoutTie(tie={},index=0){const firstHome=Number(tie.firstLegHomeScore ?? tie.homeScore)||0,firstAway=Number(tie.firstLegAwayScore ?? tie.awayScore)||0,secondHome=Number(tie.secondLegHomeScore)||0,secondAway=Number(tie.secondLegAwayScore)||0;return {id:String(tie.id||uid('tie')),order:Number(tie.order)||index+1,homeClubId:String(tie.homeClubId||''),awayClubId:String(tie.awayClubId||''),homeClubName:String(tie.homeClubName||''),awayClubName:String(tie.awayClubName||''),homeSourceTieId:String(tie.homeSourceTieId||''),awaySourceTieId:String(tie.awaySourceTieId||''),firstLegMatchId:String(tie.firstLegMatchId||''),secondLegMatchId:String(tie.secondLegMatchId||''),singleMatchId:String(tie.singleMatchId||''),homeScore:Number(tie.homeScore)||0,awayScore:Number(tie.awayScore)||0,firstLegHomeScore:firstHome,firstLegAwayScore:firstAway,secondLegHomeScore:secondHome,secondLegAwayScore:secondAway,aggregateHome:firstHome+secondAway,aggregateAway:firstAway+secondHome,penaltiesHome:Number(tie.penaltiesHome)||0,penaltiesAway:Number(tie.penaltiesAway)||0,winnerClubId:String(tie.winnerClubId||''),winnerClubName:String(tie.winnerClubName||''),status:['SCHEDULED','LIVE','FINISHED','CONFIRMED'].includes(tie.status)?tie.status:'SCHEDULED',notes:String(tie.notes||'')};}
export function getKnockoutState(){const raw=parse(KNOCKOUT_KEY,{competitions:{}});const competitions=raw&&typeof raw.competitions==='object'&&!Array.isArray(raw.competitions)?raw.competitions:{};const normalized={};for(const [competitionId,item] of Object.entries(competitions)){normalized[competitionId]={competitionId,season:String(item?.season||''),phases:(Array.isArray(item?.phases)?item.phases:[]).map(normalizeKnockoutPhase).sort((a,b)=>a.order-b.order),updatedAt:item?.updatedAt||''};}return {competitions:normalized};}
export function saveKnockoutState(state){return write(KNOCKOUT_KEY,state);}
export function getCompetitionKnockout(competitionId){return getKnockoutState().competitions[competitionId]||{competitionId,season:'',phases:[],updatedAt:''};}
export function saveCompetitionKnockout(competitionId,data={}){const state=getKnockoutState();state.competitions[competitionId]={competitionId,season:String(data.season||''),phases:(Array.isArray(data.phases)?data.phases:[]).map(normalizeKnockoutPhase).sort((a,b)=>a.order-b.order),updatedAt:new Date().toISOString()};return saveKnockoutState(state);}
export function deleteCompetitionKnockout(competitionId){const state=getKnockoutState();delete state.competitions[competitionId];return saveKnockoutState(state);}

const ROUNDS_KEY='rodrigol-rounds-v1';
function normalizeRound(item={},index=0){return {id:String(item.id||uid('round')),competitionId:String(item.competitionId||''),season:String(item.season||''),stageId:String(item.stageId||''),groupId:String(item.groupId||''),name:String(item.name||`Rodada ${index+1}`),order:Number(item.order)||index+1,startDate:String(item.startDate||''),endDate:String(item.endDate||''),notes:String(item.notes||'')};}
export function getRoundsState(){const state=parse(ROUNDS_KEY,{items:[]});return {items:(Array.isArray(state?.items)?state.items:[]).map(normalizeRound).sort((a,b)=>a.competitionId.localeCompare(b.competitionId)||a.stageId.localeCompare(b.stageId)||a.groupId.localeCompare(b.groupId)||a.order-b.order)};}
export function saveRoundsState(state){return write(ROUNDS_KEY,{items:(Array.isArray(state?.items)?state.items:[]).map(normalizeRound)});}
export function getRounds(filters={}){return getRoundsState().items.filter(r=>(!filters.competitionId||r.competitionId===filters.competitionId)&&(!filters.season||r.season===filters.season)&&(!filters.stageId||r.stageId===filters.stageId)&&(!filters.groupId||r.groupId===filters.groupId));}
export function upsertRound(item){const state=getRoundsState(),record=normalizeRound(item,state.items.length),i=state.items.findIndex(x=>x.id===record.id);if(i>=0)state.items[i]=record;else state.items.push(record);saveRoundsState(state);return record;}
export function deleteRound(id){const state=getRoundsState();state.items=state.items.filter(x=>x.id!==id);saveRoundsState(state);saveMatches(getMatches().map(m=>m.roundId===id?{...m,roundId:'',round:m.round||''}:m));}
export function createRoundsBatch({competitionId,season,stageId,groupId,count,prefix='Rodada',start=1}){const state=getRoundsState(),existing=state.items.filter(r=>r.competitionId===competitionId&&r.season===season&&r.stageId===stageId&&r.groupId===groupId);for(let n=0;n<Math.max(1,Number(count)||1);n++){const number=(Number(start)||1)+n;state.items.push(normalizeRound({competitionId,season,stageId,groupId,name:`${prefix} ${number}`,order:existing.length+n+1},state.items.length));}saveRoundsState(state);return state.items;}
export function getRound(id){return getRoundsState().items.find(x=>x.id===id)||null;}


const AGENDA_KEY='rodrigol-agenda-v1';
function normalizeJourney(item={},index=0){return {id:String(item.id||uid('journey')),name:String(item.name||`Jornada ${index+1}`).trim()||`Jornada ${index+1}`,date:String(item.date||''),competitionIds:Array.from(new Set(Array.isArray(item.competitionIds)?item.competitionIds.map(String):[])),roundIds:Array.from(new Set(Array.isArray(item.roundIds)?item.roundIds.map(String):[])),matchIds:Array.from(new Set(Array.isArray(item.matchIds)?item.matchIds.map(String):[])),active:item.active===true,notes:String(item.notes||''),createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};}
export function getAgendaState(){const raw=parse(AGENDA_KEY,{preGameLeadMinutes:120,autoPromote:true,journeys:[]});return {preGameLeadMinutes:Math.max(0,Math.min(1440,Number(raw?.preGameLeadMinutes)||120)),autoPromote:raw?.autoPromote!==false,journeys:(Array.isArray(raw?.journeys)?raw.journeys:[]).map(normalizeJourney)};}
export function saveAgendaState(state){return write(AGENDA_KEY,{preGameLeadMinutes:Math.max(0,Math.min(1440,Number(state?.preGameLeadMinutes)||120)),autoPromote:state?.autoPromote!==false,journeys:(Array.isArray(state?.journeys)?state.journeys:[]).map(normalizeJourney)});}
export function upsertJourney(item){const state=getAgendaState(),record=normalizeJourney(item,state.journeys.length),i=state.journeys.findIndex(x=>x.id===record.id);if(record.active)state.journeys=state.journeys.map(x=>({...x,active:false}));if(i>=0)state.journeys[i]=record;else state.journeys.push(record);saveAgendaState(state);return record;}
export function deleteJourney(id){const state=getAgendaState();state.journeys=state.journeys.filter(x=>x.id!==id);return saveAgendaState(state);}
export function getActiveJourney(){return getAgendaState().journeys.find(x=>x.active)||null;}
export function setJourneyActive(id){const state=getAgendaState();state.journeys=state.journeys.map(x=>({...x,active:x.id===id}));saveAgendaState(state);return state.journeys.find(x=>x.active)||null;}
export function matchKickoff(match){if(!match?.date)return null;const time=/^\d{2}:\d{2}$/.test(String(match.time||''))?match.time:'00:00';const value=new Date(`${match.date}T${time}:00`);return Number.isNaN(value.getTime())?null:value;}
export function promoteScheduledMatches(now=new Date(),force=false){const agenda=getAgendaState();if(!agenda.autoPromote&&!force)return [];const changed=[];for(const match of getMatches()){if(match.status!=='SCHEDULED')continue;const kickoff=matchKickoff(match);if(!kickoff)continue;const threshold=new Date(kickoff.getTime()-agenda.preGameLeadMinutes*60000);if(now>=threshold&&now<new Date(kickoff.getTime()+12*3600000)){upsertMatch({...match,status:'PRE_GAME'});const current=readCoverage(match.id,{homeScore:0,awayScore:0,events:[]})||{};saveCoverage(match.id,{...current,phase:'PRE_GAME',elapsedSeconds:0,clockRunning:false,clockStartedAt:null});changed.push(match.id);}}return changed;}
export function enterMatchOperation(matchId){const match=getMatch(matchId);if(!match)return null;const updated={...match,status:'PRE_GAME'};upsertMatch(updated);const current=readCoverage(matchId,{homeScore:0,awayScore:0,events:[]})||{};saveCoverage(matchId,{...current,phase:'PRE_GAME',elapsedSeconds:0,clockRunning:false,clockStartedAt:null});return updated;}
function agendaKey(value=''){return String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function journeyCompetitionMatches(match,competitionIds){if(!competitionIds.size)return false;const competitions=getCompetitions();const aliases=new Set();for(const id of competitionIds){const c=competitions.find(item=>item.id===id);[id,c?.id,c?.name,c?.shortName,c?.abbreviation].filter(Boolean).forEach(value=>aliases.add(agendaKey(value)));}return [match.competitionId,match.competition].filter(Boolean).some(value=>aliases.has(agendaKey(value)));}
function journeyRoundMatches(match,roundIds){if(!roundIds.size)return false;const rounds=getRounds();const aliases=new Set();for(const id of roundIds){const r=rounds.find(item=>item.id===id);[id,r?.id,r?.name].filter(Boolean).forEach(value=>aliases.add(agendaKey(value)));}return [match.roundId,match.round].filter(Boolean).some(value=>aliases.has(agendaKey(value)));}

export function getJourneyMatches(journeyOrId){
  const journey=typeof journeyOrId==='string'?getAgendaState().journeys.find(x=>x.id===journeyOrId):journeyOrId;
  if(!journey)return [];
  const ids=new Set(journey.matchIds||[]),competitions=new Set(journey.competitionIds||[]),rounds=new Set(journey.roundIds||[]);
  return getMatches().filter(m=>ids.has(m.id)||journeyCompetitionMatches(m,competitions)||journeyRoundMatches(m,rounds));
}
export function getJourneyImpact(journeyOrId){
  const journey=typeof journeyOrId==='string'?getAgendaState().journeys.find(x=>x.id===journeyOrId):journeyOrId;
  const matches=getJourneyMatches(journey);
  const buckets={scheduled:0,operational:0,live:0,finished:0,archived:0};
  for(const m of matches){
    const phase=String(readCoverage(m.id,{phase:m.status}).phase||m.status||'SCHEDULED').toUpperCase();
    if(m.archivedAt||phase==='ARCHIVED')buckets.archived++;
    else if(['FINAL','FINISHED','CONFIRMED'].includes(phase))buckets.finished++;
    else if(['FIRST_HALF','HALFTIME','SECOND_HALF','EXTRA_TIME','EXTRA_TIME_FIRST_HALF','EXTRA_TIME_HALFTIME','EXTRA_TIME_SECOND_HALF','PENALTIES','LIVE_UNKNOWN'].includes(phase))buckets.live++;
    else if(phase==='SCHEDULED')buckets.scheduled++;
    else buckets.operational++;
  }
  return {journey:journey||null,matches,buckets,appliedTo:['Central de Produção','Multicabine']};
}

export function getOperationalMatches(){const journey=getActiveJourney(),matches=getMatches();const terminal=new Set(['SCHEDULED','FINAL','FINISHED','CONFIRMED','ARCHIVED']);const active=m=>{if(m.archivedAt)return false;const stored=String(m.status||'SCHEDULED').toUpperCase();if(terminal.has(stored))return false;const phase=String(readCoverage(m.id,{phase:stored}).phase||stored).toUpperCase();return !terminal.has(phase);};const operational=matches.filter(active);if(!journey)return operational;const ids=new Set(journey.matchIds||[]),competitions=new Set(journey.competitionIds||[]),rounds=new Set(journey.roundIds||[]);return matches.filter(m=>ids.has(m.id)||journeyCompetitionMatches(m,competitions)||journeyRoundMatches(m,rounds)).filter(active);}
export function getMatchBuckets(){const buckets={upcoming:[],operational:[],finished:[],archived:[]};for(const match of getMatches()){const phase=String(readCoverage(match.id,{phase:match.status}).phase||match.status||'SCHEDULED').toUpperCase();if(match.archivedAt||phase==='ARCHIVED')buckets.archived.push(match);else if(['FINAL','FINISHED','CONFIRMED'].includes(phase))buckets.finished.push(match);else if(['SCHEDULED'].includes(phase))buckets.upcoming.push(match);else buckets.operational.push(match);}return buckets;}


export async function importCompetitionDataset(dataset={}){
  const incomingClubs=Array.isArray(dataset.clubs)?dataset.clubs:[];
  const incomingMatches=Array.isArray(dataset.matches)?dataset.matches:[];
  const incomingRounds=Array.isArray(dataset.rounds)?dataset.rounds:[];
  const competition=dataset.competition||null;
  if(!competition?.id)throw new Error('Dataset sem competição válida.');
  const key=value=>String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
  const canonicalClubAlias=value=>{const k=key(value);const groups={flamengo:['flamengo','clubederegatasdoflamengo','crflamengo','fla'],palmeiras:['palmeiras','sociedadeesportivapalmeiras','sepalmeiras','pal'],bragantino:['bragantino','redbullbragantino','rbbragantino','rbb'],corinthians:['corinthians','sportclubcorinthianspaulista','sccorinthians','cor'],santos:['santos','santosfc','san'],saopaulo:['saopaulo','saopaulofc','sao'],atleticomg:['atleticomg','clubatleticomineiro','cam'],athleticopr:['athleticopr','atleticopr','clubathleticoparanaense','cap'],atleticogo:['atleticogo','atleticogoianiense','atleticoclubegoianiense','acg'],vasco:['vasco','vascodagama','crvascodagama','vascodagamasaf','vas'],botafogorj:['botafogorj','botafogodefuteboleregatas'],botafogosp:['botafogosp','botafogofutebolclubesp','botafogofutebolclube'],botafogopb:['botafogopb','botafogofutebolclubepb'],fluminense:['fluminense','fluminensefc','flu'],internacional:['internacional','internacionalrs','sportclubinternacional','sci'],interdelimeira:['interdelimeira','associacaoatleticainternacionaldelimeira','internacionaldelimeira'],gremio:['gremio','gremiofbpa','gre'],bahia:['bahia','esporteclubebahia','ecbahia','bah'],cruzeiro:['cruzeiro','cruzeiroec','cru'],coritiba:['coritiba','coritibafc','coritibasaf','cfc'],vitoria:['vitoria','ecvitoria','vit'],chapecoense:['chapecoense','associacaochapecoensedefutebol','cha'],mirassol:['mirassol','mirassolfc','mir'],remo:['remo','clubedoremo','rem'],juventude:['juventude','ecjuventude','esporteclubejuventude'],juventussp:['juventussp','clubatleticojuventus','cajuventus'],santacruz:['santacruz','santacruzfc','santacruzfutebolclube']};for(const [id,aliases] of Object.entries(groups))if(aliases.includes(k))return id;return k;};
  const clubs=getClubs(); const clubIdMap=new Map(); let newClubs=0,reusedClubs=0;
  for(const club of incomingClubs){
    const aliases=[club.id,club.name,club.shortName,club.abbreviation].map(canonicalClubAlias).filter(Boolean);
    let i=clubs.findIndex(x=>[x.id,x.name,x.shortName,x.abbreviation].map(canonicalClubAlias).some(v=>v&&aliases.includes(v)));
    if(i>=0){const existing=clubs[i];clubIdMap.set(club.id,existing.id);const merged={...club,...existing,id:existing.id};for(const [field,value] of Object.entries(club)){const current=existing[field];if((current===undefined||current===null||current==='')&&value!==undefined&&value!==null&&value!=='')merged[field]=value;}merged.crestDataUrl=existing.crestDataUrl||club.crestDataUrl||'';merged.sports=[...new Set([...(existing.sports||[]),...(club.sports||[]),'FOOTBALL'])];clubs[i]=merged;reusedClubs++;}
    else{clubs.push(club);clubIdMap.set(club.id,club.id);newClubs++;}
  }
  saveClubs(clubs);
  const competitions=getCompetitions(); const compAliases=[competition.id,competition.name,competition.shortName,competition.abbreviation].map(key).filter(Boolean);
  let ci=competitions.findIndex(x=>[x.id,x.name,x.shortName,x.abbreviation].map(key).some(v=>v&&compAliases.includes(v)));
  let competitionId=competition.id,newCompetitions=0,reusedCompetitions=0;
  if(ci>=0){const existing=competitions[ci];competitionId=existing.id;const merged={...competition,...existing,id:existing.id};for(const [field,value] of Object.entries(competition)){const current=existing[field];if((current===undefined||current===null||current==='')&&value!==undefined&&value!==null&&value!=='')merged[field]=value;}merged.season=existing.season||competition.season;merged.logoDataUrl=existing.logoDataUrl||competition.logoDataUrl||'';competitions[ci]=merged;reusedCompetitions++;}
  else{competitions.push(competition);newCompetitions++;}
  saveCompetitions(competitions);
  const roundState=getRoundsState(); const roundIdMap=new Map();
  const roundNumber=value=>{const match=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/(?:rodada\s*)?(\d+)/i);return match?Number(match[1]):0;};
  const sameRound=(existing,record)=>{if(existing.competitionId!==competitionId||String(existing.season||'')!==String(record.season||''))return false;const sameStage=String(existing.stageId||'')===String(record.stageId||''),sameGroup=String(existing.groupId||'')===String(record.groupId||'');if(!sameStage||!sameGroup)return false;const a=roundNumber(existing.name)||Number(existing.order)||0,b=roundNumber(record.name)||Number(record.order)||0;return a>0&&b>0?a===b:[existing.id,existing.name].map(key).some(v=>[record.id,record.name].map(key).includes(v));};
  for(const round of incomingRounds){const record=normalizeRound({...round,competitionId},roundState.items.length);let i=roundState.items.findIndex(x=>sameRound(x,record));if(i>=0){roundIdMap.set(round.id,roundState.items[i].id);const preservedId=roundState.items[i].id;roundState.items[i]={...roundState.items[i],...record,id:preservedId,competitionId};}else{roundState.items.push(record);roundIdMap.set(round.id,record.id);}}
  saveRoundsState(roundState);
  const matches=getMatches();let created=0,updated=0,protectedLive=0;
  for(const raw of incomingMatches){const incoming={...raw,competitionId,homeClubId:clubIdMap.get(raw.homeClubId)||raw.homeClubId,awayClubId:clubIdMap.get(raw.awayClubId)||raw.awayClubId,roundId:roundIdMap.get(raw.roundId)||raw.roundId};const identity=key(`${competitionId}|${incoming.season}|${incoming.round}|${incoming.homeClubId}|${incoming.awayClubId}`);let i=matches.findIndex(x=>x.id===incoming.id||key(`${x.competitionId}|${x.season}|${x.round}|${x.homeClubId}|${x.awayClubId}`)===identity);if(i<0){matches.push(incoming);created++;i=matches.length-1;}else{const existing=matches[i],phase=String(readCoverage(existing.id,{phase:existing.status||'SCHEDULED'}).phase||existing.status||'SCHEDULED').toUpperCase();const live=!['SCHEDULED','PRE_GAME','FINAL','FINISHED','CONFIRMED','ARCHIVED'].includes(phase);const protectedFields=live?{status:existing.status,date:existing.date,time:existing.time}:{};matches[i]={...existing,...incoming,id:existing.id,...protectedFields};updated++;if(live)protectedLive++;}
    const saved=matches[i],savedPhase=String(saved.status||'SCHEDULED').toUpperCase();if(['FINAL','FINISHED'].includes(savedPhase)&&Number.isFinite(Number(saved.homeScore))&&Number.isFinite(Number(saved.awayScore))){const current=readCoverage(saved.id,{events:[],homeScorers:[],awayScorers:[]})||{};saveCoverage(saved.id,{...current,phase:'FINAL',homeScore:Number(saved.homeScore),awayScore:Number(saved.awayScore),clockRunning:false,clockStartedAt:null});}
  }
  saveMatches(matches);
  return {competitionId,clubs:incomingClubs.length,rounds:incomingRounds.length,matches:incomingMatches.length,created,updated,protectedLive,newClubs,reusedClubs,newCompetitions,reusedCompetitions};
}
export async function flushDataSync(){await Promise.allSettled([...pendingWideWrites.values(),...remoteWriteChains.values()]);return {pendingLocal:pendingWideWrites.size,pendingRemote:remoteWriteChains.size,retries:remoteRetryQueue.size};}

