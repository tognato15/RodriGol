import type { IdentityGenerator } from "./identity-generator.js";
import { Identity } from "./identity.js";

export type CorrelationId<
  TTag extends string = "Correlation",
> = Identity<TTag>;

export const CorrelationId = {
  create<TTag extends string = "Correlation">(
    generator?: IdentityGenerator,
  ): CorrelationId<TTag> {
    return Identity.create<TTag>("cor", generator);
  },

  from<TTag extends string = "Correlation">(
    value: string,
  ): CorrelationId<TTag> {
    return Identity.from<TTag>(value, "cor");
  },
};