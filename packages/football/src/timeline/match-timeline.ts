import type { MatchEventRecord } from "../match/match-event-record.js";
export class MatchTimeline {
  private readonly entries: MatchEventRecord[] = [];
  public add(entry: MatchEventRecord): void { this.entries.push(entry); this.entries.sort((a,b) => a.minute.minute-b.minute.minute || a.minute.added-b.minute.added || a.occurredAt.epochMilliseconds-b.occurredAt.epochMilliseconds); }
  public get all(): readonly MatchEventRecord[] { return [...this.entries]; }
  public byKind(kind: MatchEventRecord["kind"]): readonly MatchEventRecord[] { return this.entries.filter(entry => entry.kind === kind); }
  public get size(): number { return this.entries.length; }
}
