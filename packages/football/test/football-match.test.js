import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FixedClock, Instant } from "@rodrigol/core";
import { FootballMatch, MatchId, MatchMinute, PlayerId, TeamId } from "../dist/index.js";
class FixedGenerator { constructor(value){this.value=value;} generate(){return this.value;} }
const id=(factory,value)=>factory.create(new FixedGenerator(value));
function createMatch(){ const clock=FixedClock.at(Instant.parse("2026-07-19T19:00:00.000Z")); return {clock,match:FootballMatch.create({id:id(MatchId,"match-1"),homeTeamId:id(TeamId,"home"),awayTeamId:id(TeamId,"away"),scheduledAt:clock.now(),clock})}; }
describe("FootballMatch",()=>{
  it("executa o fluxo principal da partida",()=>{ const {match}=createMatch(); match.start(); match.updateClock(MatchMinute.create(12)); match.registerGoal("home",id(PlayerId,"p1"),MatchMinute.create(12)); match.registerCard("yellow-card","away",id(PlayerId,"p2"),MatchMinute.create(18)); match.beginHalfTime(); match.beginSecondHalf(); match.updateClock(MatchMinute.create(57)); match.registerSubstitution("away",id(PlayerId,"p2"),id(PlayerId,"p3"),MatchMinute.create(57)); match.finish(); assert.equal(match.status,"finished"); assert.equal(match.score.toString(),"1 x 0"); assert.equal(match.timeline.length,3); assert.equal(match.period,"ended"); });
  it("impede gol antes do início",()=>{ const {match}=createMatch(); assert.throws(()=>match.registerGoal("home",id(PlayerId,"p1"),MatchMinute.create(1)),error=>error.code==="INVALID_MATCH_STATUS"); });
  it("registra eventos de domínio para integração",()=>{ const {match}=createMatch(); match.start(); match.registerGoal("away",id(PlayerId,"p9"),MatchMinute.create(5)); const events=match.pullDomainEvents(); assert.equal(events.some(event=>event.eventName==="football.match.created"),true); assert.equal(events.some(event=>event.eventName==="football.match.goal-registered"),true); });
});
