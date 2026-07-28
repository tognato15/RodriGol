import type { AggregateRoot, DomainEvent } from "../domain/index.js";
import type { EntityId } from "../identity/index.js";
import type { EventBus } from "./event-bus.js";

export class DomainEventDispatcher {
  public constructor(private readonly eventBus: EventBus) {}

  public async dispatch<
    TId extends EntityId,
    TEvent extends DomainEvent<TId>,
  >(aggregate: AggregateRoot<TId, TEvent>): Promise<readonly TEvent[]> {
    const events = aggregate.pullDomainEvents();

    try {
      await this.eventBus.publishAll(events);
      return events;
    } catch (error: unknown) {
      for (const event of events) {
        aggregate.restoreDomainEvent(event);
      }

      throw error;
    }
  }
}
