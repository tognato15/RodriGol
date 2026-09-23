import {
  getMatch,
  getMatches,
  upsertMatch,
  readCoverage,
  saveCoverage,
  archiveCoverage,
  getClub,
  getCompetitionKnockout,
  saveCompetitionKnockout
} from './data-store.js';
import { getEffectiveElapsedSeconds } from './match-presentation.js';
import { recalculateAutomaticStandingsForMatch } from './standings-engine.js';

export const FINAL_PHASES = new Set(['FINAL','FINISHED','CONFIRMED','ARCHIVED']);
export const LIVE_PHASES = new Set(['FIRST_HALF','LIVE_UNKNOWN','HALFTIME','SECOND_HALF','EXTRA_TIME','EXTRA_TIME_FIRST_HALF','EXTRA_TIME_HALFTIME','EXTRA_TIME_SECOND_HALF','PENALTIES','Q1','Q2','Q3','Q4','OVERTIME','P1','P2','P3','SET_1','SET_2','SET_3','SET_4','SET_5','SET_6','SET_7','INNING_1','INNING_2','INNING_3','INNING_4','INNING_5','INNING_6','INNING_7','INNING_8','INNING_9','INNINGS_1','INNINGS_2','ROUND_1','ROUND_2','ROUND_3','ROUND_4','ROUND_5','ROUND_6','ROUND_7','ROUND_8','ROUND_9','ROUND_10','ROUND_11','ROUND_12','BOUT']);

export function canonicalStatus(phase='SCHEDULED') {
  const value=String(phase||'SCHEDULED').toUpperCase();
  if(FINAL_PHASES.has(value)) return value==='ARCHIVED'?'ARCHIVED':'FINAL';
  if(LIVE_PHASES.has(value)) return value;
  return value==='PRE_GAME'?'PRE_GAME':'SCHEDULED';
}


function tieAggregateFromLinkedMatches(tie={}) {
  const tieHomeId=String(tie.homeClubId||tie.homeId||''),tieAwayId=String(tie.awayClubId||tie.awayId||'');
  const totals={home:0,away:0};
  for(const matchId of [tie.firstLegMatchId,tie.secondLegMatchId].filter(Boolean)){
    const linked=getMatch(matchId); if(!linked) continue;
    const coverage=readCoverage(matchId,{homeScore:Number(linked.homeScore)||0,awayScore:Number(linked.awayScore)||0})||{};
    const homeScore=Number(coverage.homeScore??linked.homeScore)||0,awayScore=Number(coverage.awayScore??linked.awayScore)||0;
    if(String(linked.homeClubId||'')===tieHomeId)totals.home+=homeScore;
    else if(String(linked.homeClubId||'')===tieAwayId)totals.away+=homeScore;
    if(String(linked.awayClubId||'')===tieHomeId)totals.home+=awayScore;
    else if(String(linked.awayClubId||'')===tieAwayId)totals.away+=awayScore;
  }
  return totals;
}

export function syncMatchFromCoverage(matchId, coveragePatch={}, options={}) {
  const match=getMatch(matchId); if(!match) return null;
  const current=readCoverage(matchId,{homeScore:Number(match.homeScore)||0,awayScore:Number(match.awayScore)||0,phase:match.status||'SCHEDULED',events:[]})||{};
  const now=new Date().toISOString();
  const coverage={...current,...coveragePatch,updatedAt:now};
  const status=canonicalStatus(coverage.phase||match.status);
  const next={...match,status,homeScore:Number(coverage.homeScore)||0,awayScore:Number(coverage.awayScore)||0,updatedAt:now};
  if(LIVE_PHASES.has(status)&&!next.startedAt) next.startedAt=now;
  if(status==='HALFTIME'&&!next.halftimeAt) next.halftimeAt=now;
  if(status==='FINAL'&&!next.finishedAt) next.finishedAt=now;
  if(options.confirmed) next.confirmedAt=now;
  if(options.archived) next.archivedAt=now;
  saveCoverage(matchId,coverage); upsertMatch(next);
  if(status==='FINAL'){ syncKnockoutForMatch(next,coverage); recalculateAutomaticStandingsForMatch(next); }
  return {match:next,coverage};
}

export function transitionMatch(matchId, phase, patch={}) {
  const current=readCoverage(matchId,{homeScore:0,awayScore:0,events:[]})||{};
  const elapsedSeconds=getEffectiveElapsedSeconds(current);
  const stop=['HALFTIME','EXTRA_TIME_HALFTIME','FINAL','LIVE_UNKNOWN','PENALTIES'].includes(phase);
  return syncMatchFromCoverage(matchId,{...current,...patch,phase,elapsedSeconds:stop?elapsedSeconds:(patch.elapsedSeconds??current.elapsedSeconds??0),clockRunning:stop?false:Boolean(patch.clockRunning??current.clockRunning),clockStartedAt:stop?null:(patch.clockStartedAt??current.clockStartedAt)});
}

export function finishMatch(matchId, patch={}) {
  const match=getMatch(matchId); if(!match) return null;
  const current=readCoverage(matchId,{homeScore:Number(match.homeScore)||0,awayScore:Number(match.awayScore)||0,events:[]})||{};
  const elapsedSeconds=getEffectiveElapsedSeconds(current);
  const result=syncMatchFromCoverage(matchId,{...current,...patch,phase:'FINAL',elapsedSeconds,clockRunning:false,clockStartedAt:null},{confirmed:true});
  if(!result) return null;
  const home=getClub(result.match.homeClubId)||{}; const away=getClub(result.match.awayClubId)||{};
  archiveCoverage({matchId,match:{...result.match},home,away,coverage:{...result.coverage},finalScore:`${result.coverage.homeScore||0} × ${result.coverage.awayScore||0}`,reason:'Resultado consolidado automaticamente',archiveStatus:'FINAL',archivedAt:new Date().toISOString()});
  return result;
}

export function archiveMatch(matchId) {
  const result=syncMatchFromCoverage(matchId,{phase:'FINAL'},{confirmed:true,archived:true});
  return result?.match||null;
}

function syncKnockoutForMatch(match,coverage){
  if(!match.competitionId) return;
  const model=getCompetitionKnockout(match.competitionId); let changed=false;
  for(const phase of model.phases||[]) for(const tie of phase.ties||[]){
    const fields=['singleMatchId','firstLegMatchId','secondLegMatchId'];
    if(!fields.some(field=>tie[field]===match.id)) continue;
    const h=Number(coverage.homeScore)||0,a=Number(coverage.awayScore)||0;
    if(tie.singleMatchId===match.id){tie.homeScore=h;tie.awayScore=a;}
    if(tie.firstLegMatchId===match.id){tie.firstLegHomeScore=h;tie.firstLegAwayScore=a;}
    if(tie.secondLegMatchId===match.id){tie.secondLegHomeScore=h;tie.secondLegAwayScore=a;}
    const aggregate=tieAggregateFromLinkedMatches(tie);
    tie.aggregateHome=aggregate.home;
    tie.aggregateAway=aggregate.away;
    const twoLegs=phase.legMode==='TWO_LEGS';
    const matchFinished=id=>{if(!id)return false;const linked=getMatch(id);return linked&&FINAL_PHASES.has(String(linked.status||'').toUpperCase());};
    const tieComplete=twoLegs?Boolean(tie.firstLegMatchId&&tie.secondLegMatchId&&matchFinished(tie.firstLegMatchId)&&matchFinished(tie.secondLegMatchId)):Boolean(tie.singleMatchId&&matchFinished(tie.singleMatchId));
    if(!tieComplete){tie.winnerClubId='';tie.winnerClubName='';tie.status='LIVE';changed=true;continue;}
    const scoreHome=twoLegs?tie.aggregateHome:Number(tie.homeScore)||0;
    const scoreAway=twoLegs?tie.aggregateAway:Number(tie.awayScore)||0;
    const penaltiesHome=Number(tie.penaltiesHome)||Number(coverage.penaltiesHome)||0;
    const penaltiesAway=Number(tie.penaltiesAway)||Number(coverage.penaltiesAway)||0;
    if(scoreHome!==scoreAway||penaltiesHome!==penaltiesAway){
      const homeWins=scoreHome!==scoreAway?scoreHome>scoreAway:penaltiesHome>penaltiesAway;
      tie.penaltiesHome=penaltiesHome;tie.penaltiesAway=penaltiesAway;
      tie.winnerClubId=homeWins?tie.homeClubId:tie.awayClubId;
      tie.winnerClubName=homeWins?tie.homeClubName:tie.awayClubName;
      tie.status='CONFIRMED';
    }else{
      tie.winnerClubId=''; tie.winnerClubName=''; tie.status='FINISHED';
    }
    changed=true;
  }
  if(changed) saveCompetitionKnockout(match.competitionId,model);
}

export function migrateMatchLifecycle(){
  let changed=0;
  for(const match of getMatches()){
    const coverage=readCoverage(match.id,{phase:match.status||'SCHEDULED',homeScore:match.homeScore||0,awayScore:match.awayScore||0})||{};
    const status=canonicalStatus(coverage.phase||match.status);
    const next={...match,status,homeScore:Number(coverage.homeScore)||0,awayScore:Number(coverage.awayScore)||0};
    if(JSON.stringify(next)!==JSON.stringify(match)){upsertMatch(next);changed++;}
  }
  return changed;
}
