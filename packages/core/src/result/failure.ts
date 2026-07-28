import { Result } from "./result.js";

export class Failure<TValue, TError extends Error>
  extends Result<TValue, TError> {
  public readonly isSuccessful = false;

  public constructor(public readonly error: TError) {
    super();
  }

  public isSuccess(): this is never {
    return false;
  }

  public isFailure(): this is Failure<TValue, TError> {
    return true;
  }

  public unwrap(): never {
    throw this.error;
  }

  public unwrapError(): TError {
    return this.error;
  }
}