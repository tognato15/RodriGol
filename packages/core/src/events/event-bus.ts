import type { DomainEvent } from "../domain/index.js";
import type {
  EventHandler,
  EventHandlerFunction,
} from "./event-handler.js";

export type EventSubscription = () => void;

export interface EventBus {
  subscribe<TEvent extends DomainEvent>(
    eventName: TEvent["eventName"],
    handler: EventHandler<TEvent> | EventHandlerFunction<TEvent>,
  ): EventSubscription;

  publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>;

  publishAll(events: readonly DomainEvent[]): Promise<void>;
}
