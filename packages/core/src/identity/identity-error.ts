import { InvalidArgumentError } from "../errors/index.js";

export class IdentityError extends InvalidArgumentError {
  public constructor(
    message: string,
    code = "INVALID_IDENTITY",
    options?: ErrorOptions,
  ) {
    super(message, code, options);
  }
}