import type { CorrelationId, EntityId } from "../identity/index.js";
import type { Instant } from "../time/index.js";

export interface AuditActor {
  readonly actorId: string;
  readonly actorType: "user" | "system" | "integration";
  readonly displayName?: string;
}

export interface AuditEntry<TDetails = Readonly<Record<string, unknown>>> {
  readonly action: string;
  readonly occurredAt: Instant;
  readonly actor: AuditActor;
  readonly entityId?: EntityId;
  readonly correlationId?: CorrelationId;
  readonly details?: TDetails;
}
