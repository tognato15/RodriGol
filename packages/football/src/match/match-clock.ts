import { InvariantViolationError } from "@rodrigol/core";
import { MatchMinute } from "./match-minute.js";
import type { MatchPeriod } from "./match-period.js";
export class MatchClock {
  private currentPeriod: MatchPeriod = "not-started";
  private currentMinute = MatchMinute.create(0);
  public get period(): MatchPeriod { return this.currentPeriod; }
  public get minute(): MatchMinute { return this.currentMinute; }
  public setPeriod(period: MatchPeriod): void { this.currentPeriod = period; }
  public update(minute: MatchMinute): void {
    if (["not-started","half-time","extra-time-break","ended"].includes(this.currentPeriod)) throw new InvariantViolationError("O relógio não pode avançar no período atual.", "MATCH_CLOCK_NOT_RUNNING");
    if (minute.minute < this.currentMinute.minute || (minute.minute === this.currentMinute.minute && minute.added < this.currentMinute.added)) throw new InvariantViolationError("O relógio da partida não pode retroceder.", "MATCH_CLOCK_CANNOT_GO_BACKWARDS");
    this.currentMinute = minute;
  }
}
