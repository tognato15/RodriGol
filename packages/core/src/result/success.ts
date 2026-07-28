import { Result } from "./result.js";

export class Success<TValue, TError extends Error = Error>
  extends Result<TValue, TError> {
  public readonly isSuccessful = true;

  public constructor(public readonly value: TValue) {
    super();
  }

  public isSuccess(): this is Success<TValue, TError> {
    return true;
  }

  public isFailure(): this is never {
    return false;
  }

  public unwrap(): TValue {
    return this.value;
  }

  public unwrapError(): never {
    throw new Error(
      "Não é possível obter um erro de um resultado bem-sucedido.",
    );
  }
}