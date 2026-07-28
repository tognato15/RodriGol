import type { Failure } from "./failure.js";
import type { Success } from "./success.js";

export abstract class Result<TValue, TError extends Error = Error> {
  public abstract readonly isSuccessful: boolean;

  public abstract isSuccess(): this is Success<TValue, TError>;

  public abstract isFailure(): this is Failure<TValue, TError>;

  public abstract unwrap(): TValue;

  public abstract unwrapError(): TError;
}