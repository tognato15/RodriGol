import { InvalidArgumentError } from "../errors/index.js";
import { ValueObject } from "../value-object/index.js";

export class Duration extends ValueObject<number> {
  private constructor(milliseconds: number) {
    super(milliseconds);
  }

  public static zero(): Duration {
    return new Duration(0);
  }

  public static fromMilliseconds(
    milliseconds: number,
  ): Duration {
    this.validate(milliseconds);

    return new Duration(milliseconds);
  }

  public static fromSeconds(seconds: number): Duration {
    return this.fromMilliseconds(seconds * 1_000);
  }

  public static fromMinutes(minutes: number): Duration {
    return this.fromSeconds(minutes * 60);
  }

  public static fromHours(hours: number): Duration {
    return this.fromMinutes(hours * 60);
  }

  private static validate(milliseconds: number): void {
    if (!Number.isFinite(milliseconds)) {
      throw new InvalidArgumentError(
        "A duração deve ser um número finito.",
        "INVALID_DURATION",
      );
    }

    if (!Number.isInteger(milliseconds)) {
      throw new InvalidArgumentError(
        "A duração deve utilizar milissegundos inteiros.",
        "NON_INTEGER_DURATION",
      );
    }

    if (milliseconds < 0) {
      throw new InvalidArgumentError(
        "A duração não pode ser negativa.",
        "NEGATIVE_DURATION",
      );
    }
  }

  public get milliseconds(): number {
    return this.value;
  }

  public get seconds(): number {
    return this.value / 1_000;
  }

  public get minutes(): number {
    return this.seconds / 60;
  }

  public get hours(): number {
    return this.minutes / 60;
  }

  public get isZero(): boolean {
    return this.value === 0;
  }

  public add(other: Duration): Duration {
    return Duration.fromMilliseconds(
      this.milliseconds + other.milliseconds,
    );
  }

  public subtract(other: Duration): Duration {
    const result =
      this.milliseconds - other.milliseconds;

    if (result < 0) {
      throw new InvalidArgumentError(
        "A subtração não pode produzir uma duração negativa.",
        "NEGATIVE_DURATION_RESULT",
      );
    }

    return Duration.fromMilliseconds(result);
  }

  public override toString(): string {
    return `${this.milliseconds}ms`;
  }
}