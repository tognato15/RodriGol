import type { EntityId } from "../identity/index.js";
import type { Instant } from "../time/index.js";

export interface DomainEvent<
  TAggregateId extends EntityId = EntityId,
> {
  readonly eventName: string;
  readonly aggregateId: TAggregateId;
  readonly occurredAt: Instant;
}