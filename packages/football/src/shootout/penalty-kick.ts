import type { PlayerId } from "../identity/index.js"; import type { TeamSide } from "../match/team-side.js";
export type PenaltyKickOutcome="scored"|"missed"|"saved";
export interface PenaltyKick { readonly order:number; readonly side:TeamSide; readonly playerId:PlayerId; readonly outcome:PenaltyKickOutcome; }
