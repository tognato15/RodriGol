import type { IdentityGenerator } from "./identity-generator.js";
import { Identity } from "./identity.js";

export type EventId<TTag extends string = "DomainEvent"> =
  Identity<TTag>;

export const EventId = {
  create<TTag extends string = "DomainEvent">(
    generator?: IdentityGenerator,
  ): EventId<TTag> {
    return Identity.create<TTag>("evt", generator);
  },

  from<TTag extends string = "DomainEvent">(
    value: string,
  ): EventId<TTag> {
    return Identity.from<TTag>(value, "evt");
  },
};