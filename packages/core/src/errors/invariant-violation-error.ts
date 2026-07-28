import { DomainError } from "./domain-error.js";

export class InvariantViolationError extends DomainError {
  public constructor(
    message: string,
    code = "INVARIANT_VIOLATION",
    options?: ErrorOptions,
  ) {
    super(message, code, options);
  }
}