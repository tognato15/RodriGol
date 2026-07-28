import type { DeepReadonly } from "./deep-readonly.js";

export function deepFreeze<TValue>(
  value: TValue,
): DeepReadonly<TValue> {
  if (typeof value !== "object" || value === null) {
    return value as DeepReadonly<TValue>;
  }

  if (Object.isFrozen(value)) {
    return value as DeepReadonly<TValue>;
  }

  for (const propertyValue of Object.values(value)) {
    deepFreeze(propertyValue);
  }

  return Object.freeze(value) as DeepReadonly<TValue>;
}