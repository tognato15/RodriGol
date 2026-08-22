import { publishCommand, publishCommands } from './bridge-client.js';
import {getMatches,getActiveScoreboardMatchIds,getClub,readCoverage,getOverlayControlState,getCompetitions,getStandingsState,getSidebarSequenceState,getSidebarLowerState,getKnockoutState,getClubs,findCompetitionByName} from './data-store.js';
import {buildMatchPresentationPayload,deriveVisualState,normalizeCoverage,shouldShowClock} from './match-presentation.js';
import {standingPanel} from './standings-engine.js';
function club(id,side){return getClub(id)||{shortName:side,abbreviation:side.slice(0,3).toUpperCase(),primaryColor:'#18394a',secondaryColor:'#fff',crestText:side[0],crestDataUrl:''};}
function crest(c){return{text:c.crestText||c.abbreviation||'?',image:c.crestDataUrl||'',background:c.primaryColor||'#18394a',color:c.secondaryColor||'#fff'};}
function short(name=''){const v=String(name).toUpperCase();if(v.includes('SÉRIE A')||v.includes('SERIE A'))return'BR1';if(v.includes('SÉRIE B')||v.includes('SERIE B'))return'BR2';if(v.includes('LIBERTADORES'))return'LIB';return v.replace(/[^A-Z0-9]/g,'').slice(0,4)||'FUT';}
function state(match){return normalizeCoverage(match,readCoverage(match.id,null));}
function scorerGoal(text=''){const raw=String(text||'').trim();if(!raw)return null;const m=raw.match(/^\s*(\d{1,3})(?:['’º°])?\s*[-–—·:]?\s*(.+)$/);if(m)return{minute:`${m[1]}'`,player:m[2].trim()||'Gol'};return{minute:'',player:raw};}
export function compactScoreboardAction(event={}){
  const type=String(event.type||'').toUpperCase(),minute=Number.isFinite(Number(event.minute))?`${Number(event.minute)}'`:'',player=event.player||event.author||'';
  if(type==='GOAL')return ['⚽',minute,player].filter(Boolean).join(' · ');
  if(type==='YELLOW_CARD')return ['🟨',minute,player].filter(Boolean).join(' · ');
  if(type==='RED_CARD')return ['🟥',minute,player].filter(Boolean).join(' · ');
  if(type==='SUBSTITUTION')return ['🔁',minute,event.substitutionIn||player].filter(Boolean).join(' · ');
  if(type==='HALFTIME')return'INTERVALO';
  if(['FINAL','END'].includes(type))return'FIM DE JOGO';
  if(type==='MATCH_START_UNKNOWN')return'EM ANDAMENTO';
  return [event.icon||'',event.label||event.type||'',minute,player].filter(Boolean).join(' · ');
}
function publicKnockoutForMatch(match){
  const model=getKnockoutState().competitions?.[match.competitionId];
  if(!model)return null;
  for(const phase of model.phases||[]){
    for(const tie of phase.ties||[]){
      if(![tie.singleMatchId,tie.firstLegMatchId,tie.secondLegMatchId].includes(match.id))continue;
      if(phase.legMode!=='TWO_LEGS')return {legMode:'SINGLE',phase:phase.name||'',aggregate:null};
      const homeClub=club(tie.homeClubId,tie.homeClubName||'Mandante');
      const awayClub=club(tie.awayClubId,tie.awayClubName||'Visitante');
      return {
        legMode:'TWO_LEGS',phase:phase.name||'',
        tieHome:{id:tie.homeClubId,name:homeClub.shortName,crest:crest(homeClub)},
        tieAway:{id:tie.awayClubId,name:awayClub.shortName,crest:crest(awayClub)},
        firstLeg:{home:Number(tie.firstLegHomeScore)||0,away:Number(tie.firstLegAwayScore)||0,matchId:tie.firstLegMatchId||''},
        secondLeg:{home:Number(tie.secondLegHomeScore)||0,away:Number(tie.secondLegAwayScore)||0,matchId:tie.secondLegMatchId||''},
        aggregate:{home:Number(tie.aggregateHome)||0,away:Number(tie.aggregateAway)||0},
        penalties:(Number(tie.penaltiesHome)||Number(tie.penaltiesAway))?{home:Number(tie.penaltiesHome)||0,away:Number(tie.penaltiesAway)||0}:null,
        winnerClubId:tie.winnerClubId||''
      };
    }
  }
  return null;
}
function studioMatchPayload(match){const s=state(match),h=club(match.homeClubId,'Mandante'),a=club(match.awayClubId,'Visitante'),p=buildMatchPresentationPayload(match,s),c=findCompetitionByName(match.competition),latest=(s.events||[])[0],goalEvents=(s.events||[]).filter(e=>String(e.type||'').toUpperCase()==='GOAL').map(e=>({team:e.team==='AWAY'?'AWAY':'HOME',minute:Number.isFinite(Number(e.minute))?`${Number(e.minute)}'`:'',player:e.player||e.title||'Gol'})),eventHomeGoals=goalEvents.filter(g=>g.team==='HOME'),eventAwayGoals=goalEvents.filter(g=>g.team==='AWAY'),fallbackHomeGoals=(s.homeScorers||[]).map(scorerGoal).filter(Boolean),fallbackAwayGoals=(s.awayScorers||[]).map(scorerGoal).filter(Boolean);return{matchId:match.id,competition:c?.name||match.competition||'Competição',competitionShort:c?.abbreviation||short(match.competition),competitionPriority:Number(c?.priority)||999,...p,chronology:(s.events||[]).map(e=>({...e,teamName:e.team==='HOME'?h.shortName:e.team==='AWAY'?a.shortName:''})),isFinal:p.phase==='FINAL'||String(match.status||'').toUpperCase()==='FINAL'||Boolean(match.finishedAt),penaltiesHome:Number(s.penaltiesHome)||0,penaltiesAway:Number(s.penaltiesAway)||0,date:match.date||'',time:match.time||'',homeName:h.shortName,awayName:a.shortName,homeShort:h.abbreviation,awayShort:a.abbreviation,homeCrest:crest(h),awayCrest:crest(a),latestAction:latest?`${latest.icon||''} ${latest.label||latest.type||'INFORMAÇÃO'}${latest.player?` · ${latest.player}`:''}`.trim():'',
latestScoreboardAction:latest?compactScoreboardAction(latest):'',scorers:[...(s.homeScorers||[]),...(s.awayScorers||[])].join(' · '),goals:[...(s.homeScorers||[]),...(s.awayScorers||[])].map(text=>{const parts=String(text).trim().split(/\s+/);return{minute:parts.shift()||'',player:parts.join(' ')}}),homeGoals:eventHomeGoals.length?eventHomeGoals:fallbackHomeGoals,awayGoals:eventAwayGoals.length?eventAwayGoals:fallbackAwayGoals,roundId:match.roundId||'',round:match.round||'',knockout:publicKnockoutForMatch(match),lineups:s.lineups||{home:{coach:'',starters:[],bench:[]},away:{coach:'',starters:[],bench:[]}}};}
function eventAction(e={}){const type=String(e.type||'').toUpperCase();if(type==='START'||type==='MATCH_START'||type==='MATCH_START_UNKNOWN')return type==='MATCH_START_UNKNOWN'?'EM ANDAMENTO':'INÍCIO DE JOGO';if(type==='SECOND_HALF_START'||type==='SECOND_HALF'||type==='RESTART')return'INÍCIO DO 2º TEMPO';if(type==='HALFTIME')return'INTERVALO';if(type==='FINAL'||type==='END')return'FIM DE JOGO';if(type==='GOAL')return'GOL';if(type==='SUBSTITUTION')return'SUBSTITUIÇÃO';if(type==='INFO'&&e.details)return String(e.details).toUpperCase();return e.label||e.type||'INFORMAÇÃO';}
function eventMinute(e={}){const type=String(e.type||'').toUpperCase();if(['START','MATCH_START','MATCH_START_UNKNOWN','SECOND_HALF_START','SECOND_HALF','RESTART','HALFTIME','FINAL','END'].includes(type))return'';return Number.isFinite(Number(e.minute))?`${Number(e.minute)}'`:'';}
function isWhiteFeedEvent(e={}){const type=String(e.type||'').toUpperCase();return !['YELLOW_CARD','RED_CARD','SUBSTITUTION'].includes(type);}
function eventsPayload(matches){return matches.flatMap(match=>{const st=state(match),h=club(match.homeClubId,'Mandante'),a=club(match.awayClubId,'Visitante'),c=findCompetitionByName(match.competition);return(st.events||[]).filter(isWhiteFeedEvent).map(e=>({competitionShort:c?.abbreviation||c?.shortName||match.competitionShort||short(match.competition),action:eventAction(e),eventType:String(e.type||'').toUpperCase(),eventTeam:String(e.team||e.side||e.scoringTeam||'').toUpperCase()==='AWAY'?'AWAY':(String(e.team||e.side||e.scoringTeam||'').toUpperCase()==='HOME'?'HOME':''),details:e.details||'',homeName:h.shortName,awayName:a.shortName,homeScore:Number(st.homeScore)||0,awayScore:Number(st.awayScore)||0,result:`${h.shortName} ${st.homeScore} × ${st.awayScore} ${a.shortName}`,minute:eventMinute(e),author:String(e.type||'').toUpperCase()==='SUBSTITUTION'?[e.substitutionIn?`ENTRA ${e.substitutionIn}`:'',e.substitutionOut?`SAI ${e.substitutionOut}`:''].filter(Boolean).join(' · '):(e.player||e.author||''),createdAt:e.createdAt||''}))}).sort((x,y)=>String(y.createdAt).localeCompare(String(x.createdAt))).slice(0,8);}
function key(v=''){return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'competicao';}

function annotatedOperationalLineup(lineup={}){
 const current=Array.isArray(lineup.onField)&&lineup.onField.length?lineup.onField:(Array.isArray(lineup.starters)?lineup.starters:[]);
 const substitutions=Array.isArray(lineup.substitutions)?lineup.substitutions:[];
 const byIncoming=new Map(substitutions.map(item=>[String(item.in||'').trim(),String(item.out||'').trim()]).filter(([incoming])=>incoming));
 return current.slice(0,11).map(player=>{
   const value=String(player||'').trim(),outgoing=byIncoming.get(value);
   return outgoing?`${value} (${outgoing})`:value;
 });
}
function sidebarLowerPayload(items){const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})(),state=getSidebarLowerState(),byId=new Map(items.filter(item=>String(item.date||'')>=today).map(item=>[item.matchId,item]));return{intervalSeconds:state.intervalSeconds||10,cards:(state.items||[]).filter(item=>item.active!==false).map(item=>{const match=byId.get(item.matchId);if(!match)return null;if(item.type==='lineup'){const side=item.side==='away'?'away':'home';return{type:'lineup',matchId:match.matchId,side,teamName:side==='away'?match.awayName:match.homeName,teamShort:side==='away'?match.awayShort:match.homeShort,crest:side==='away'?match.awayCrest:match.homeCrest,starters:annotatedOperationalLineup(match.lineups?.[side]||{}),coach:match.lineups?.[side]?.coach||''};}return{type:'match',matchId:match.matchId,competition:match.competition,homeName:match.homeName,awayName:match.awayName,homeCrest:match.homeCrest,awayCrest:match.awayCrest,homeScore:match.homeScore,awayScore:match.awayScore,penaltiesHome:Number(match.penaltiesHome)||0,penaltiesAway:Number(match.penaltiesAway)||0,homeGoals:match.homeGoals||[],awayGoals:match.awayGoals||[],phase:match.phase,status:match.status,period:match.period,clock:match.clock,clockVisible:match.clockVisible,elapsedSeconds:match.elapsedSeconds,clockRunning:match.clockRunning,clockStartedAt:match.clockStartedAt,beforeKickoff:match.beforeKickoff,isFinal:match.isFinal===true,date:match.date,time:match.time};}).filter(Boolean)}}

function sidebarPayload(items){const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})();const ordered=[...items].sort((a,b)=>(a.competitionPriority||999)-(b.competitionPriority||999)||String(a.competition).localeCompare(String(b.competition)));const groups=[];for(const m of ordered){if(String(m.date||'')!==today)continue;let g=groups.find(x=>x.name===m.competition);if(!g){g={name:m.competition,abbreviation:m.competitionShort,items:[]};groups.push(g)}const visual=deriveVisualState(null,{phase:m.phase||m.period||m.status});const before=visual.beforeKickoff;const liveClock=shouldShowClock(visual)&&m.clockVisible!==false;g.items.push({matchId:m.matchId,phase:visual.phase,elapsedSeconds:Number(m.elapsedSeconds)||0,clockRunning:liveClock&&Boolean(m.clockRunning),clockStartedAt:liveClock?m.clockStartedAt||null:null,title:before?`${m.homeName} x ${m.awayName}`:`${m.homeName} ${m.homeScore} x ${m.awayScore} ${m.awayName}`,status:visual.status,clock:liveClock?m.clock:'',clockVisible:liveClock,period:visual.period,date:m.date,time:m.time,startTime:m.time,beforeKickoff:before,latestAction:before?'':m.latestAction});}
const comps=getCompetitions(),byName=new Map(comps.flatMap(c=>[[String(c.name).toLowerCase(),c],[String(c.shortName).toLowerCase(),c],[String(c.abbreviation).toLowerCase(),c]]));const matchPanels=groups.map(g=>{const c=byName.get(String(g.name).toLowerCase()),competitionId=c?.id||key(g.name);return{key:`matches:${competitionId}:`,competitionId,phaseId:'',title:g.name,type:'grouped-matches',groups:[g]}});const standingState=getStandingsState();const standingPanels=(standingState.publishedTableIds||standingState.publishedCompetitionIds||[]).map(id=>standingPanel(id)).filter(p=>p.items.length);const clubs=new Map(getClubs().map(c=>[c.id,c])),matchById=new Map(getMatches().map(m=>[m.id,m])),knockoutPanels=[];const todayKey=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})();const legText=(matchId,homeName,awayName,storedHome,storedAway)=>{const match=matchById.get(matchId);if(!match)return `${homeName} ${Number(storedHome)||0} x ${Number(storedAway)||0} ${awayName}`;const presentation=buildMatchPresentationPayload(match,state(match));if(presentation.beforeKickoff){if(String(match.date||'')===todayKey&&match.time)return `${match.time} · ${homeName} x ${awayName}`;if(match.date){const parts=String(match.date).split('-');return `${parts.length===3?`${parts[2]}/${parts[1]}`:match.date} · ${homeName} x ${awayName}`;}return `${homeName} x ${awayName}`;}return `${homeName} ${Number(presentation.homeScore)||0} x ${Number(presentation.awayScore)||0} ${awayName}`;};for(const [competitionId,model] of Object.entries(getKnockoutState().competitions||{})){const comp=comps.find(c=>c.id===competitionId)||{name:competitionId};for(const phase of model.phases||[]){if(!(phase.ties||[]).length)continue;knockoutPanels.push({key:`knockout:${competitionId}:${phase.id}`,competitionId,phaseId:phase.id,title:`CONFRONTOS · ${comp.shortName||comp.name}`,subtitle:`${phase.name}${phase.legMode==='TWO_LEGS'?' · IDA E VOLTA':''}`,type:'knockout',items:phase.ties.map(t=>{const home=clubs.get(t.homeClubId)?.shortName||t.homeClubName||'A definir',away=clubs.get(t.awayClubId)?.shortName||t.awayClubName||'A definir',twoLegs=phase.legMode==='TWO_LEGS';return{home,away,homeScore:twoLegs?(Number(t.aggregateHome)||0):(Number(t.homeScore)||0),awayScore:twoLegs?(Number(t.aggregateAway)||0):(Number(t.awayScore)||0),firstLeg:twoLegs?legText(t.firstLegMatchId,home,away,t.firstLegHomeScore,t.firstLegAwayScore):'',secondLeg:twoLegs?legText(t.secondLegMatchId,away,home,t.secondLegHomeScore,t.secondLegAwayScore):'',aggregate:twoLegs?`${Number(t.aggregateHome)||0} x ${Number(t.aggregateAway)||0}`:'',penalties:(Number(t.penaltiesHome)||Number(t.penaltiesAway))?`${Number(t.penaltiesHome)||0} x ${Number(t.penaltiesAway)||0}`:'',winner:clubs.get(t.winnerClubId)?.shortName||t.winnerClubName||'',notes:t.notes||'',status:({SCHEDULED:'PROGRAMADO',LIVE:'EM ANDAMENTO',FINISHED:'FINALIZADO',CONFIRMED:'CLASSIFICADO'})[t.status]||'PROGRAMADO'};} )});}}
const available=[...matchPanels,...standingPanels,...knockoutPanels],map=new Map(available.map(p=>[p.key,p]));for(const p of standingPanels)if(p.competitionId&&!map.has(`standings:${p.competitionId}:`))map.set(`standings:${p.competitionId}:`,p);const seq=getSidebarSequenceState();const panels=(seq.items||[]).filter(i=>i.active!==false).map(i=>map.get(`${i.type}:${i.competitionId}:${i.phaseId||''}`)).filter(Boolean);return{intervalSeconds:seq.intervalSeconds||12,panels,lower:sidebarLowerPayload(items)};}
async function command(body){return publishCommand(body);}
function isToday(match){const d=String(match.date||'');const now=new Date(),key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;return d===key;}
function summaryMatches(all,selected,settings){const selectedIds=new Set(selected.map(m=>m.id));const selectedRounds=new Set(selected.map(m=>String(m.roundId||'')).filter(Boolean));const explicitRound=String(settings.yellowTickerRoundId||'');let source=all;if(settings.yellowTickerScope==='SELECTED')source=all.filter(m=>selectedIds.has(m.id));else if(settings.yellowTickerScope==='ROUND')source=all.filter(m=>explicitRound?String(m.roundId||'')===explicitRound:selectedRounds.has(String(m.roundId||'')));else if(settings.yellowTickerScope==='BOTH')source=all.filter(m=>isToday(m)||(explicitRound?String(m.roundId||'')===explicitRound:selectedRounds.has(String(m.roundId||''))));else source=all.filter(isToday);return source.filter(m=>{const v=deriveVisualState(m,state(m));if(v.beforeKickoff)return settings.yellowTickerIncludeScheduled!==false;if(v.isFinal)return settings.yellowTickerIncludeFinal!==false;return settings.yellowTickerIncludeLive!==false;});}
const AUTO_SCOREBOARD_PHASES=new Set(['FIRST_HALF','LIVE_UNKNOWN','HALFTIME','SECOND_HALF','EXTRA_TIME','PENALTIES']);
function automaticScoreboardMatches(matches=[]){return matches.filter(match=>AUTO_SCOREBOARD_PHASES.has(deriveVisualState(match,state(match)).phase)).sort((a,b)=>String(a.startedAt||a.date||'').localeCompare(String(b.startedAt||b.date||''))||String(a.time||'').localeCompare(String(b.time||'')));}
let deferredSnapshotTimer=null;
function buildStudioCollections(){
  const matches=getMatches(),byId=new Map(matches.map(m=>[m.id,m]));
  const selected=getActiveScoreboardMatchIds().map(id=>byId.get(id)).filter(Boolean);
  const round=automaticScoreboardMatches(matches).map(studioMatchPayload);
  return {matches,selected,round};
}
export async function publishStudioLiveUpdate(){
  const {matches,round}=buildStudioCollections();
  return publishCommands([
    {type:'show',region:'round-scoreboard',payload:round},
    {type:'show',region:'live-events',payload:eventsPayload(matches)}
  ]);
}
export function scheduleStudioSnapshot(delayMs=2500){
  clearTimeout(deferredSnapshotTimer);
  deferredSnapshotTimer=setTimeout(()=>{publishStudioSnapshot().catch(error=>console.warn('Studio snapshot adiado falhou.',error));},Math.max(500,Number(delayMs)||2500));
}
export async function publishStudioSnapshot(){
  const {matches,selected,round}=buildStudioCollections();
  const all=matches.map(studioMatchPayload),settings=getOverlayControlState(),summary=summaryMatches(matches,selected,settings).map(studioMatchPayload).map(i=>({...i,mode:settings.yellowTickerMode==='POP'?'POP':'MARQUEE',speedSeconds:Math.min(120,Math.max(15,Number(settings.yellowTickerSpeed)||60))}));
  // Uma única viagem HTTP publica todas as regiões. O Bridge continua emitindo um envelope
  // por região para os clientes WebSocket, mas a Cabine não disputa conexões com 5 POSTs.
  return publishCommands([
    {type:'show',region:'round-scoreboard',payload:round},
    {type:'show',region:'live-events',payload:eventsPayload(matches)},
    {type:'show',region:'round-summary',payload:summary},
    {type:'show',region:'studio-sidebar',payload:sidebarPayload(all)},
    {type:'show',region:'public-match-data',payload:all}
  ]);
}
