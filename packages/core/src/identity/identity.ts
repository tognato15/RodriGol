import { ValueObject } from "../value-object/index.js";
import type { IdentityGenerator } from "./identity-generator.js";
import { IdentityError } from "./identity-error.js";
import { RandomIdentityGenerator } from "./random-identity-generator.js";

const DEFAULT_GENERATOR = new RandomIdentityGenerator();

const VALID_PREFIX = /^[a-z][a-z0-9-]{0,31}$/;
const VALID_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

export class Identity<TTag extends string>
  extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create<TTag extends string>(
    prefix: string,
    generator: IdentityGenerator = DEFAULT_GENERATOR,
  ): Identity<TTag> {
    const normalizedPrefix = this.normalizePrefix(prefix);
    const generatedValue = generator.generate().trim();

    if (generatedValue.length === 0) {
      throw new IdentityError(
        "O gerador produziu uma identidade vazia.",
        "EMPTY_GENERATED_IDENTITY",
      );
    }

    if (!VALID_IDENTIFIER.test(generatedValue)) {
      throw new IdentityError(
        "O gerador produziu uma identidade em formato inválido.",
        "INVALID_GENERATED_IDENTITY",
      );
    }

    return new Identity<TTag>(
      `${normalizedPrefix}_${generatedValue}`,
    );
  }

  public static from<TTag extends string>(
    value: string,
    expectedPrefix?: string,
  ): Identity<TTag> {
    const normalizedValue = value.trim();

    this.validateValue(normalizedValue);

    if (expectedPrefix !== undefined) {
      const normalizedPrefix = this.normalizePrefix(expectedPrefix);

      if (!normalizedValue.startsWith(`${normalizedPrefix}_`)) {
        throw new IdentityError(
          `A identidade deve utilizar o prefixo "${normalizedPrefix}_".`,
          "UNEXPECTED_IDENTITY_PREFIX",
        );
      }
    }

    return new Identity<TTag>(normalizedValue);
  }

  private static normalizePrefix(prefix: string): string {
    const normalizedPrefix = prefix.trim().toLowerCase();

    if (!VALID_PREFIX.test(normalizedPrefix)) {
      throw new IdentityError(
        "O prefixo deve começar com letra minúscula e conter apenas letras minúsculas, números ou hífen.",
        "INVALID_IDENTITY_PREFIX",
      );
    }

    return normalizedPrefix;
  }

  private static validateValue(value: string): void {
    if (value.length === 0) {
      throw new IdentityError(
        "A identidade não pode estar vazia.",
        "EMPTY_IDENTITY",
      );
    }

    if (!VALID_IDENTIFIER.test(value)) {
      throw new IdentityError(
        "A identidade deve começar com letra ou número e conter apenas letras, números, hífen ou sublinhado.",
        "INVALID_IDENTITY_FORMAT",
      );
    }

    if (!value.includes("_")) {
      throw new IdentityError(
        "A identidade deve conter um prefixo seguido de sublinhado.",
        "MISSING_IDENTITY_PREFIX",
      );
    }
  }

  public override toString(): string {
    return this.value;
  }
}