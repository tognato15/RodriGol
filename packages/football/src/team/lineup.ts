import { InvariantViolationError } from "@rodrigol/core";
import type { PlayerId } from "../identity/index.js";
import { Formation } from "./formation.js";
export interface LineupProps { readonly starters: readonly PlayerId[]; readonly substitutes: readonly PlayerId[]; readonly captainId: PlayerId; readonly goalkeeperId: PlayerId; readonly formation: Formation; }
export class Lineup {
  private constructor(private readonly props: LineupProps) {}
  public static create(props: LineupProps): Lineup {
    if (props.starters.length !== 11) throw new InvariantViolationError("A escalação titular deve possuir 11 jogadores.", "LINEUP_REQUIRES_ELEVEN_STARTERS");
    const all = [...props.starters, ...props.substitutes].map(id => id.toString());
    if (new Set(all).size !== all.length) throw new InvariantViolationError("Um jogador não pode aparecer duas vezes na relação.", "DUPLICATE_PLAYER_IN_LINEUP");
    if (!props.starters.some(id => id.equals(props.captainId))) throw new InvariantViolationError("O capitão deve ser titular.", "CAPTAIN_MUST_START");
    if (!props.starters.some(id => id.equals(props.goalkeeperId))) throw new InvariantViolationError("O goleiro deve ser titular.", "GOALKEEPER_MUST_START");
    return new Lineup({ ...props, starters:[...props.starters], substitutes:[...props.substitutes] });
  }
  public get starters(): readonly PlayerId[] { return [...this.props.starters]; }
  public get substitutes(): readonly PlayerId[] { return [...this.props.substitutes]; }
  public get captainId(): PlayerId { return this.props.captainId; }
  public get goalkeeperId(): PlayerId { return this.props.goalkeeperId; }
  public get formation(): Formation { return this.props.formation; }
  public contains(id: PlayerId): boolean { return [...this.props.starters,...this.props.substitutes].some(item=>item.equals(id)); }
}
