import { DomainError } from "./domain-error.js";

export class InvalidArgumentError extends DomainError {
  public constructor(
    message: string,
    code = "INVALID_ARGUMENT",
    options?: ErrorOptions,
  ) {
    super(message, code, options);
  }
}