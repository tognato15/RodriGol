import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export interface MatchMinuteValue { readonly minute: number; readonly added: number; }
export class MatchMinute extends ValueObject<MatchMinuteValue> {
  private constructor(value: MatchMinuteValue) { super(value); }
  public static create(minute: number, added = 0): MatchMinute {
    if (!Number.isInteger(minute) || minute < 0 || minute > 130 || !Number.isInteger(added) || added < 0 || added > 30) throw new InvalidArgumentError("O minuto da partida é inválido.", "INVALID_MATCH_MINUTE");
    return new MatchMinute({ minute, added });
  }
  public get minute(): number { return this.value.minute; }
  public get added(): number { return this.value.added; }
  public override toString(): string { return this.added > 0 ? `${this.minute}+${this.added}'` : `${this.minute}'`; }
}
