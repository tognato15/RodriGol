import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  Failure,
  InvalidArgumentError,
  Success,
  failure,
  success,
} from "../dist/index.js";

describe("Result System", () => {
  it("representa uma operação bem-sucedida", () => {
    const result = success("RodriGol");

    assert.equal(result.isSuccessful, true);
    assert.equal(result.isSuccess(), true);
    assert.equal(result.isFailure(), false);
    assert.equal(result.unwrap(), "RodriGol");
    assert.equal(result.value, "RodriGol");
    assert.equal(result instanceof Success, true);
  });

  it("representa uma operação malsucedida", () => {
    const error = new InvalidArgumentError(
      "O nome não pode estar vazio.",
    );

    const result = failure(error);

    assert.equal(result.isSuccessful, false);
    assert.equal(result.isSuccess(), false);
    assert.equal(result.isFailure(), true);
    assert.equal(result.unwrapError(), error);
    assert.equal(result.error, error);
    assert.equal(result instanceof Failure, true);
  });

  it("lança o erro armazenado quando um Failure é aberto como valor", () => {
    const error = new InvalidArgumentError(
      "Valor esportivo inválido.",
    );

    const result = failure(error);

    assert.throws(
      () => result.unwrap(),
      (receivedError) => receivedError === error,
    );
  });

  it("impede obter erro de um Success", () => {
    const result = success(10);

    assert.throws(
      () => result.unwrapError(),
      /Não é possível obter um erro/,
    );
  });
});