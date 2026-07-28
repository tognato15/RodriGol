import { Entity } from "@rodrigol/core";
import type { PlayerId } from "../identity/index.js";
import { PlayerName } from "./player-name.js";
import { ShirtNumber } from "./shirt-number.js";
import type { PlayerPosition } from "./player-position.js";
export interface PlayerProps { readonly name: PlayerName; readonly shirtNumber: ShirtNumber; readonly position: PlayerPosition; }
export class Player extends Entity<PlayerId> {
  private constructor(id: PlayerId, private readonly props: PlayerProps) { super(id); }
  public static create(id: PlayerId, props: PlayerProps): Player { return new Player(id, props); }
  public get name(): PlayerName { return this.props.name; }
  public get shirtNumber(): ShirtNumber { return this.props.shirtNumber; }
  public get position(): PlayerPosition { return this.props.position; }
}
