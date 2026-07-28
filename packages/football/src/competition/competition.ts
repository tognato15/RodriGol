import { Entity, InvalidArgumentError } from "@rodrigol/core";
import type { CompetitionId } from "../identity/index.js";
export type CompetitionFormat = "league"|"knockout"|"group-and-knockout"|"friendly";
export class Competition extends Entity<CompetitionId> {
  private constructor(id: CompetitionId, public readonly name: string, public readonly format: CompetitionFormat) { super(id); }
  public static create(id: CompetitionId, name: string, format: CompetitionFormat): Competition { const normalized=name.trim(); if(normalized.length<2) throw new InvalidArgumentError("O nome da competição é inválido.","INVALID_COMPETITION_NAME"); return new Competition(id,normalized,format); }
}
