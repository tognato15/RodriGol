import type { Clock } from "./clock.js";
import { Instant } from "./instant.js";

export class SystemClock implements Clock {
  public now(): Instant {
    return Instant.fromEpochMilliseconds(Date.now());
  }
}