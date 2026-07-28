import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export class TeamName extends ValueObject<string> {
  private constructor(value: string) { super(value); }
  public static create(value: string): TeamName {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 80) throw new InvalidArgumentError("O nome da equipe deve ter entre 2 e 80 caracteres.", "INVALID_TEAM_NAME");
    return new TeamName(normalized);
  }
  public override toString(): string { return this.value; }
}
