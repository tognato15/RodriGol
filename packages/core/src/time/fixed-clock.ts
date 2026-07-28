import type { Clock } from "./clock.js";
import { Duration } from "./duration.js";
import { Instant } from "./instant.js";

export class FixedClock implements Clock {
  private currentInstant: Instant;

  private constructor(initialInstant: Instant) {
    this.currentInstant = initialInstant;
  }

  public static at(initialInstant: Instant): FixedClock {
    return new FixedClock(initialInstant);
  }

  public now(): Instant {
    return this.currentInstant;
  }

  public set(instant: Instant): void {
    this.currentInstant = instant;
  }

  public advanceBy(duration: Duration): void {
    this.currentInstant =
      this.currentInstant.add(duration);
  }
}