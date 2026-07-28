import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BaseUnitOfWork,
  EntityId,
  FixedClock,
  InMemoryAuditTrail,
  InMemoryEventBus,
  Instant,
  InvariantViolationError,
  StateMachine,
  createPage,
  createPageRequest,
} from "../dist/index.js";

class FixedGenerator {
  constructor(value) { this.value = value; }
  generate() { return this.value; }
}

describe("Core final", () => {
  it("publica eventos nos assinantes e permite cancelar a assinatura", async () => {
    const bus = new InMemoryEventBus();
    const received = [];
    const unsubscribe = bus.subscribe("test.event", (event) => {
      received.push(event.eventName);
    });
    const event = {
      eventName: "test.event",
      aggregateId: EntityId.create(new FixedGenerator("001")),
      occurredAt: Instant.parse("2026-08-03T18:00:00.000Z"),
    };

    await bus.publish(event);
    unsubscribe();
    await bus.publish(event);

    assert.deepEqual(received, ["test.event"]);
  });

  it("executa unidade de trabalho com commit e rollback", async () => {
    class TestUnitOfWork extends BaseUnitOfWork {
      calls = [];
      async begin() { this.calls.push("begin"); }
      async commit() { this.calls.push("commit"); }
      async rollback() { this.calls.push("rollback"); }
    }

    const successUow = new TestUnitOfWork();
    assert.equal(await successUow.execute(async () => "ok"), "ok");
    assert.deepEqual(successUow.calls, ["begin", "commit"]);

    const failureUow = new TestUnitOfWork();
    await assert.rejects(() => failureUow.execute(async () => {
      throw new Error("failure");
    }));
    assert.deepEqual(failureUow.calls, ["begin", "rollback"]);
  });

  it("cria paginação e mantém auditoria em memória", () => {
    const request = createPageRequest(2, 10);
    const page = createPage(["item"], request, 21);
    assert.equal(page.totalPages, 3);
    assert.equal(page.hasPreviousPage, true);
    assert.equal(page.hasNextPage, true);

    const trail = new InMemoryAuditTrail();
    trail.append({
      action: "match.created",
      occurredAt: FixedClock.at(
        Instant.parse("2026-08-03T18:00:00.000Z"),
      ).now(),
      actor: { actorId: "system", actorType: "system" },
    });
    assert.equal(trail.list().length, 1);
  });

  it("controla transições de estado", () => {
    const machine = new StateMachine({
      initialState: "draft",
      transitions: {
        draft: ["published"],
        published: ["archived"],
      },
    });

    machine.transitionTo("published", undefined);
    assert.equal(machine.state, "published");
    assert.throws(
      () => machine.transitionTo("draft", undefined),
      InvariantViolationError,
    );
  });
});
