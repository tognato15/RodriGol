import type { DomainEvent, Instant } from "@rodrigol/core";
import type { MatchId, PlayerId } from "../identity/index.js";
import type { MatchMinute, MatchPeriod, MatchStatus, Score, TeamSide } from "../match/index.js";
export type FootballMatchEventName = "football.match.created"|"football.match.started"|"football.match.period-changed"|"football.match.goal-registered"|"football.match.card-registered"|"football.match.substitution-registered"|"football.match.var-registered"|"football.match.status-changed"|"football.match.finished";
export interface FootballMatchEvent extends DomainEvent<MatchId> { readonly eventName: FootballMatchEventName; readonly occurredAt: Instant; readonly score?: Score; readonly side?: TeamSide; readonly playerId?: PlayerId; readonly relatedPlayerId?: PlayerId; readonly minute?: MatchMinute; readonly period?: MatchPeriod; readonly status?: MatchStatus; readonly details?: string; }
