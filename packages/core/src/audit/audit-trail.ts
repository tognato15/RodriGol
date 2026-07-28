import type { AuditEntry } from "./audit-entry.js";

export interface AuditTrail {
  append(entry: AuditEntry): void | Promise<void>;
  list(): readonly AuditEntry[] | Promise<readonly AuditEntry[]>;
}
