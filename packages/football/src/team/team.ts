import { Entity, InvariantViolationError } from "@rodrigol/core";
import type { TeamId, PlayerId } from "../identity/index.js";
import type { Player } from "./player.js";
import { TeamName } from "./team-name.js";
export class Team extends Entity<TeamId> {
  private readonly playersById = new Map<string, Player>();
  private constructor(id: TeamId, private readonly teamName: TeamName) { super(id); }
  public static create(id: TeamId, name: TeamName): Team { return new Team(id, name); }
  public get name(): TeamName { return this.teamName; }
  public addPlayer(player: Player): void {
    const key = player.id.toString();
    if (this.playersById.has(key)) throw new InvariantViolationError("O jogador já pertence à equipe.", "PLAYER_ALREADY_IN_TEAM");
    for (const existing of this.playersById.values()) if (existing.shirtNumber.equals(player.shirtNumber)) throw new InvariantViolationError("O número da camisa já está em uso.", "SHIRT_NUMBER_ALREADY_IN_USE");
    this.playersById.set(key, player);
  }
  public findPlayer(id: PlayerId): Player | undefined { return this.playersById.get(id.toString()); }
  public get players(): readonly Player[] { return [...this.playersById.values()]; }
}
