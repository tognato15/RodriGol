import type { IdentityGenerator } from "./identity-generator.js";
import { Identity } from "./identity.js";

export type EntityId<TTag extends string = "Entity"> =
  Identity<TTag>;

export const EntityId = {
  create<TTag extends string = "Entity">(
    generator?: IdentityGenerator,
  ): EntityId<TTag> {
    return Identity.create<TTag>("ent", generator);
  },

  from<TTag extends string = "Entity">(
    value: string,
  ): EntityId<TTag> {
    return Identity.from<TTag>(value, "ent");
  },
};