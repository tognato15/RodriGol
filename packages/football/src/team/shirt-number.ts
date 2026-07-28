import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export class ShirtNumber extends ValueObject<number> {
  private constructor(value: number) { super(value); }
  public static create(value: number): ShirtNumber {
    if (!Number.isInteger(value) || value < 1 || value > 99) throw new InvalidArgumentError("O número da camisa deve ser um inteiro entre 1 e 99.", "INVALID_SHIRT_NUMBER");
    return new ShirtNumber(value);
  }
}
