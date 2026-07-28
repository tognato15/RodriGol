import type { AuditEntry } from "./audit-entry.js";
import type { AuditTrail } from "./audit-trail.js";

export class InMemoryAuditTrail implements AuditTrail {
  private readonly entries: AuditEntry[] = [];

  public append(entry: AuditEntry): void {
    this.entries.push(Object.freeze({ ...entry }));
  }

  public list(): readonly AuditEntry[] {
    return Object.freeze([...this.entries]);
  }

  public clear(): void {
    this.entries.length = 0;
  }
}
