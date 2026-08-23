import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import os from "node:os";
import { createServer } from "node:http";
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const bridgeRoot=fileURLToPath(new URL("./public/",import.meta.url));
const bridgePackage=JSON.parse(await readFile(fileURLToPath(new URL("./package.json",import.meta.url)),"utf8"));
const bridgeVersion=bridgePackage.version||"dev";
const studioRoot=fileURLToPath(new URL("../overlay-studio/public/",import.meta.url));
const portalRoot=fileURLToPath(new URL("./public/portal/",import.meta.url));
const legacyRoot=fileURLToPath(new URL("../overlay/dist/",import.meta.url));
const defaultDataRoot=fileURLToPath(new URL("./data/",import.meta.url));
const dataRoot=process.env.RODRIGOL_DATA_DIR?resolve(process.env.RODRIGOL_DATA_DIR):defaultDataRoot;
const dataFile=join(dataRoot,"rodrigol-store.json");
const backupRoot=join(dataRoot,"backups");
const overlayRoot=process.env.RODRIGOL_OVERLAY_ROOT==="legacy"?legacyRoot:studioRoot;
const port=Number(process.env.PORT??4173);
const host=process.env.HOST??(process.env.RAILWAY_ENVIRONMENT?"0.0.0.0":"127.0.0.1");
const environment=process.env.RODRIGOL_ENV??(host==="127.0.0.1"?"local":"production");
const apiToken=process.env.RODRIGOL_API_TOKEN??"";
const allowedOrigin=process.env.RODRIGOL_ALLOWED_ORIGIN??"*";
const adminPassword=String(process.env.RODRIGOL_ADMIN_PASSWORD??"");
const sessionTtlHours=Math.max(1,Number(process.env.RODRIGOL_SESSION_TTL_HOURS)||12);
const secureCookies=String(process.env.RODRIGOL_SECURE_COOKIES??(environment==="production"?"true":"false")).toLowerCase()==="true";
const allowInsecureRemote=String(process.env.RODRIGOL_ALLOW_INSECURE_REMOTE??"false").toLowerCase()==="true";
const sessionSecret=createHash("sha256").update(`rodrigol-session:${adminPassword||apiToken||"local"}`).digest();
const remoteHost=!["127.0.0.1","localhost","::1"].includes(host);
if(remoteHost&&!adminPassword&&!allowInsecureRemote){
  throw new Error("Acesso remoto bloqueado: defina RODRIGOL_ADMIN_PASSWORD antes de usar HOST diferente de 127.0.0.1.");
}
const clients=new Set();
let sequence=0;
let lastCommand=null;
const startedAt=Date.now();
let commandCount=0;
let lastPublicationAt=null;
let reconnects=0;
const remoteStorage=new Map();
const persistentData=new Map();
let dataRevision=0;
let dataWriteQueue=Promise.resolve();
let dataPersistTimer=null;
let pendingPersistWaiters=[];
const DATA_PERSIST_DEBOUNCE_MS=120;
let lastDataSavedAt=null;
let lastBackupAt=null;
let backupTimer=null;
const AUTO_BACKUP_DELAY_MS=10000;
const MAX_AUTOMATIC_BACKUPS=20;
const regionState=new Map();
const publicEventClients=new Set();
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml; charset=utf-8"};



const PUBLIC_KEYS={
  clubs:"rodrigol-clubs-v1",
  matches:"rodrigol-matches-v1",
  competitions:"rodrigol-competitions-v1",
  standings:"rodrigol-standings-v1",
  news:"rodrigol-news-v1",
  highlights:"rodrigol-portal-highlights-v1"
};
function publicRecord(key,fallback){
  const value=persistentData.get(key);
  return value===undefined||value===null?fallback:value;
}
function publicArray(key){const value=publicRecord(key,[]);return Array.isArray(value)?value:[];}
function publicCoverage(matchId){return publicRecord(`rodrigol-coverage-v1:${matchId}`,{})||{};}
function publicClubAsset(id){return publicRecord(`rodrigol-asset-club-crest:${id}`,"")||"";}
function publicCompetitionAsset(id){return publicRecord(`rodrigol-asset-competition-logo:${id}`,"")||"";}
function publicDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||""))?String(value):new Date().toISOString().slice(0,10);}
function publicPhase(match={},coverage={}){
  const raw=String(coverage.phase||match.status||"SCHEDULED").toUpperCase();
  if(["FINAL","FINISHED","CONFIRMED","ARCHIVED"].includes(raw))return"FINAL";
  if(["HALFTIME"].includes(raw))return"INTERVALO";
  if(["FIRST_HALF"].includes(raw))return"1º TEMPO";
  if(["SECOND_HALF"].includes(raw))return"2º TEMPO";
  if(["EXTRA_TIME"].includes(raw))return"PRORROGAÇÃO";
  if(["PENALTIES"].includes(raw))return"PÊNALTIS";
  if(["LIVE_UNKNOWN","LIVE","IN_PROGRESS","IN_PROGRESS_UNKNOWN"].includes(raw))return"EM ANDAMENTO";
  return"PROGRAMADO";
}
function publicMatch(match={}){
  const coverage=publicCoverage(match.id),clubs=publicArray(PUBLIC_KEYS.clubs);
  const home=clubs.find(c=>String(c.id)===String(match.homeClubId))||{};
  const away=clubs.find(c=>String(c.id)===String(match.awayClubId))||{};
  const phase=publicPhase(match,coverage);
  const live=phase!=="PROGRAMADO"&&phase!=="FINAL";
  const events=(Array.isArray(coverage.events)?coverage.events:[]).slice(0,12).map(event=>({
    id:event.id||"",type:event.type||"",minute:Number(event.minute)||0,
    team:event.team||"",player:event.player||event.author||"",
    substitutionIn:event.substitutionIn||"",substitutionOut:event.substitutionOut||""
  }));
  return {
    id:match.id,date:match.date||"",time:match.time||"",competition:match.competition||"",
    competitionId:match.competitionId||"",round:match.round||"",roundId:match.roundId||"",
    venue:match.venue||match.city||"",phase,status:phase,live,
    home:{id:home.id||match.homeClubId||"",name:home.shortName||home.name||"Mandante",abbreviation:home.abbreviation||"",crest:publicClubAsset(home.id||match.homeClubId)},
    away:{id:away.id||match.awayClubId||"",name:away.shortName||away.name||"Visitante",abbreviation:away.abbreviation||"",crest:publicClubAsset(away.id||match.awayClubId)},
    score:{home:Number(coverage.homeScore??match.homeScore)||0,away:Number(coverage.awayScore??match.awayScore)||0},
    scorers:{home:Array.isArray(coverage.homeScorers)?coverage.homeScorers:[],away:Array.isArray(coverage.awayScorers)?coverage.awayScorers:[]},
    clock:{elapsedSeconds:Number(coverage.elapsedSeconds)||0,running:Boolean(coverage.clockRunning),startedAt:coverage.clockStartedAt??null,visible:coverage.clockVisible!==false,period:coverage.phase||match.status||""},
    facts:{referee:coverage.referee||match.referee||"",attendance:coverage.attendance||match.attendance||"",weather:coverage.weather||match.weather||"",venue:match.venue||match.city||""},
    lineups:{
      home:{coach:coverage.lineups?.home?.coach||"",starters:(coverage.lineups?.home?.starters||[]).slice(0,11),players:(coverage.lineups?.home?.onField||coverage.lineups?.home?.starters||[]).slice(0,11),substitutions:Array.isArray(coverage.lineups?.home?.substitutions)?coverage.lineups.home.substitutions:[]},
      away:{coach:coverage.lineups?.away?.coach||"",starters:(coverage.lineups?.away?.starters||[]).slice(0,11),players:(coverage.lineups?.away?.onField||coverage.lineups?.away?.starters||[]).slice(0,11),substitutions:Array.isArray(coverage.lineups?.away?.substitutions)?coverage.lineups.away.substitutions:[]}
    },
    events
  };
}
function normalizePublicEvent(event={},fallback={}){
  const rawTeam=String(event.team||event.eventTeam||event.side||"").toUpperCase();
  return {id:event.id||"",type:event.type||event.eventType||event.action||"",minute:Number(event.minute)||parseInt(String(event.minute||"").replace(/\D/g,""),10)||0,team:rawTeam==="HOME"?"HOME":rawTeam==="AWAY"?"AWAY":"",player:event.player||event.author||event.title||"",details:event.details||"",substitutionIn:event.substitutionIn||"",substitutionOut:event.substitutionOut||"",createdAt:event.createdAt||"",homeName:event.homeName||fallback.homeName||"",awayName:event.awayName||fallback.awayName||""};
}
function samePublicMatch(item={},match={}){
  const direct=String(item.matchId||item.id||"")&&String(item.matchId||item.id||"")===String(match.id||match.matchId||"");
  if(direct)return true;
  const norm=value=>String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
  const itemHome=norm(item.homeName||item.homeShort),itemAway=norm(item.awayName||item.awayShort),matchHome=norm(match.home?.name||match.homeName||match.homeShort),matchAway=norm(match.away?.name||match.awayName||match.awayShort);
  return Boolean(itemHome&&itemAway&&matchHome&&matchAway&&itemHome===matchHome&&itemAway===matchAway);
}
function mergeUniquePublicEvents(groups=[]){
  const result=[],seen=new Set();
  for(const group of groups){
    if(!Array.isArray(group))continue;
    for(const raw of group){
      const event=normalizePublicEvent(raw);
      const key=[
        String(event.type||'').toUpperCase(),
        Number(event.minute)||0,
        String(event.team||'').toUpperCase(),
        String(event.player||'').trim().toLowerCase(),
        String(event.details||'').trim().toLowerCase().replace(/\s+/g,' '),
        String(event.substitutionIn||'').trim().toLowerCase(),
        String(event.substitutionOut||'').trim().toLowerCase()
      ].join('|');
      if(seen.has(key))continue;
      seen.add(key);result.push(event);
    }
  }
  const semanticMinute=event=>{const type=String(event.type||'').toUpperCase(),minute=Number(event.minute)||0;if(['FINAL','END'].includes(type))return 200;if(type==='PENALTIES')return 130;if(['SECOND_HALF_START','SECOND_HALF','RESTART'].includes(type))return 45.6;if(type==='HALFTIME')return 45.5;return minute;};
  // Ordem canônica: quando há timestamp real, ele vence. Isso impede uma transição (ex.: INTERVALO)
  // de ultrapassar um gol anterior apenas porque uma das fontes chegou depois ao Portal.
  return result.sort((a,b)=>{const at=Date.parse(a.createdAt||''),bt=Date.parse(b.createdAt||'');if(Number.isFinite(at)&&Number.isFinite(bt)&&at!==bt)return bt-at;return semanticMinute(b)-semanticMinute(a);});
}
function richestPlayers(...lists){
  return lists
    .filter(Array.isArray)
    .map(list=>list.filter(Boolean))
    .sort((a,b)=>b.length-a.length)[0]||[];
}
function mergeLineupSources(...sources){
  const valid=sources.filter(Boolean);
  const side=name=>{
    const sideSources=valid.map(src=>src?.[name]).filter(Boolean);
    const starters=richestPlayers(...sideSources.map(x=>x.starters),...sideSources.map(x=>x.players));
    const current=richestPlayers(...sideSources.map(x=>x.onField),...sideSources.map(x=>x.players),starters);
    const substitutions=sideSources.flatMap(x=>Array.isArray(x.substitutions)?x.substitutions:[]).filter(Boolean);
    const uniqueSubs=[],seen=new Set();
    for(const sub of substitutions){
      const incoming=String(sub.in||sub.substitutionIn||'').trim(),outgoing=String(sub.out||sub.substitutionOut||'').trim();
      const key=`${incoming}|${outgoing}`;
      if(!incoming||seen.has(key))continue;
      seen.add(key);uniqueSubs.push({in:incoming,out:outgoing,minute:Number(sub.minute)||0});
    }
    return {coach:sideSources.map(x=>x.coach).find(Boolean)||"",starters:starters.slice(0,11),players:current.slice(0,11),substitutions:uniqueSubs};
  };
  return {home:side('home'),away:side('away')};
}

function publicRegionMatch(id,baseMatch=null){
  const wanted=String(id||"");
  // O round-scoreboard é publicado no caminho rápido de cada lance.
  // public-match-data/round-summary são consolidações mais pesadas e podem chegar depois.
  // Priorizar o estado live evita o Portal mostrar o evento no sumário com placar antigo.
  const collections=[
    regionState.get("round-scoreboard")?.payload,
    regionState.get("public-match-data")?.payload,
    regionState.get("round-summary")?.payload
  ].filter(Array.isArray);

  const candidates=collections.flat();
  const matching=candidates.filter(entry=>
    String(entry?.matchId||entry?.id||"")===wanted ||
    (baseMatch&&samePublicMatch(entry,baseMatch))
  );

  if(!matching.length&&!baseMatch)return null;

  const preferred=matching[0]||{};
  const matchId=String(preferred.matchId||preferred.id||baseMatch?.id||wanted);
  const coverage=publicCoverage(matchId);

  const homeName=matching.map(x=>x?.homeName||x?.homeShort).find(Boolean)||baseMatch?.home?.name||"Mandante";
  const awayName=matching.map(x=>x?.awayName||x?.awayShort).find(Boolean)||baseMatch?.away?.name||"Visitante";

  const liveEvents=Array.isArray(regionState.get("live-events")?.payload)
    ?regionState.get("live-events").payload.filter(event=>{
      const eHome=String(event.homeName||"").trim(),eAway=String(event.awayName||"").trim();
      return eHome&&eAway&&samePublicMatch(
        {homeName:eHome,awayName:eAway},
        {home:{name:homeName},away:{name:awayName}}
      );
    })
    :[];

  const eventGroups=[
    Array.isArray(coverage.events)?coverage.events:[],
    ...matching.map(item=>Array.isArray(item?.chronology)?item.chronology:[]),
    liveEvents
  ];
  const events=mergeUniquePublicEvents(eventGroups);

  const lineups=mergeLineupSources(
    coverage.lineups,
    ...matching.map(item=>item?.lineups),
    baseMatch?.lineups
  );

  const phase=String(
    matching.map(x=>x?.phase||x?.period||x?.status).find(Boolean)||
    baseMatch?.phase||baseMatch?.status||"PROGRAMADO"
  );
  const beforeKickoff=
    matching.some(x=>x?.beforeKickoff===true)||
    ["PROGRAMADO","SCHEDULED","PRE_MATCH"].includes(phase.toUpperCase());
  const isFinal=
    matching.some(x=>x?.isFinal===true)||
    ["FINAL","FINISHED","CONFIRMED"].includes(phase.toUpperCase());

  const firstValue=(getter,fallback="")=>{
    for(const item of matching){
      const value=getter(item);
      if(value!==undefined&&value!==null&&value!=="")return value;
    }
    return fallback;
  };

  return {
    ...(baseMatch||{}),
    id:matchId,
    date:firstValue(x=>x?.date,baseMatch?.date||""),
    time:firstValue(x=>x?.time,baseMatch?.time||""),
    competition:firstValue(x=>x?.competition,baseMatch?.competition||""),
    competitionId:firstValue(x=>x?.competitionId,baseMatch?.competitionId||""),
    round:firstValue(x=>x?.round,baseMatch?.round||""),
    roundId:firstValue(x=>x?.roundId,baseMatch?.roundId||""),
    knockout:firstValue(x=>x?.knockout,baseMatch?.knockout||null),
    venue:firstValue(x=>x?.venue,coverage.venue||baseMatch?.venue||""),
    phase,
    status:beforeKickoff?"PROGRAMADO":(
      isFinal?"FINAL":firstValue(x=>x?.status||x?.period,phase||"EM ANDAMENTO")
    ),
    live:!beforeKickoff&&!isFinal,
    home:{
      ...(baseMatch?.home||{}),
      id:firstValue(x=>x?.homeClubId,baseMatch?.home?.id||""),
      name:homeName,
      abbreviation:firstValue(x=>x?.homeShort,baseMatch?.home?.abbreviation||""),
      crest:firstValue(x=>x?.homeCrest?.image,baseMatch?.home?.crest||"")
    },
    away:{
      ...(baseMatch?.away||{}),
      id:firstValue(x=>x?.awayClubId,baseMatch?.away?.id||""),
      name:awayName,
      abbreviation:firstValue(x=>x?.awayShort,baseMatch?.away?.abbreviation||""),
      crest:firstValue(x=>x?.awayCrest?.image,baseMatch?.away?.crest||"")
    },
    score:{
      home:Number(firstValue(x=>x?.homeScore,coverage.homeScore??baseMatch?.score?.home??0))||0,
      away:Number(firstValue(x=>x?.awayScore,coverage.awayScore??baseMatch?.score?.away??0))||0
    },
    penalties:{
      home:Number(firstValue(x=>x?.penaltiesHome,coverage.penaltiesHome??baseMatch?.penalties?.home??0))||0,
      away:Number(firstValue(x=>x?.penaltiesAway,coverage.penaltiesAway??baseMatch?.penalties?.away??0))||0
    },
    scorers:{
      home:firstValue(x=>Array.isArray(x?.homeGoals)&&x.homeGoals.length?x.homeGoals:null,coverage.homeScorers||baseMatch?.scorers?.home||[]),
      away:firstValue(x=>Array.isArray(x?.awayGoals)&&x.awayGoals.length?x.awayGoals:null,coverage.awayScorers||baseMatch?.scorers?.away||[])
    },
    clock:{
      elapsedSeconds:Number(firstValue(x=>x?.elapsedSeconds,coverage.elapsedSeconds??baseMatch?.clock?.elapsedSeconds??0))||0,
      running:Boolean(firstValue(x=>x?.clockRunning,coverage.clockRunning??baseMatch?.clock?.running??false)),
      startedAt:firstValue(x=>x?.clockStartedAt,coverage.clockStartedAt??baseMatch?.clock?.startedAt??null),
      visible:firstValue(x=>x?.clockVisible,baseMatch?.clock?.visible??true)!==false,
      period:firstValue(x=>x?.period,coverage.phase||baseMatch?.clock?.period||phase)
    },
    facts:{
      referee:coverage.referee||baseMatch?.facts?.referee||"",
      attendance:coverage.attendance||baseMatch?.facts?.attendance||"",
      weather:coverage.weather||baseMatch?.facts?.weather||"",
      venue:firstValue(x=>x?.venue,coverage.venue||baseMatch?.facts?.venue||baseMatch?.venue||"")
    },
    lineups,
    events:events.length?events:(baseMatch?.events||[])
  };
}

function mergePublicMatch(base={},live=null){
  if(!live)return base;
  return {
    ...base,
    ...live,
    home:{...(base.home||{}),...(live.home||{})},
    away:{...(base.away||{}),...(live.away||{})},
    score:{...(base.score||{}),...(live.score||{})},
    penalties:{...(base.penalties||{}),...(live.penalties||{})},
    scorers:{...(base.scorers||{}),...(live.scorers||{})},
    clock:{...(base.clock||{}),...(live.clock||{})},
    facts:{...(base.facts||{}),...(live.facts||{})},
    lineups:{
      home:{...(base.lineups?.home||{}),...(live.lineups?.home||{})},
      away:{...(base.lineups?.away||{}),...(live.lineups?.away||{})}
    },
    events:Array.isArray(live.events)&&live.events.length?live.events:(base.events||[])
  };
}
function publicMatchesForDate(date){
  const target=publicDate(date);
  const stored=publicArray(PUBLIC_KEYS.matches)
    .filter(m=>String(m.date||"")===target)
    .map(match=>{
      const base=publicMatch(match);
      const live=publicRegionMatch(match.id,base);
      return mergePublicMatch(base,live);
    });

  if(stored.length){
    return stored.sort((a,b)=>String(a.time).localeCompare(String(b.time))||String(a.competition).localeCompare(String(b.competition)));
  }

  const summary=regionState.get("round-summary")?.payload;
  if(Array.isArray(summary)&&summary.length){
    return summary
      .map(item=>publicRegionMatch(item.matchId||item.id))
      .filter(Boolean)
      .map(match=>({...match,date:match.date||target}))
      .sort((a,b)=>String(a.time).localeCompare(String(b.time))||String(a.competition).localeCompare(String(b.competition)));
  }

  const publicAll=regionState.get("public-match-data")?.payload;
  if(Array.isArray(publicAll)&&publicAll.length){
    return publicAll
      .filter(item=>!item.date||String(item.date)===target)
      .map(item=>publicRegionMatch(item.matchId||item.id))
      .filter(Boolean)
      .map(match=>({...match,date:match.date||target}))
      .sort((a,b)=>String(a.time).localeCompare(String(b.time))||String(a.competition).localeCompare(String(b.competition)));
  }
  return [];
}
function publicStandings(){
  const raw=publicRecord(PUBLIC_KEYS.standings,{tables:{},tableMeta:{},publishedTableIds:[]})||{};
  const competitions=publicArray(PUBLIC_KEYS.competitions);
  const tableIds=Array.isArray(raw.publishedTableIds)&&raw.publishedTableIds.length?raw.publishedTableIds:Object.keys(raw.tables||{});
  const stored=tableIds.map(tableId=>{
    const meta=raw.tableMeta?.[tableId]||{};
    const competition=competitions.find(c=>String(c.id)===String(meta.competitionId||tableId))||{};
    const rows=Array.isArray(raw.tables?.[tableId])?raw.tables[tableId]:[];
    return {
      id:tableId,name:meta.name||competition.shortName||competition.name||"Classificação",
      competition:competition.name||meta.competitionName||"",competitionId:competition.id||meta.competitionId||"",
      logo:publicCompetitionAsset(competition.id||meta.competitionId),
      rows:rows.slice(0,20).map((row,index)=>({
        position:Number(row.position)||index+1,clubId:row.clubId||"",clubName:row.clubName||row.name||"Clube",
        played:Number(row.played)||0,wins:Number(row.wins)||0,draws:Number(row.draws)||0,losses:Number(row.losses)||0,
        goalDifference:Number(row.goalDifference)||0,points:Number(row.points)||0
      }))
    };
  }).filter(table=>table.rows.length);
  if(stored.length)return stored;
  const sidebar=regionState.get("studio-sidebar")?.payload;
  const panels=Array.isArray(sidebar?.panels)?sidebar.panels:[];
  return panels.filter(panel=>panel.type==="standings"&&Array.isArray(panel.items)).map(panel=>({
    id:panel.key||panel.competitionId||panel.title,
    name:panel.subtitle||panel.title||"Classificação",
    competition:panel.title||"",competitionId:panel.competitionId||"",logo:"",
    rows:panel.items.slice(0,20).map((row,index)=>({
      position:Number(row.position)||index+1,clubId:row.clubId||"",clubName:row.name||row.clubName||"Clube",
      played:Number(row.played)||0,wins:Number(row.wins)||0,draws:Number(row.draws)||0,losses:Number(row.losses)||0,
      goalDifference:Number(row.goalDifference)||0,points:Number(row.points)||0
    }))
  }));
}
function publicNews(){
  const raw=publicRecord(PUBLIC_KEYS.news,{articles:[]})||{};
  const articles=Array.isArray(raw.articles)?raw.articles:[];
  return articles.filter(item=>String(item.status||"").toUpperCase()!=="DRAFT").slice(0,12).map(item=>({
    id:item.id||"",title:item.title||item.headline||"Notícia",summary:item.summary||item.subtitle||"",
    category:item.category||item.competition||"",publishedAt:item.publishedAt||item.createdAt||"",
    image:item.image||item.imageUrl||""
  }));
}
function publicHighlights(){
  const raw=publicRecord(PUBLIC_KEYS.highlights,{items:[]})||{};
  const items=Array.isArray(raw.items)?raw.items:[];
  return items.filter(item=>item&&item.active!==false&&String(item.title||"").trim()).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).slice(0,8).map(item=>({id:item.id||"",eyebrow:item.eyebrow||"DESTAQUE RODRIGOL",title:item.title||"",lead:item.lead||"",href:item.href||"#home",meta:item.meta||"",type:item.type||"CUSTOM",targetId:item.targetId||""}));
}
function publicLiveMatches(){
  const byId=new Map();
  for(const stored of publicArray(PUBLIC_KEYS.matches)){
    const base=publicMatch(stored),live=publicRegionMatch(stored.id,base),match=mergePublicMatch(base,live);
    if(match?.live)byId.set(String(match.id),match);
  }
  const regionCandidates=[];
  const summary=regionState.get("round-summary")?.payload;
  if(Array.isArray(summary))regionCandidates.push(...summary);
  const publicAll=regionState.get("public-match-data")?.payload;
  if(Array.isArray(publicAll))regionCandidates.push(...publicAll);
  for(const item of regionCandidates){
    const id=item?.matchId||item?.id;if(!id)continue;
    const match=publicRegionMatch(id);
    if(match?.live)byId.set(String(match.id),match);
  }
  return [...byId.values()].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||'')));
}
function unionPublicMatches(...groups){
  const byId=new Map();
  for(const group of groups)for(const match of group||[])if(match)byId.set(String(match.id||`${match.date}|${match.time}|${match.home?.name}|${match.away?.name}`),match);
  return [...byId.values()].sort((a,b)=>Number(Boolean(b.live))-Number(Boolean(a.live))||String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||'')));
}
function backupRecords(backup={}){
  const records=new Map();
  const local=backup.localStorage||{};
  for(const [key,raw] of Object.entries(local)){
    if(!String(key).startsWith('rodrigol-')||['rodrigol-runtime-config-v2','rodrigol-runtime-config-v1','rodrigol-storage-error-v1'].includes(key))continue;
    try{records.set(key,typeof raw==='string'?JSON.parse(raw):raw);}catch{}
  }
  const idb=backup.indexedDb||backup.assets||{};
  for(const [key,value] of idb['data-records']||[])records.set(String(key),value);
  for(const [id,value] of idb['club-crests']||[])if(value)records.set(`rodrigol-asset-club-crest:${id}`,value);
  for(const [id,value] of idb['competition-logos']||[])if(value)records.set(`rodrigol-asset-competition-logo:${id}`,value);
  return records;
}
function publicHome(date){
  const target=publicDate(date),matches=unionPublicMatches(publicMatchesForDate(target),publicLiveMatches()),standings=publicStandings(),news=publicNews(),highlights=publicHighlights();
  const radioRaw=persistentData.get("rodrigol-radio-config-v1")||{};const radio={active:radioRaw.active===true,name:String(radioRaw.name||"Rádio RodriGol"),streamUrl:String(radioRaw.streamUrl||""),autoplay:radioRaw.autoplay===true};
  return {ok:true,generatedAt:new Date().toISOString(),date:target,revision:dataRevision,matches,standings:standings.slice(0,4),news:news.slice(0,6),highlights,radio};
}


function persistentEnvelope(reason="runtime"){return {version:2,revision:dataRevision,updatedAt:new Date().toISOString(),reason,recordCount:persistentData.size,records:Object.fromEntries(persistentData)};}
async function listBackupFiles(){try{return (await readdir(backupRoot)).filter(name=>name.endsWith(".json")).sort().reverse();}catch{return[];}}
async function pruneBackups(){const files=await listBackupFiles();for(const name of files.slice(MAX_AUTOMATIC_BACKUPS))await unlink(join(backupRoot,name)).catch(()=>{});}
async function backupCurrentData(reason="automatic"){if(!persistentData.size)return null;await mkdir(backupRoot,{recursive:true});const stamp=new Date().toISOString().replace(/[:.]/g,"-");const file=join(backupRoot,`rodrigol-store-${stamp}-${reason}.json`);await writeFile(file,JSON.stringify(persistentEnvelope(reason),null,2),"utf8");lastBackupAt=new Date().toISOString();await pruneBackups();return file;}
function scheduleAutomaticBackup(){if(backupTimer)return;backupTimer=setTimeout(()=>{backupTimer=null;dataWriteQueue=dataWriteQueue.then(()=>backupCurrentData("automatic")).catch(error=>console.error("Falha no backup automático:",error));},AUTO_BACKUP_DELAY_MS);backupTimer.unref?.();}
async function loadPersistentData(){
  try{const parsed=JSON.parse(await readFile(dataFile,"utf8"));dataRevision=Number(parsed.revision)||0;lastDataSavedAt=parsed.updatedAt||null;for(const [key,value] of Object.entries(parsed.records||{}))persistentData.set(key,value);return;}
  catch(error){if(error?.code==="ENOENT")return;console.error("Falha ao carregar dados persistentes; tentando backup automático:",error);}
  for(const name of await listBackupFiles()){try{const parsed=JSON.parse(await readFile(join(backupRoot,name),"utf8"));persistentData.clear();dataRevision=Number(parsed.revision)||0;lastDataSavedAt=parsed.updatedAt||null;for(const [key,value] of Object.entries(parsed.records||{}))persistentData.set(key,value);console.warn(`Base recuperada automaticamente do backup ${name}.`);await persistData();return;}catch{}}
}
async function persistData(){await mkdir(dataRoot,{recursive:true});const temp=`${dataFile}.tmp`;const envelope=persistentEnvelope("runtime");await writeFile(temp,JSON.stringify(envelope,null,2),"utf8");await rename(temp,dataFile);lastDataSavedAt=envelope.updatedAt;}
function flushQueuedPersistence(){
  if(dataPersistTimer){clearTimeout(dataPersistTimer);dataPersistTimer=null;}
  const waiters=pendingPersistWaiters;pendingPersistWaiters=[];
  dataWriteQueue=dataWriteQueue.then(persistData).then(()=>{scheduleAutomaticBackup();for(const waiter of waiters)waiter.resolve();}).catch(error=>{console.error("Falha ao persistir dados:",error);for(const waiter of waiters)waiter.reject(error);});
  return dataWriteQueue;
}
function queuePersistData(delayMs=DATA_PERSIST_DEBOUNCE_MS){
  const promise=new Promise((resolve,reject)=>pendingPersistWaiters.push({resolve,reject}));
  if(!dataPersistTimer){dataPersistTimer=setTimeout(flushQueuedPersistence,Math.max(0,Number(delayMs)||0));dataPersistTimer.unref?.();}
  return promise;
}
function notifyPublicEvent(kind="data",detail={}){
  const payload=`data: ${JSON.stringify({kind,revision:dataRevision,sequence,...detail,at:new Date().toISOString()})}\n\n`;
  for(const response of [...publicEventClients]){try{response.write(payload);}catch{publicEventClients.delete(response);}}
}
function broadcastDataChange(key,value,deleted=false,source="api"){
  const envelope={type:"data-change",revision:dataRevision,key,value:deleted?null:value,deleted,source,sentAt:new Date().toISOString()};
  for(const socket of clients)send(socket,envelope);
  notifyPublicEvent("data",{key});
  return envelope;
}
function broadcastDataPatch(key,patch,source="api"){
  const envelope={type:"data-patch",revision:dataRevision,key,patch,source,sentAt:new Date().toISOString()};
  for(const socket of clients)send(socket,envelope);
  notifyPublicEvent("data",{key,patch:true});
  return envelope;
}
await loadPersistentData();

function json(response,status,body){response.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":allowedOrigin});response.end(JSON.stringify(body));}
function redirect(response,location){response.writeHead(308,{Location:location,"Cache-Control":"no-store"});response.end();}
function frameText(text){const payload=Buffer.from(text);if(payload.length<126)return Buffer.concat([Buffer.from([0x81,payload.length]),payload]);if(payload.length<65536){const head=Buffer.alloc(4);head[0]=0x81;head[1]=126;head.writeUInt16BE(payload.length,2);return Buffer.concat([head,payload]);}const head=Buffer.alloc(10);head[0]=0x81;head[1]=127;head.writeBigUInt64BE(BigInt(payload.length),2);return Buffer.concat([head,payload]);}
function framePing(){return Buffer.from([0x89,0x00]);}
function prepareSocketMessage(message){return frameText(JSON.stringify(message));}
function sendPrepared(socket,frame){if(!socket.destroyed)socket.write(frame);}
function send(socket,message){sendPrepared(socket,prepareSocketMessage(message));}
function sanitizePayload(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return value;
  const payload={...value};
  delete payload.unset;
  delete payload.replace;
  return payload;
}
function mergeRegionPayload(currentPayload,incoming,replace=false){
  if(Array.isArray(incoming))return incoming;
  const base=replace?{}:(currentPayload&&typeof currentPayload==="object"&&!Array.isArray(currentPayload)?{...currentPayload}:{});
  const merged={...base,...incoming};
  const unset=incoming?.unset;
  if(Array.isArray(unset)){
    for(const key of unset){
      if(key&&typeof key==="string")delete merged[key];
    }
  }
  delete merged.unset;
  delete merged.replace;
  return sanitizePayload(merged);
}
function applyToState(command){
  if(command.type==="clear-all"){regionState.clear();return;}
  const current=regionState.get(command.region)??{visible:false,payload:{}};
  if(command.type==="clear"){regionState.set(command.region,{visible:false,payload:{}});return;}
  if(command.type==="hide"){regionState.set(command.region,{...current,visible:false});return;}
  const incoming=command.payload??{};
  const replace=command.type==="show"||incoming.replace===true;
  const payload=mergeRegionPayload(current.payload,incoming,replace);
  regionState.set(command.region,{visible:["show","update"].includes(command.type)?true:current.visible,payload});
}
function stateSnapshot(){return Object.fromEntries(regionState.entries());}
const legacyRegionAliases={ticker:"legacy-disabled","side-alert":"legacy-disabled","lower-third":"studio-lower-third",headline:"studio-headline",fullscreen:"studio-fullscreen"};
function normalizeCommand(command){const mapped=legacyRegionAliases[command?.region];if(!mapped)return command;return {...command,region:mapped,meta:{...(command.meta||{}),legacyRegion:command.region}};}
function broadcast(command,source="api"){
  command=normalizeCommand(command);applyToState(command);
  const envelope={type:"command",sequence:++sequence,source,sentAt:new Date().toISOString(),command};
  lastCommand=envelope;commandCount+=1;lastPublicationAt=envelope.sentAt;
  const frame=prepareSocketMessage(envelope);for(const socket of clients)sendPrepared(socket,frame);
  // Go-Live 1.6.2: o placar público recebe o estado canônico no mesmo evento SSE do comando.
  // Assim o Portal não precisa esperar um novo GET /api/public/home para mostrar um gol/fase.
  if(command.region==="round-scoreboard")notifyPublicEvent("live",{region:command.region,matches:publicLiveMatches()});
  else notifyPublicEvent("command",{region:command.region});
  return envelope;
}
function validCommand(value){if(!value||typeof value!=="object"||typeof value.type!=="string")return false;if(value.type==="clear-all")return true;return typeof value.region==="string"&&["show","update","hide","clear"].includes(value.type);}
function safeEqual(a='',b=''){const left=Buffer.from(String(a)),right=Buffer.from(String(b));return left.length===right.length&&timingSafeEqual(left,right);}
function cookies(request){const out={};for(const part of String(request.headers.cookie||'').split(';')){const index=part.indexOf('=');if(index<0)continue;out[part.slice(0,index).trim()]=decodeURIComponent(part.slice(index+1).trim());}return out;}
function signSessionPayload(payload){return createHmac("sha256",sessionSecret).update(payload).digest("base64url");}
function createSessionToken(){const payload=Buffer.from(JSON.stringify({iat:Date.now(),exp:Date.now()+sessionTtlHours*3600000,nonce:randomBytes(12).toString("hex")})).toString("base64url");return `${payload}.${signSessionPayload(payload)}`;}
function sessionFor(request){if(!adminPassword)return {local:true,expiresAt:Infinity};const token=cookies(request).rodrigol_session;if(!token)return null;const [payload,signature]=String(token).split('.');if(!payload||!signature)return null;const expected=signSessionPayload(payload);const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const decoded=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));if(Number(decoded.exp)<=Date.now())return null;return {createdAt:Number(decoded.iat)||0,expiresAt:Number(decoded.exp)||0};}catch{return null;}}
function bearerAuthorized(request){if(!apiToken)return false;const header=String(request.headers.authorization||"");return safeEqual(header,`Bearer ${apiToken}`);}
function authorized(request){return !apiToken&&!adminPassword?true:Boolean(bearerAuthorized(request)||sessionFor(request));}
function requireAuth(request,response){if(authorized(request))return true;json(response,401,{ok:false,error:"Autenticação obrigatória."});return false;}
function controlAuthorized(request){return !adminPassword||Boolean(sessionFor(request));}
function loginRedirect(response,next='/control/'){const location=`/login?next=${encodeURIComponent(next)}`;response.writeHead(302,{Location:location,"Cache-Control":"no-store"});response.end();}
function setSessionCookie(response,token){response.setHeader("Set-Cookie",`rodrigol_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionTtlHours*3600}${secureCookies?"; Secure":""}`);}
function clearSessionCookie(response){response.setHeader("Set-Cookie",`rodrigol_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookies?"; Secure":""}`);}
function loginPage(next='/control/',error=''){
  const safeNext=String(next||'/control/').startsWith('/control')?String(next):'/control/';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RodriGol Studio — Acesso</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#071018;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}.box{width:min(430px,calc(100vw - 32px));background:#0c1b25;border:1px solid #284352;border-radius:14px;padding:28px;box-shadow:0 24px 70px #0008}.brand{font:italic 900 30px/1 Arial Black,Arial;color:#ff5b00;margin-bottom:28px}.brand b{font-size:13px;background:#ff5b00;color:#071018;padding:5px 8px;border-radius:4px;vertical-align:middle}.box h1{font-size:20px;margin:0 0 7px}.box p{color:#9eb1bd;font-size:13px;line-height:1.5}.error{background:#39161a;color:#ffb7bb;padding:10px;border-radius:6px;margin:14px 0;font-size:12px}label{display:block;margin-top:18px;font-size:11px;font-weight:800;color:#b8c7cf}input{width:100%;margin-top:7px;padding:13px;border:1px solid #365363;border-radius:7px;background:#07141c;color:#fff;font-size:15px}button{width:100%;margin-top:18px;padding:13px;border:0;border-radius:7px;background:#ff5b00;color:#071018;font-weight:900;cursor:pointer}.foot{margin-top:18px;color:#67808e!important;font-size:11px!important}</style></head><body><form class="box" method="post" action="/login"><div class="brand">RODRIGOL <b>STUDIO</b></div><h1>Acesso ao sistema</h1><p>Entre para acessar a Central, Cabines e ferramentas administrativas.</p>${error?`<div class="error">${error}</div>`:''}<input type="hidden" name="next" value="${safeNext.replace(/"/g,'&quot;')}"><label>SENHA<input name="password" type="password" autocomplete="current-password" autofocus required></label><button type="submit">ENTRAR NO RODRIGOL</button><p class="foot">O Overlay público continua separado da área administrativa.</p></form></body></html>`;
}
async function readBody(request){const chunks=[];let size=0;for await(const chunk of request){chunks.push(chunk);size+=chunk.length;if(size>12_000_000)throw new Error("Payload muito grande (limite de 12 MB)");}return Buffer.concat(chunks).toString("utf8");}
function formBody(text=''){return Object.fromEntries(new URLSearchParams(String(text)));}

async function serve(root,pathname,response){const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");const target=normalize(join(root,relative));if(!target.startsWith(root)){response.writeHead(403,{"Content-Type":"text/plain; charset=utf-8"});response.end("Forbidden");return;}try{const info=await stat(target);const file=info.isDirectory()?join(target,"index.html"):target;const body=await readFile(file);response.writeHead(200,{"Content-Type":types[extname(file)]??"application/octet-stream","Cache-Control":"no-store","Access-Control-Allow-Origin":allowedOrigin});response.end(body);}catch{response.writeHead(404,{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"});response.end("Arquivo não encontrado");}}

const server=createServer(async(request,response)=>{
  const url=new URL(request.url??"/",`http://${host}`);const pathname=decodeURIComponent(url.pathname);
  if(request.method==="OPTIONS"){response.writeHead(204,{"Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"});response.end();return;}
  if(pathname==="/login"&&request.method==="GET"){
    if(controlAuthorized(request)){redirect(response,url.searchParams.get("next")||"/control/");return;}
    const body=loginPage(url.searchParams.get("next")||"/control/");
    response.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});response.end(body);return;
  }
  if(pathname==="/login"&&request.method==="POST"){
    const form=formBody(await readBody(request)),next=String(form.next||"/control/");
    if(adminPassword&&safeEqual(form.password||"",adminPassword)){
      const token=createSessionToken();
      setSessionCookie(response,token);redirect(response,next.startsWith("/control")?next:"/control/");return;
    }
    const body=loginPage(next,"Senha incorreta.");response.writeHead(401,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});response.end(body);return;
  }
  if(pathname==="/logout"){
    clearSessionCookie(response);redirect(response,"/login");return;
  }
  if(pathname==="/api/session"){
    const session=sessionFor(request);json(response,200,{authenticated:Boolean(session),loginRequired:Boolean(adminPassword),environment,expiresAt:session?.expiresAt||null});return;
  }
  if(pathname==="/health"){json(response,200,{status:"ok",app:"@rodrigol/obs-bridge",version:bridgeVersion,environment,overlay:"@rodrigol/overlay-studio",connections:clients.size,sequence,uptimeSeconds:Math.floor((Date.now()-startedAt)/1000),commandCount,lastPublicationAt,remoteAccess:remoteHost,loginRequired:Boolean(adminPassword),data:{revision:dataRevision,records:persistentData.size,lastSavedAt:lastDataSavedAt,lastBackupAt},memory:process.memoryUsage()});return;}
  if(pathname==="/api/state"){if(!requireAuth(request,response))return;json(response,200,{connections:clients.size,sequence,lastCommand,regions:stateSnapshot()});return;}
  if(pathname==="/api/network"){json(response,200,{environment,hostname:os.hostname(),platform:process.platform,node:process.version,host,port,connections:clients.size,reconnects,allowedOrigin,tokenRequired:Boolean(apiToken),loginRequired:Boolean(adminPassword),remoteAccess:remoteHost,secureCookies,overlayRoot:process.env.RODRIGOL_OVERLAY_ROOT||"studio",dataRoot});return;}
  if(pathname==="/api/runtime-config"){json(response,200,{environment,bridgeHttp:process.env.RODRIGOL_PUBLIC_URL||null,bridgeWs:process.env.RODRIGOL_PUBLIC_WS||null,overlayUrl:process.env.RODRIGOL_OVERLAY_URL||null,tokenRequired:Boolean(apiToken),loginRequired:Boolean(adminPassword),remoteAccess:remoteHost});return;}
  if(pathname==="/api/public/events"&&request.method==="GET"){
    response.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","Access-Control-Allow-Origin":allowedOrigin});
    response.write(`data: ${JSON.stringify({kind:"ready",revision:dataRevision,sequence,at:new Date().toISOString()})}\n\n`);
    publicEventClients.add(response);
    request.on("close",()=>publicEventClients.delete(response));
    return;
  }
  if(pathname==="/api/public/home"&&request.method==="GET"){json(response,200,publicHome(url.searchParams.get("date")));return;}
  if(pathname==="/api/public/matches"&&request.method==="GET"){const date=publicDate(url.searchParams.get("date"));json(response,200,{ok:true,date,generatedAt:new Date().toISOString(),matches:publicMatchesForDate(date)});return;}
  if(pathname.startsWith("/api/public/matches/")&&request.method==="GET"){
    const id=decodeURIComponent(pathname.slice("/api/public/matches/".length));
    const stored=publicArray(PUBLIC_KEYS.matches).find(item=>String(item.id)===id);
    const base=stored?publicMatch(stored):null;
    const match=publicRegionMatch(id,base)||base;
    if(!match){json(response,404,{ok:false,error:"Partida não encontrada."});return;}
    json(response,200,{ok:true,generatedAt:new Date().toISOString(),match});return;
  }
  if(pathname==="/api/public/standings"&&request.method==="GET"){json(response,200,{ok:true,generatedAt:new Date().toISOString(),standings:publicStandings()});return;}
  if(pathname==="/api/public/news"&&request.method==="GET"){json(response,200,{ok:true,generatedAt:new Date().toISOString(),news:publicNews()});return;}
  if(pathname==="/api/data/status"&&request.method==="GET"){if(!requireAuth(request,response))return;const backups=await listBackupFiles();json(response,200,{ok:true,environment,dataRoot,revision:dataRevision,records:persistentData.size,lastSavedAt:lastDataSavedAt,lastBackupAt,automaticBackups:backups.length});return;}
  if(pathname==="/api/data/import-backup"&&request.method==="POST"){
    if(!requireAuth(request,response))return;
    try{
      const backup=JSON.parse(await readBody(request));
      if(backup?.format!=="rodrigol-backup")throw new Error("Backup RodriGol inválido.");
      const imported=backupRecords(backup);
      if(persistentData.size)await backupCurrentData("before-import");
      persistentData.clear();
      for(const [key,value] of imported)persistentData.set(key,value);
      dataRevision+=1;
      await queuePersistData(0);
      broadcastDataChange("__backup_import__",{records:imported.size},false,"backup-import");
      json(response,200,{ok:true,revision:dataRevision,records:imported.size});
    }catch(error){json(response,400,{ok:false,error:error.message||"Falha ao importar backup."});}
    return;
  }
  if(pathname==="/api/data/snapshot"){if(!requireAuth(request,response))return;const since=Number(url.searchParams.get("since"))||0;if(since>=dataRevision){json(response,200,{ok:true,revision:dataRevision,unchanged:true});return;}json(response,200,{ok:true,revision:dataRevision,records:Object.fromEntries(persistentData)});return;}
  if(pathname.startsWith("/api/data-patch/")&&request.method==="PATCH"){
    if(!requireAuth(request,response))return;
    const parts=pathname.slice("/api/data-patch/".length).split("/").map(decodeURIComponent),kind=parts[0],id=parts.slice(1).join("/");
    try{
      const body=JSON.parse(await readBody(request)),value=body?.value,source=body?.source||"api-patch";
      if(!id||!value||typeof value!=="object"){json(response,400,{ok:false,error:"Patch inválido."});return;}
      let key="",patchValue=value;
      if(kind==="match"){
        key="rodrigol-matches-v1";const rows=Array.isArray(persistentData.get(key))?[...persistentData.get(key)]:[];const index=rows.findIndex(item=>String(item?.id)===id);if(index>=0)rows[index]=value;else rows.push(value);persistentData.set(key,rows);
      }else if(kind==="history"){
        key="rodrigol-history-v1";const state=persistentData.get(key)||{entries:[]},entries=Array.isArray(state.entries)?[...state.entries]:[];const index=entries.findIndex(item=>String(item?.matchId)===id);if(index>=0)entries[index]={...entries[index],...value};else entries.unshift(value);persistentData.set(key,{...state,entries:entries.slice(0,500)});
      }else{json(response,404,{ok:false,error:"Tipo de patch desconhecido."});return;}
      dataRevision+=1;const envelope=broadcastDataPatch(key,{op:"upsert",value:patchValue},source);queuePersistData().catch(()=>{});json(response,202,{ok:true,key,revision:dataRevision,envelope,persisted:false});
    }catch(error){json(response,400,{ok:false,error:error?.message||"Patch inválido."});}
    return;
  }
  if(pathname.startsWith("/api/data/")){
    if(!requireAuth(request,response))return;
    const key=decodeURIComponent(pathname.slice(10)||"");
    if(!key){json(response,400,{ok:false,error:"Chave obrigatória."});return;}
    if(request.method==="GET"){json(response,200,{ok:true,key,revision:dataRevision,value:persistentData.has(key)?persistentData.get(key):null});return;}
    if(request.method==="PUT"){try{const body=JSON.parse(await readBody(request));persistentData.set(key,body.value);dataRevision+=1;const envelope=broadcastDataChange(key,body.value,false,body.source||"api");queuePersistData().catch(()=>{});json(response,202,{ok:true,key,revision:dataRevision,envelope,persisted:false});}catch(error){json(response,400,{ok:false,error:error.message||"JSON inválido"});}return;}
    if(request.method==="DELETE"){persistentData.delete(key);dataRevision+=1;const envelope=broadcastDataChange(key,null,true,"api");queuePersistData().catch(()=>{});json(response,202,{ok:true,key,revision:dataRevision,envelope,persisted:false});return;}
  }
  if(pathname.startsWith("/api/storage/")){if(!requireAuth(request,response))return;const namespace=decodeURIComponent(pathname.slice(13)||"default");if(request.method==="GET"){json(response,200,{namespace,payload:remoteStorage.get(namespace)||null,updatedAt:remoteStorage.get(`${namespace}:updatedAt`)||null});return;}if(request.method==="PUT"){try{const payload=JSON.parse(await readBody(request));remoteStorage.set(namespace,payload);remoteStorage.set(`${namespace}:updatedAt`,new Date().toISOString());json(response,200,{ok:true,namespace});}catch(error){json(response,400,{ok:false,error:error.message||"JSON inválido"});}return;}}
  if(pathname==="/api/commands/batch"&&request.method==="POST"){
    if(!requireAuth(request,response))return;
    const started=performance.now();
    try{
      const body=JSON.parse(await readBody(request));
      const commands=Array.isArray(body)?body:Array.isArray(body?.commands)?body.commands:[];
      if(!commands.length||commands.length>20||commands.some(command=>!validCommand(command))){json(response,400,{ok:false,error:"Lote de comandos de overlay inválido."});return;}
      const envelopes=commands.map(command=>broadcast(command,"api-batch"));
      // ACK compacto: os payloads já foram entregues por WebSocket. Não ecoamos novamente
      // megabytes de comandos na resposta HTTP da Cabine.
      json(response,202,{ok:true,count:envelopes.length,sequences:envelopes.map(item=>item.sequence),serverTimingMs:Math.round((performance.now()-started)*100)/100});
    }catch(error){json(response,400,{ok:false,error:error instanceof Error?error.message:"JSON inválido"});}
    return;
  }
  if(pathname==="/api/commands"&&request.method==="POST"){
    if(!requireAuth(request,response))return;
    const started=performance.now();
    try{const command=JSON.parse(await readBody(request));if(!validCommand(command)){json(response,400,{ok:false,error:"Comando de overlay inválido."});return;}const envelope=broadcast(command,"api");json(response,202,{ok:true,envelope,serverTimingMs:Math.round((performance.now()-started)*100)/100});}catch(error){json(response,400,{ok:false,error:error instanceof Error?error.message:"JSON inválido"});}return;
  }
  if(pathname==="/portal"||pathname==="/portal/"){await serve(bridgeRoot,"/portal/index.html",response);return;}
  if(pathname==="/legacy"){redirect(response,"/legacy/");return;}
  if(pathname.startsWith("/legacy/")){await serve(legacyRoot,pathname.slice(8)||"/",response);return;}
  if(pathname==="/studio"){redirect(response,"/studio/");return;}
  if(pathname.startsWith("/studio/")){await serve(studioRoot,pathname.slice(8)||"/",response);return;}
  if(pathname==="/control"){if(!controlAuthorized(request)){loginRedirect(response,"/control/");return;}redirect(response,"/control/");return;}
  if(["/control/multicabine","/multicabine","/multicabine.html"].includes(pathname)){if(!controlAuthorized(request)){loginRedirect(response,"/control/multicabine.html");return;}redirect(response,"/control/multicabine.html");return;}
  if(pathname==="/control/central"){if(!controlAuthorized(request)){loginRedirect(response,"/control/central.html");return;}redirect(response,"/control/central.html");return;}
  if(pathname.startsWith("/control/")){if(!controlAuthorized(request)){loginRedirect(response,pathname);return;}await serve(bridgeRoot,pathname.slice(8),response);return;}
  const overlayPath=pathname==="/favicon.ico"?"/assets/favicon.svg":pathname;await serve(overlayRoot,overlayPath,response);
});

server.on("upgrade",(request,socket)=>{
  const url=new URL(request.url??"/",`http://${host}`);if(url.pathname!=="/ws"){socket.destroy();return;}
  const wsToken=String(url.searchParams.get("token")||"");
  const wsAuthorized=!apiToken&&!adminPassword||Boolean(sessionFor(request)||(apiToken&&safeEqual(wsToken,apiToken)));
  if(!wsAuthorized){socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");socket.destroy();return;}
  const key=request.headers["sec-websocket-key"];if(typeof key!=="string"){socket.destroy();return;}
  const accept=createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write(["HTTP/1.1 101 Switching Protocols","Upgrade: websocket","Connection: Upgrade",`Sec-WebSocket-Accept: ${accept}`,"\r\n"].join("\r\n"));
  clients.add(socket);send(socket,{type:"welcome",version:bridgeVersion,sequence,lastCommand,regions:stateSnapshot()});
  socket.on("close",()=>{clients.delete(socket);reconnects+=1;});socket.on("error",()=>clients.delete(socket));
  socket.on("data",buffer=>{if((buffer[0]&0x0f)===0x8){clients.delete(socket);socket.end();}});
});

const heartbeat=setInterval(()=>{for(const socket of clients){if(socket.destroyed)clients.delete(socket);else socket.write(framePing());}for(const response of [...publicEventClients]){try{response.write(": keepalive\n\n");}catch{publicEventClients.delete(response);}}},15000);heartbeat.unref();
server.listen(port,host,()=>{console.log("");console.log("RodriGol OBS Bridge iniciado com sucesso.");console.log(`Overlay Studio/OBS: http://${host}:${port}`);
console.log(`Overlay legado:     http://${host}:${port}/legacy/`);console.log(`Controle:    http://${host}:${port}/control/`);console.log(`WebSocket:   ws://${host}:${port}/ws`);console.log(`Diagnóstico: http://${host}:${port}/health`);
console.log(`Acesso remoto: ${remoteHost?"ATIVO":"LOCAL"}${adminPassword?" · login protegido":""}`);
console.log("Pressione Ctrl+C para encerrar.\n");});
