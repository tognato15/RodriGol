import type { DomainEvent } from "../domain/index.js";
import type {
  EventHandler,
  EventHandlerFunction,
} from "./event-handler.js";
import type {
  EventBus,
  EventSubscription,
} from "./event-bus.js";
import {
  EventDispatchError,
  type EventHandlerFailure,
} from "./event-dispatch-error.js";

type AnyHandler = EventHandler<DomainEvent> | EventHandlerFunction<DomainEvent>;

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<AnyHandler>>();

  public subscribe<TEvent extends DomainEvent>(
    eventName: TEvent["eventName"],
    handler: EventHandler<TEvent> | EventHandlerFunction<TEvent>,
  ): EventSubscription {
    const handlers = this.handlers.get(eventName) ?? new Set<AnyHandler>();
    const storedHandler = handler as AnyHandler;

    handlers.add(storedHandler);
    this.handlers.set(eventName, handlers);

    return () => {
      handlers.delete(storedHandler);

      if (handlers.size === 0) {
        this.handlers.delete(eventName);
      }
    };
  }

  public async publish<TEvent extends DomainEvent>(
    event: TEvent,
  ): Promise<void> {
    const handlers = [...(this.handlers.get(event.eventName) ?? [])];
    const failures: EventHandlerFailure[] = [];

    await Promise.all(
      handlers.map(async (handler, handlerIndex) => {
        try {
          if (typeof handler === "function") {
            await handler(event);
          } else {
            await handler.handle(event);
          }
        } catch (cause: unknown) {
          failures.push({ handlerIndex, cause });
        }
      }),
    );

    if (failures.length > 0) {
      throw new EventDispatchError(event.eventName, failures);
    }
  }

  public async publishAll(
    events: readonly DomainEvent[],
  ): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
