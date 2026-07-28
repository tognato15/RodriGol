import { EntityId, type IdentityGenerator } from "@rodrigol/core";
function idFactory<TTag extends string>() { return { create(generator?: IdentityGenerator): EntityId<TTag> { return EntityId.create<TTag>(generator); }, from(value: string): EntityId<TTag> { return EntityId.from<TTag>(value); } }; }
export type MatchId = EntityId<"FootballMatch">; export const MatchId = idFactory<"FootballMatch">();
export type TeamId = EntityId<"FootballTeam">; export const TeamId = idFactory<"FootballTeam">();
export type PlayerId = EntityId<"FootballPlayer">; export const PlayerId = idFactory<"FootballPlayer">();
export type StaffMemberId = EntityId<"FootballStaffMember">; export const StaffMemberId = idFactory<"FootballStaffMember">();
export type CompetitionId = EntityId<"FootballCompetition">; export const CompetitionId = idFactory<"FootballCompetition">();
export type SeasonId = EntityId<"FootballSeason">; export const SeasonId = idFactory<"FootballSeason">();
export type StageId = EntityId<"FootballStage">; export const StageId = idFactory<"FootballStage">();
export type RoundId = EntityId<"FootballRound">; export const RoundId = idFactory<"FootballRound">();
export type GroupId = EntityId<"FootballGroup">; export const GroupId = idFactory<"FootballGroup">();
