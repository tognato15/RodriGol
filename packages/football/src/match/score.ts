import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
import type { TeamSide } from "./team-side.js";
export interface ScoreValue { readonly home: number; readonly away: number; }
export class Score extends ValueObject<ScoreValue> {
  private constructor(value: ScoreValue) { super(value); }
  public static zero(): Score { return new Score({home:0, away:0}); }
  public static create(home: number, away: number): Score {
    if (![home,away].every(v => Number.isInteger(v) && v >= 0)) throw new InvalidArgumentError("O placar deve utilizar números inteiros não negativos.", "INVALID_SCORE");
    return new Score({home,away});
  }
  public goalFor(side: TeamSide): Score { return side === "home" ? Score.create(this.home + 1, this.away) : Score.create(this.home, this.away + 1); }
  public get home(): number { return this.value.home; }
  public get away(): number { return this.value.away; }
  public override toString(): string { return `${this.home} x ${this.away}`; }
}
