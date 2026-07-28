import type { DomainEvent } from "../domain/index.js";

export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  handle(event: TEvent): void | Promise<void>;
}

export type EventHandlerFunction<
  TEvent extends DomainEvent = DomainEvent,
> = (event: TEvent) => void | Promise<void>;
