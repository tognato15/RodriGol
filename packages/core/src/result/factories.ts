import { Failure } from "./failure.js";
import { Success } from "./success.js";

export function success<TValue>(
  value: TValue,
): Success<TValue> {
  return new Success(value);
}

export function failure<TError extends Error>(
  error: TError,
): Failure<never, TError> {
  return new Failure(error);
}