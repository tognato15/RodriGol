import {
  getClubs,
  getCompetitions,
  getMatches,
  getStandingsState,
  saveStandingsState,
  readCoverage
} from './data-store.js';

const LIVE_PHASES = new Set([
  'FIRST_HALF','LIVE_UNKNOWN','HALFTIME','SECOND_HALF','EXTRA_TIME','PENALTIES',
  'LIVE','IN_PROGRESS','IN_PROGRESS_UNKNOWN'
]);
const FINAL_PHASES = new Set(['FINAL','FINISHED','CONFIRMED','ARCHIVED']);

function number(value){
  const parsed=Number(value);
  return Number.isFinite(parsed)?parsed:0;
}

function targetMeta(tableId){
  const state=getStandingsState();
  const stored=state.tableMeta?.[tableId]||{};
  const parts=String(tableId||'').split('__');
  return {
    ...stored,
    competitionId:String(stored.competitionId||parts[0]||''),
    stageId:String(stored.stageId||parts[1]||''),
    groupId:String(stored.groupId||parts[2]||'')
  };
}

function matchBelongs(match,meta){
  if(!match||String(match.competitionId||'')!==meta.competitionId)return false;
  if(meta.season&&String(match.season||'')!==String(meta.season))return false;
  if(meta.stageId&&String(match.stageId||'')!==meta.stageId)return false;
  if(meta.groupId&&String(match.groupId||'')!==meta.groupId)return false;
  return true;
}

function phaseFor(match,coverage){
  return String(coverage?.phase||match?.status||'SCHEDULED').toUpperCase();
}

function included(phase,mode){
  if(mode==='LIVE')return LIVE_PHASES.has(phase)||FINAL_PHASES.has(phase);
  return FINAL_PHASES.has(phase);
}

function competitionRules(competition){
  return {
    win:number(competition?.pointsWin??3),
    draw:number(competition?.pointsDraw??1),
    loss:number(competition?.pointsLoss??0),
    tieBreakers:Array.isArray(competition?.tieBreakers)&&competition.tieBreakers.length
      ?competition.tieBreakers
      :['points','wins','goalDifference','goalsFor','name']
  };
}

function emptyRow(clubId,clubName,adjustmentPoints=0){
  return {clubId,clubName,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,goalDifference:0,basePoints:0,adjustmentPoints:number(adjustmentPoints),points:0,position:0};
}

function compareRows(a,b,tieBreakers){
  for(const key of tieBreakers){
    if(key==='name'){
      const diff=String(a.clubName||'').localeCompare(String(b.clubName||''),'pt-BR');
      if(diff)return diff;
      continue;
    }
    const diff=number(b[key])-number(a[key]);
    if(diff)return diff;
  }
  return String(a.clubName||'').localeCompare(String(b.clubName||''),'pt-BR');
}

export function rankStandingRows(rows,competition){
  const rules=competitionRules(competition);
  const ranked=(Array.isArray(rows)?rows:[]).map(row=>({...row}));
  ranked.sort((a,b)=>compareRows(a,b,rules.tieBreakers));
  return ranked.map((row,index)=>({...row,position:index+1}));
}

export function standingAudit(tableId){
  const meta=targetMeta(tableId);
  const clubs=new Set();
  const counts={total:0,live:0,final:0,scheduled:0,other:0,officialIncluded:0,liveIncluded:0};
  const matches=getMatches().filter(match=>matchBelongs(match,meta));
  counts.total=matches.length;
  for(const match of matches){
    if(match.homeClubId)clubs.add(String(match.homeClubId));
    if(match.awayClubId)clubs.add(String(match.awayClubId));
    const coverage=readCoverage(match.id,null);
    const phase=phaseFor(match,coverage);
    if(FINAL_PHASES.has(phase)){
      counts.final+=1;
      counts.officialIncluded+=1;
      counts.liveIncluded+=1;
    }else if(LIVE_PHASES.has(phase)){
      counts.live+=1;
      counts.liveIncluded+=1;
    }else if(['SCHEDULED','PRE_GAME','PROGRAMADO','PREMATCH'].includes(phase)){
      counts.scheduled+=1;
    }else{
      counts.other+=1;
    }
  }
  return {tableId,competitionId:meta.competitionId,stageId:meta.stageId,groupId:meta.groupId,clubs:clubs.size,...counts};
}

export function calculateStandingTable(tableId,{mode='OFFICIAL'}={}){
  const normalizedMode=mode==='LIVE'?'LIVE':'OFFICIAL';
  const state=getStandingsState();
  const meta=targetMeta(tableId);
  const competition=getCompetitions().find(item=>item.id===meta.competitionId);
  const rules=competitionRules(competition);
  const clubs=new Map(getClubs().map(club=>[club.id,club]));
  const existing=Array.isArray(state.tables?.[tableId])?state.tables[tableId]:[];
  const rows=new Map();

  for(const row of existing){
    if(!row.clubId)continue;
    const club=clubs.get(row.clubId);
    rows.set(row.clubId,emptyRow(row.clubId,club?.shortName||club?.name||row.clubName||'Clube',row.adjustmentPoints));
  }

  const matches=getMatches().filter(match=>matchBelongs(match,meta));

  // Todos os clubes vinculados à fase/grupo entram na tabela desde o início,
  // mesmo que sua primeira partida ainda esteja programada.
  for(const match of matches){
    const homeId=String(match.homeClubId||''),awayId=String(match.awayClubId||'');
    if(homeId&&!rows.has(homeId)){
      const club=clubs.get(homeId);
      rows.set(homeId,emptyRow(homeId,club?.shortName||club?.name||'Mandante'));
    }
    if(awayId&&!rows.has(awayId)){
      const club=clubs.get(awayId);
      rows.set(awayId,emptyRow(awayId,club?.shortName||club?.name||'Visitante'));
    }
  }

  for(const match of matches){
    const coverage=readCoverage(match.id,null);
    const phase=phaseFor(match,coverage);
    if(!included(phase,normalizedMode))continue;
    const homeId=String(match.homeClubId||''),awayId=String(match.awayClubId||'');
    if(!homeId||!awayId)continue;
    const home=rows.get(homeId),away=rows.get(awayId);
    if(!home||!away)continue;
    const homeScore=number(coverage?.homeScore??match.homeScore),awayScore=number(coverage?.awayScore??match.awayScore);
    home.played+=1;away.played+=1;
    home.goalsFor+=homeScore;home.goalsAgainst+=awayScore;
    away.goalsFor+=awayScore;away.goalsAgainst+=homeScore;
    if(homeScore>awayScore){home.wins+=1;away.losses+=1;home.basePoints+=rules.win;away.basePoints+=rules.loss;}
    else if(homeScore<awayScore){away.wins+=1;home.losses+=1;away.basePoints+=rules.win;home.basePoints+=rules.loss;}
    else{home.draws+=1;away.draws+=1;home.basePoints+=rules.draw;away.basePoints+=rules.draw;}
  }

  const result=[...rows.values()].map(row=>({...row,goalDifference:row.goalsFor-row.goalsAgainst,points:row.basePoints+row.adjustmentPoints,calculationMode:'AUTO',standingMode:normalizedMode}));
  return rankStandingRows(result,competition);
}

export function standingPanel(tableId,{mode}={}){
  const state=getStandingsState();
  const meta=targetMeta(tableId);
  const competition=getCompetitions().find(c=>c.id===meta.competitionId);
  const selectedMode=mode||meta.overlayMode||'OFFICIAL';
  const automatic=meta.calculationMode==='AUTO';
  const rows=automatic?calculateStandingTable(tableId,{mode:selectedMode}):(state.tables[tableId]||[]);
  return {
    key:`standings:${meta.competitionId}:${tableId===meta.competitionId?'':tableId}`,
    competitionId:meta.competitionId,
    phaseId:tableId===meta.competitionId?'':tableId,
    title:`CLASSIFICAÇÃO${selectedMode==='LIVE'?' AO VIVO':''} · ${competition?.shortName||competition?.name||meta.competitionShortName||'COMPETIÇÃO'}`,
    subtitle:meta.name||'',
    type:'standings',
    mode:selectedMode,
    items:rows.slice(0,20).map(row=>({position:row.position,name:row.clubName||'Clube',points:row.points}))
  };
}

export function recalculateAutomaticStandingsForMatch(match){
  if(!match?.competitionId)return [];
  const state=getStandingsState();
  const updated=[];
  for(const [tableId,meta] of Object.entries(state.tableMeta||{})){
    if(meta?.calculationMode!=='AUTO')continue;
    if(String(meta.competitionId||'')!==String(match.competitionId||''))continue;
    if(meta.season&&String(meta.season)!==String(match.season||''))continue;
    if(meta.stageId&&String(meta.stageId)!==String(match.stageId||''))continue;
    if(meta.groupId&&String(meta.groupId)!==String(match.groupId||''))continue;
    state.tables[tableId]=calculateStandingTable(tableId,{mode:'OFFICIAL'});
    updated.push(tableId);
  }
  if(updated.length){
    saveStandingsState(state);
    window.dispatchEvent(new CustomEvent('rodrigol:data-changed',{detail:{key:'rodrigol-standings-v1',tableIds:updated}}));
  }
  return updated;
}
