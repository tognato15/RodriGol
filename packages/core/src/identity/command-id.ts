import type { IdentityGenerator } from "./identity-generator.js";
import { Identity } from "./identity.js";

export type CommandId<TTag extends string = "Command"> =
  Identity<TTag>;

export const CommandId = {
  create<TTag extends string = "Command">(
    generator?: IdentityGenerator,
  ): CommandId<TTag> {
    return Identity.create<TTag>("cmd", generator);
  },

  from<TTag extends string = "Command">(
    value: string,
  ): CommandId<TTag> {
    return Identity.from<TTag>(value, "cmd");
  },
};