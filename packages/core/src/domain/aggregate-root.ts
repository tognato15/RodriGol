import { Entity } from "./entity.js";
import type { DomainEvent } from "./domain-event.js";
import { EventRecorder } from "./event-recorder.js";
import type { EntityId } from "../identity/index.js";

export abstract class AggregateRoot<
  TId extends EntityId = EntityId,
  TEvent extends DomainEvent<TId> = DomainEvent<TId>,
> extends Entity<TId> {
  private readonly domainEvents =
    new EventRecorder<TEvent>();

  protected constructor(id: TId) {
    super(id);
  }

  protected recordDomainEvent(event: TEvent): void {
    this.domainEvents.record(event);
  }

  public restoreDomainEvent(event: TEvent): void {
    this.domainEvents.record(event);
  }

  public pullDomainEvents(): readonly TEvent[] {
    return this.domainEvents.pull();
  }

  public clearDomainEvents(): void {
    this.domainEvents.clear();
  }

  public get hasDomainEvents(): boolean {
    return this.domainEvents.hasEvents;
  }

  public get domainEventCount(): number {
    return this.domainEvents.size;
  }
}