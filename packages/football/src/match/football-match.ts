import { AggregateRoot, type Clock, InvariantViolationError, type Instant } from "@rodrigol/core";
import type { MatchId, PlayerId, TeamId } from "../identity/index.js";
import type { FootballMatchEvent } from "../events/index.js";
import { MatchTimeline } from "../timeline/index.js";
import { MatchClock } from "./match-clock.js";
import type { MatchEventKind, MatchEventRecord } from "./match-event-record.js";
import { MatchMinute } from "./match-minute.js";
import type { MatchPeriod } from "./match-period.js";
import { MatchSettings } from "./match-settings.js";
import type { MatchStatus } from "./match-status.js";
import { Score } from "./score.js";
import type { TeamSide } from "./team-side.js";

export interface CreateFootballMatchProps { readonly id: MatchId; readonly homeTeamId: TeamId; readonly awayTeamId: TeamId; readonly scheduledAt: Instant; readonly clock: Clock; readonly settings?: MatchSettings; }
export class FootballMatch extends AggregateRoot<MatchId, FootballMatchEvent> {
  private matchStatus: MatchStatus = "scheduled";
  private matchScore = Score.zero();
  private readonly matchClock = new MatchClock();
  private readonly matchTimeline = new MatchTimeline();
  private readonly settings: MatchSettings;
  private constructor(id: MatchId, public readonly homeTeamId: TeamId, public readonly awayTeamId: TeamId, public readonly scheduledAt: Instant, private readonly systemClock: Clock, settings: MatchSettings) {
    super(id); this.settings = settings;
    if (homeTeamId.equals(awayTeamId)) throw new InvariantViolationError("Mandante e visitante devem ser equipes diferentes.", "MATCH_REQUIRES_DISTINCT_TEAMS");
    this.recordDomainEvent({eventName:"football.match.created",aggregateId:id,occurredAt:systemClock.now(),status:this.matchStatus,score:this.matchScore});
  }
  public static create(props: CreateFootballMatchProps): FootballMatch { return new FootballMatch(props.id,props.homeTeamId,props.awayTeamId,props.scheduledAt,props.clock,props.settings ?? MatchSettings.standard()); }
  public get status(): MatchStatus { return this.matchStatus; }
  public get score(): Score { return this.matchScore; }
  public get period(): MatchPeriod { return this.matchClock.period; }
  public get minute(): MatchMinute { return this.matchClock.minute; }
  public get timeline(): readonly MatchEventRecord[] { return this.matchTimeline.all; }
  public start(): void { this.requireStatus("scheduled"); this.matchStatus="live"; this.matchClock.setPeriod("first-half"); const now=this.systemClock.now(); this.recordDomainEvent({eventName:"football.match.started",aggregateId:this.id,occurredAt:now,status:this.matchStatus,period:this.period,score:this.score}); }
  public updateClock(minute: MatchMinute): void { this.requireLive(); this.matchClock.update(minute); }
  public beginHalfTime(): void { this.changePeriod("half-time"); }
  public beginSecondHalf(): void { this.changePeriod("second-half"); }
  public beginExtraTime(): void { if(!this.settings.value.allowsExtraTime) throw new InvariantViolationError("A partida não permite prorrogação.","EXTRA_TIME_NOT_ALLOWED"); this.changePeriod("extra-time-first-half"); }
  public beginExtraTimeBreak(): void { this.changePeriod("extra-time-break"); }
  public beginExtraTimeSecondHalf(): void { this.changePeriod("extra-time-second-half"); }
  public beginPenaltyShootout(): void { if(!this.settings.value.allowsPenaltyShootout) throw new InvariantViolationError("A partida não permite disputa por pênaltis.","PENALTY_SHOOTOUT_NOT_ALLOWED"); this.changePeriod("penalty-shootout"); }
  public registerGoal(side: TeamSide, playerId: PlayerId, minute: MatchMinute, kind: "goal"|"own-goal"|"penalty-goal" = "goal"): void { this.requireLive(); this.matchScore=this.matchScore.goalFor(kind === "own-goal" ? (side === "home" ? "away" : "home") : side); this.addTimeline({kind,side,playerId,minute,occurredAt:this.systemClock.now()}); this.recordDomainEvent({eventName:"football.match.goal-registered",aggregateId:this.id,occurredAt:this.systemClock.now(),side,playerId,minute,score:this.score}); }
  public registerMissedPenalty(side: TeamSide, playerId: PlayerId, minute: MatchMinute): void { this.registerSimple("missed-penalty",side,playerId,minute); }
  public registerCard(kind: "yellow-card"|"second-yellow-card"|"red-card", side: TeamSide, playerId: PlayerId, minute: MatchMinute): void { this.requireLive(); this.addTimeline({kind,side,playerId,minute,occurredAt:this.systemClock.now()}); this.recordDomainEvent({eventName:"football.match.card-registered",aggregateId:this.id,occurredAt:this.systemClock.now(),side,playerId,minute,details:kind}); }
  public registerSubstitution(side: TeamSide, playerOutId: PlayerId, playerInId: PlayerId, minute: MatchMinute): void { this.requireLive(); if(playerOutId.equals(playerInId)) throw new InvariantViolationError("A substituição exige jogadores diferentes.","INVALID_SUBSTITUTION"); this.addTimeline({kind:"substitution",side,playerId:playerOutId,relatedPlayerId:playerInId,minute,occurredAt:this.systemClock.now()}); this.recordDomainEvent({eventName:"football.match.substitution-registered",aggregateId:this.id,occurredAt:this.systemClock.now(),side,playerId:playerOutId,relatedPlayerId:playerInId,minute}); }
  public registerVar(details: string, minute: MatchMinute): void { this.requireLive(); const normalized=details.trim(); if(!normalized) throw new InvariantViolationError("O evento de VAR deve possuir detalhes.","VAR_DETAILS_REQUIRED"); this.addTimeline({kind:"var",minute,occurredAt:this.systemClock.now(),details:normalized}); this.recordDomainEvent({eventName:"football.match.var-registered",aggregateId:this.id,occurredAt:this.systemClock.now(),minute,details:normalized}); }
  public suspend(details?: string): void { this.changeStatus("suspended",details); }
  public resume(): void { this.requireStatus("suspended"); this.changeStatus("live"); }
  public postpone(details?: string): void { this.requireStatus("scheduled"); this.changeStatus("postponed",details); }
  public cancel(details?: string): void { if(this.matchStatus === "finished") throw new InvariantViolationError("Uma partida encerrada não pode ser cancelada.","FINISHED_MATCH_CANNOT_BE_CANCELLED"); this.changeStatus("cancelled",details); }
  public abandon(details?: string): void { this.requireLive(); this.changeStatus("abandoned",details); }
  public finish(): void { this.requireLive(); this.matchStatus="finished"; this.matchClock.setPeriod("ended"); this.recordDomainEvent({eventName:"football.match.finished",aggregateId:this.id,occurredAt:this.systemClock.now(),status:this.status,period:this.period,score:this.score}); }
  private changePeriod(period: MatchPeriod): void { this.requireLive(); this.matchClock.setPeriod(period); this.recordDomainEvent({eventName:"football.match.period-changed",aggregateId:this.id,occurredAt:this.systemClock.now(),period}); }
  private changeStatus(status: MatchStatus, details?: string): void { this.matchStatus=status; const event: FootballMatchEvent = {eventName:"football.match.status-changed",aggregateId:this.id,occurredAt:this.systemClock.now(),status,...(details === undefined ? {} : {details})}; this.recordDomainEvent(event); }
  private requireStatus(status: MatchStatus): void { if(this.matchStatus !== status) throw new InvariantViolationError(`A operação exige status ${status}.`,"INVALID_MATCH_STATUS"); }
  private requireLive(): void { this.requireStatus("live"); }
  private registerSimple(kind: MatchEventKind, side: TeamSide, playerId: PlayerId, minute: MatchMinute): void { this.requireLive(); this.addTimeline({kind,side,playerId,minute,occurredAt:this.systemClock.now()}); }
  private addTimeline(entry: MatchEventRecord): void { this.matchTimeline.add(entry); }
}
