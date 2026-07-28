import { Entity, InvalidArgumentError, type Instant } from "@rodrigol/core";
import type { CompetitionId, SeasonId } from "../identity/index.js";
export class Season extends Entity<SeasonId> {
  private constructor(id: SeasonId, public readonly competitionId: CompetitionId, public readonly name: string, public readonly startsAt: Instant, public readonly endsAt: Instant) { super(id); }
  public static create(id: SeasonId, competitionId: CompetitionId, name: string, startsAt: Instant, endsAt: Instant): Season { if(!startsAt.isBefore(endsAt)) throw new InvalidArgumentError("A temporada deve terminar depois de começar.","INVALID_SEASON_RANGE"); return new Season(id,competitionId,name.trim(),startsAt,endsAt); }
}
