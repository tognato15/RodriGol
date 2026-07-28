import {
  deepEqual,
  deepFreeze,
  type DeepReadonly,
} from "../common/index.js";

export abstract class ValueObject<TValue> {
  public readonly value: DeepReadonly<TValue>;

  protected constructor(value: TValue) {
    this.value = deepFreeze(value);
  }

  public equals(
    other: ValueObject<TValue> | null | undefined,
  ): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return deepEqual(this.value, other.value);
  }

  public toJSON(): DeepReadonly<TValue> {
    return this.value;
  }
}