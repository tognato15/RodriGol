import type { IdentityGenerator } from "./identity-generator.js";

export class RandomIdentityGenerator implements IdentityGenerator {
  public generate(): string {
    return globalThis.crypto.randomUUID();
  }
}
