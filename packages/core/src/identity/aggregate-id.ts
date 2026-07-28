import type { IdentityGenerator } from "./identity-generator.js";
import { Identity } from "./identity.js";

export type AggregateId<TTag extends string = "Aggregate"> =
  Identity<TTag>;

export const AggregateId = {
  create<TTag extends string = "Aggregate">(
    generator?: IdentityGenerator,
  ): AggregateId<TTag> {
    return Identity.create<TTag>("agg", generator);
  },

  from<TTag extends string = "Aggregate">(
    value: string,
  ): AggregateId<TTag> {
    return Identity.from<TTag>(value, "agg");
  },
};