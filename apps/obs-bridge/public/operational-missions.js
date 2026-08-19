import {
  getMatches,getCompetitions,getRounds,getClubs,getTickerState,getStandingsState,
  getCompetitionKnockout,getActiveJourney,getJourneyMatches,getOnAirMatchId,
  getHistoryEntry,readCoverage
} from './data-store.js';
import {deriveVisualState,getEffectiveElapsedSeconds,shouldShowClock} from './match-presentation.js';

const FINAL=new Set(['FINAL','FINISHED','CONFIRMED','ARCHIVED']);
const LIVE=new Set(['FIRST_HALF','SECOND_HALF','EXTRA_TIME','PENALTIES','LIVE_UNKNOWN']);
const nowIso=()=>new Date().toISOString();
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const norm=v=>String(v||'').trim().toUpperCase();

export function collectOperationalSnapshot(){
  const matches=getMatches(), competitions=new Map(getCompetitions().map(x=>[x.id,x])), rounds=new Map(getRounds().map(x=>[x.id,x])), clubs=new Map(getClubs().map(x=>[x.id,x]));
  const activeJourney=getActiveJourney(), journeyIds=new Set(getJourneyMatches(activeJourney).map(x=>x.id)), onAirId=getOnAirMatchId();
  const rows=matches.map(match=>{
    const coverage=readCoverage(match.id,{phase:match.status||'SCHEDULED',homeScore:match.homeScore||0,awayScore:match.awayScore||0,events:[]})||{};
    const visual=deriveVisualState(match,coverage), phase=norm(visual.phase||coverage.phase||match.status||'SCHEDULED');
    const elapsed=getEffectiveElapsedSeconds(coverage), clockVisible=shouldShowClock(visual), final=FINAL.has(phase)||Boolean(match.archivedAt);
    return {match,coverage,visual,phase,elapsed,clockVisible,final,
      competition:competitions.get(match.competitionId),round:rounds.get(match.roundId),
      home:clubs.get(match.homeClubId),away:clubs.get(match.awayClubId),
      inJourney:journeyIds.has(match.id),onAir:match.id===onAirId};
  });
  return {rows,activeJourney,onAirId,generatedAt:nowIso()};
}

function mission(id,severity,title,detail,href,actionLabel='Abrir',kind='OPERATION',matchId=''){
  return {id,severity,title,detail,href,actionLabel,kind,matchId};
}

export function collectOperationalMissions(){
  const {rows,activeJourney}=collectOperationalSnapshot(), missions=[], now=Date.now(), today=todayKey();
  for(const row of rows){
    const {match,coverage,phase,clockVisible,final,onAir,home,away}=row;
    const label=`${home?.shortName||'Mandante'} × ${away?.shortName||'Visitante'}`;
    const href=`/control/?matchId=${encodeURIComponent(match.id)}`;
    const updatedAt=new Date(coverage.updatedAt||coverage.clockStartedAt||0).getTime();
    const latest=[...(coverage.events||[])].sort((a,b)=>String(b.createdAt||b.updatedAt||'').localeCompare(String(a.createdAt||a.updatedAt||'')))[0];
    if(clockVisible&&!coverage.clockRunning) missions.push(mission(`clock-paused-${match.id}`,'critical',`${label}: relógio pausado`,`A partida está em ${row.visual.period||phase}, mas o relógio não está rodando.`,href,'Abrir Cabine','CLOCK',match.id));
    if(clockVisible&&coverage.clockRunning&&updatedAt&&now-updatedAt>120000) missions.push(mission(`clock-stale-${match.id}`,'high',`${label}: relógio sem sincronização`,`A última âncora do relógio tem mais de 2 minutos.`,href,'Verificar','CLOCK',match.id));
    if(final&&!getHistoryEntry(match.id)) missions.push(mission(`history-${match.id}`,'medium',`${label}: arquivamento pendente`,'A partida foi finalizada, mas ainda não possui registro no Histórico.',`/control/archive.html?matchId=${encodeURIComponent(match.id)}`,'Revisar','ARCHIVE',match.id));
    if(final&&(Number(match.homeScore)!==Number(coverage.homeScore)||Number(match.awayScore)!==Number(coverage.awayScore))) missions.push(mission(`score-${match.id}`,'critical',`${label}: placar divergente`,`Partida oficial ${Number(match.homeScore)||0} × ${Number(match.awayScore)||0}; cobertura ${Number(coverage.homeScore)||0} × ${Number(coverage.awayScore)||0}.`,`/control/diagnostics.html?matchId=${encodeURIComponent(match.id)}`,'Diagnosticar','DATA',match.id));
    if(LIVE.has(phase)&&!onAir&&latest&&['GOAL','RED_CARD','VAR'].includes(norm(latest.type))){const age=now-new Date(latest.createdAt||latest.updatedAt||0).getTime();if(age>=0&&age<=180000)missions.push(mission(`event-${match.id}-${latest.id||latest.createdAt}`,'high',`${label}: ${latest.label||latest.type||'evento recente'}`,`Evento registrado há ${Math.max(0,Math.round(age/1000))} s. A partida não está no ar.`,href,'Colocar no ar','EVENT',match.id));}
    if(match.date===today&&phase==='SCHEDULED'&&match.time){const start=new Date(`${match.date}T${match.time}:00`).getTime(),min=Math.round((start-now)/60000);if(min>=0&&min<=30)missions.push(mission(`start-${match.id}`,'medium',`${label} começa em ${min} min`,'A cobertura ainda não foi preparada.',href,'Preparar','SCHEDULE',match.id));}
  }
  if(!activeJourney) missions.push(mission('journey-missing','low','Nenhuma jornada ativa','A Central está operando com todas as partidas. Ative uma jornada para reduzir o escopo.', '/control/agenda.html','Abrir Agenda','AGENDA'));
  const ticker=getTickerState(); if(!(ticker.items||[]).some(x=>x.active!==false)) missions.push(mission('highlight-empty','low','Nenhum destaque editorial no ar','O rodapé editorial está sem manchete ativa.','/control/ticker.html','Adicionar destaque','EDITORIAL'));
  const standings=getStandingsState(); const auto=Object.values(standings.tableMeta||{}).filter(x=>x.calculationMode==='AUTO').length; if(!auto) missions.push(mission('standings-auto','low','Nenhuma classificação automática configurada','As tabelas não serão recalculadas automaticamente ao finalizar jogos.','/control/standings.html','Revisar tabelas','STANDINGS'));
  const weight={critical:0,high:1,medium:2,low:3};
  return missions.sort((a,b)=>weight[a.severity]-weight[b.severity]||a.title.localeCompare(b.title));
}

export function summarizeOperationalState(){
  const {rows,activeJourney}=collectOperationalSnapshot(), missions=collectOperationalMissions();
  return {live:rows.filter(r=>LIVE.has(r.phase)).length,halftime:rows.filter(r=>r.phase==='HALFTIME').length,scheduledToday:rows.filter(r=>r.match.date===todayKey()&&['SCHEDULED','PRE_GAME'].includes(r.phase)).length,finalToday:rows.filter(r=>r.match.date===todayKey()&&r.final).length,onAir:rows.filter(r=>r.onAir).length,missions:missions.length,critical:missions.filter(m=>m.severity==='critical').length,high:missions.filter(m=>m.severity==='high').length,journey:activeJourney?.name||'Operação geral'};
}
