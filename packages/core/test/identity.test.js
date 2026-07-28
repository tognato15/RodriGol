import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AggregateId,
  CommandId,
  CorrelationId,
  EntityId,
  EventId,
  Identity,
  IdentityError,
} from "../dist/index.js";

class FixedIdentityGenerator {
  constructor(fixedValue) {
    this.fixedValue = fixedValue;
  }

  generate() {
    return this.fixedValue;
  }
}

describe("Identity System", () => {
  it("cria identidades com prefixos próprios", () => {
    const generator = new FixedIdentityGenerator("123");

    assert.equal(EntityId.create(generator).value, "ent_123");
    assert.equal(AggregateId.create(generator).value, "agg_123");
    assert.equal(EventId.create(generator).value, "evt_123");
    assert.equal(CommandId.create(generator).value, "cmd_123");
    assert.equal(
      CorrelationId.create(generator).value,
      "cor_123",
    );
  });

  it("reconstitui identidades persistidas", () => {
    const id = EntityId.from("ent_clube_001");

    assert.equal(id.toString(), "ent_clube_001");
    assert.equal(
      JSON.stringify({ id }),
      '{"id":"ent_clube_001"}',
    );
  });

  it("compara identidades pelo valor", () => {
    const first = EventId.from("evt_goal_001");
    const same = EventId.from("evt_goal_001");
    const different = EventId.from("evt_goal_002");

    assert.equal(first.equals(same), true);
    assert.equal(first.equals(different), false);
    assert.equal(first.equals(null), false);
  });

  it("cria identidades de domínio com prefixos específicos", () => {
    const generator = new FixedIdentityGenerator("match-001");

    const matchId = Identity.create(
      "match",
      generator,
    );

    assert.equal(matchId.value, "match_match-001");
  });

  it("reconstitui uma identidade genérica", () => {
    const id = Identity.from(
      "club_palmeiras",
      "club",
    );

    assert.equal(id.value, "club_palmeiras");
  });

  it("rejeita identidades vazias", () => {
    assert.throws(
      () => EntityId.from("   "),
      IdentityError,
    );
  });

  it("rejeita caracteres não permitidos", () => {
    assert.throws(
      () => EntityId.from("ent inválida"),
      IdentityError,
    );
  });

  it("rejeita identidades com prefixo incorreto", () => {
    assert.throws(
      () => EntityId.from("evt_goal_001"),
      (error) =>
        error instanceof IdentityError
        && error.code === "UNEXPECTED_IDENTITY_PREFIX",
    );
  });

  it("rejeita identidade sem prefixo", () => {
    assert.throws(
      () => Identity.from("palmeiras"),
      (error) =>
        error instanceof IdentityError
        && error.code === "MISSING_IDENTITY_PREFIX",
    );
  });

  it("rejeita prefixos inválidos", () => {
    const generator = new FixedIdentityGenerator("123");

    assert.throws(
      () => Identity.create("Match Event", generator),
      (error) =>
        error instanceof IdentityError
        && error.code === "INVALID_IDENTITY_PREFIX",
    );
  });

  it("rejeita um gerador que produz valor vazio", () => {
    const generator = new FixedIdentityGenerator(" ");

    assert.throws(
      () => EntityId.create(generator),
      (error) =>
        error instanceof IdentityError
        && error.code === "EMPTY_GENERATED_IDENTITY",
    );
  });

  it("rejeita um gerador que produz caracteres inválidos", () => {
    const generator = new FixedIdentityGenerator(
      "identidade inválida",
    );

    assert.throws(
      () => EntityId.create(generator),
      (error) =>
        error instanceof IdentityError
        && error.code === "INVALID_GENERATED_IDENTITY",
    );
  });
});