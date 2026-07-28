import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValueObject } from "../dist/index.js";

class TestScore extends ValueObject {
  constructor(home, away) {
    super({
      home,
      away,
    });
  }
}

class TestPosition extends ValueObject {
  constructor(x, y) {
    super({
      coordinates: {
        x,
        y,
      },
    });
  }
}

class DifferentValueObject extends ValueObject {
  constructor(home, away) {
    super({
      home,
      away,
    });
  }
}

describe("ValueObject", () => {
  it("compara objetos pelo conteúdo dos valores", () => {
    const first = new TestScore(2, 1);
    const same = new TestScore(2, 1);
    const different = new TestScore(3, 1);

    assert.equal(first.equals(same), true);
    assert.equal(first.equals(different), false);
  });

  it("não considera iguais objetos de classes diferentes", () => {
    const score = new TestScore(2, 1);
    const other = new DifferentValueObject(2, 1);

    assert.equal(score.equals(other), false);
  });

  it("retorna false ao comparar com null ou undefined", () => {
    const score = new TestScore(0, 0);

    assert.equal(score.equals(null), false);
    assert.equal(score.equals(undefined), false);
  });

  it("congela profundamente os valores internos", () => {
    const position = new TestPosition(10, 20);

    assert.equal(Object.isFrozen(position.value), true);
    assert.equal(
      Object.isFrozen(position.value.coordinates),
      true,
    );

    assert.throws(() => {
      position.value.coordinates.x = 99;
    }, TypeError);
  });

  it("produz uma representação JSON do valor", () => {
    const score = new TestScore(4, 2);

    assert.deepEqual(score.toJSON(), {
      home: 4,
      away: 2,
    });
  });
});