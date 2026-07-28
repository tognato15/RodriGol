import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export class Formation extends ValueObject<string> {
  private constructor(value: string) { super(value); }
  public static create(value: string): Formation {
    const normalized = value.trim();
    if (!/^\d(?:-\d){2,4}$/.test(normalized)) throw new InvalidArgumentError("A formação deve usar o formato 4-3-3.", "INVALID_FORMATION");
    const total = normalized.split("-").map(Number).reduce((sum, item) => sum + item, 0);
    if (total !== 10) throw new InvalidArgumentError("A formação deve representar dez jogadores de linha.", "INVALID_FORMATION_TOTAL");
    return new Formation(normalized);
  }
  public override toString(): string { return this.value; }
}
