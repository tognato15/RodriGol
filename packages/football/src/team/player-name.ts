import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export class PlayerName extends ValueObject<string> {
  private constructor(value: string) { super(value); }
  public static create(value: string): PlayerName {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 100) throw new InvalidArgumentError("O nome do jogador deve ter entre 2 e 100 caracteres.", "INVALID_PLAYER_NAME");
    return new PlayerName(normalized);
  }
  public override toString(): string { return this.value; }
}
