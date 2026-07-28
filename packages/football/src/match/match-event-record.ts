import type { Instant } from "@rodrigol/core";
import type { PlayerId } from "../identity/index.js";
import type { MatchMinute } from "./match-minute.js";
import type { TeamSide } from "./team-side.js";
export type MatchEventKind = "goal"|"own-goal"|"penalty-goal"|"missed-penalty"|"yellow-card"|"second-yellow-card"|"red-card"|"substitution"|"var"|"information";
export interface MatchEventRecord {
  readonly kind: MatchEventKind;
  readonly side?: TeamSide;
  readonly playerId?: PlayerId;
  readonly relatedPlayerId?: PlayerId;
  readonly minute: MatchMinute;
  readonly occurredAt: Instant;
  readonly details?: string;
}
