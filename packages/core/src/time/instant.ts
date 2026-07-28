import { InvalidArgumentError } from "../errors/index.js";
import { ValueObject } from "../value-object/index.js";
import { Duration } from "./duration.js";

export class Instant extends ValueObject<number> {
  private constructor(epochMilliseconds: number) {
    super(epochMilliseconds);
  }

  public static fromEpochMilliseconds(
    epochMilliseconds: number,
  ): Instant {
    this.validateEpochMilliseconds(epochMilliseconds);

    return new Instant(epochMilliseconds);
  }

  public static fromDate(date: Date): Instant {
    return this.fromEpochMilliseconds(date.getTime());
  }

  public static parse(isoDate: string): Instant {
    const normalizedDate = isoDate.trim();
    const epochMilliseconds = Date.parse(normalizedDate);

    if (
      normalizedDate.length === 0
      || Number.isNaN(epochMilliseconds)
    ) {
      throw new InvalidArgumentError(
        "A data informada não possui um formato válido.",
        "INVALID_INSTANT_FORMAT",
      );
    }

    return this.fromEpochMilliseconds(epochMilliseconds);
  }

  private static validateEpochMilliseconds(
    epochMilliseconds: number,
  ): void {
    if (!Number.isFinite(epochMilliseconds)) {
      throw new InvalidArgumentError(
        "O instante deve ser um número finito.",
        "INVALID_INSTANT",
      );
    }

    if (!Number.isInteger(epochMilliseconds)) {
      throw new InvalidArgumentError(
        "O instante deve utilizar milissegundos inteiros.",
        "NON_INTEGER_INSTANT",
      );
    }
  }

  public get epochMilliseconds(): number {
    return this.value;
  }

  public toDate(): Date {
    return new Date(this.epochMilliseconds);
  }

  public toISOString(): string {
    return this.toDate().toISOString();
  }

  public add(duration: Duration): Instant {
    return Instant.fromEpochMilliseconds(
      this.epochMilliseconds + duration.milliseconds,
    );
  }

  public subtract(duration: Duration): Instant {
    return Instant.fromEpochMilliseconds(
      this.epochMilliseconds - duration.milliseconds,
    );
  }

  public durationSince(earlierInstant: Instant): Duration {
    const difference =
      this.epochMilliseconds
      - earlierInstant.epochMilliseconds;

    if (difference < 0) {
      throw new InvalidArgumentError(
        "O instante anterior não pode ocorrer depois do instante atual.",
        "INVALID_INSTANT_ORDER",
      );
    }

    return Duration.fromMilliseconds(difference);
  }

  public isBefore(other: Instant): boolean {
    return this.epochMilliseconds
      < other.epochMilliseconds;
  }

  public isAfter(other: Instant): boolean {
    return this.epochMilliseconds
      > other.epochMilliseconds;
  }

  public override toString(): string {
    return this.toISOString();
  }
}