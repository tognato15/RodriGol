import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    AggregateRoot,
Instant,
  Entity,
  EntityId,
  EventRecorder,
} from "../dist/index.js";

class FixedGenerator {
  constructor(value) {
    this.value = value;
  }

  generate() {
    return this.value;
  }
}

class TestEntity extends Entity {
  constructor(id) {
    super(id);
  }
}

class TestAggregate extends AggregateRoot {
  constructor(id) {
    super(id);
  }

  performOperation() {
    this.recordDomainEvent({
      eventName: "test.operation-performed",
      aggregateId: this.id,
      occurredAt: Instant.parse(
        "2026-08-03T18:00:00.000Z",
      ),
    });
  }
}

describe("Entity", () => {
  it("considera iguais entidades com o mesmo id", () => {
    const generator = new FixedGenerator("001");

    const id = EntityId.create(generator);

    const first = new TestEntity(id);
    const second = new TestEntity(id);

    assert.equal(first.equals(second), true);
  });

  it("considera diferentes entidades com ids distintos", () => {
    const first = new TestEntity(
      EntityId.create(new FixedGenerator("001")),
    );

    const second = new TestEntity(
      EntityId.create(new FixedGenerator("002")),
    );

    assert.equal(first.equals(second), false);
  });

  it("retorna false para null", () => {
    const entity = new TestEntity(
      EntityId.create(new FixedGenerator("001")),
    );

    assert.equal(entity.equals(null), false);
  });
});

describe("EventRecorder", () => {
  it("registra eventos", () => {
    const recorder = new EventRecorder();

    recorder.record("Goal");
    recorder.record("Card");

    assert.equal(recorder.size, 2);
    assert.equal(recorder.hasEvents, true);
  });

  it("retira eventos e limpa a fila", () => {
    const recorder = new EventRecorder();

    recorder.record("Goal");
    recorder.record("VAR");

    const events = recorder.pull();

    assert.deepEqual(events, [
      "Goal",
      "VAR",
    ]);

    assert.equal(recorder.size, 0);
    assert.equal(recorder.hasEvents, false);
  });

  it("permite limpar manualmente", () => {
    const recorder = new EventRecorder();

    recorder.record("Goal");
    recorder.record("Card");

    recorder.clear();

    assert.equal(recorder.size, 0);
  });
});

describe("AggregateRoot", () => {
  it("registra e entrega eventos de domínio", () => {
    const aggregate = new TestAggregate(
      EntityId.create(new FixedGenerator("aggregate-001")),
    );

    aggregate.performOperation();

    assert.equal(aggregate.hasDomainEvents, true);
    assert.equal(aggregate.domainEventCount, 1);

    const events = aggregate.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.equal(
      events[0].eventName,
      "test.operation-performed",
    );

    assert.equal(
      events[0].aggregateId.equals(aggregate.id),
      true,
    );
  });

  it("limpa os eventos depois da retirada", () => {
    const aggregate = new TestAggregate(
      EntityId.create(new FixedGenerator("aggregate-001")),
    );

    aggregate.performOperation();
    aggregate.pullDomainEvents();

    assert.equal(aggregate.hasDomainEvents, false);
    assert.equal(aggregate.domainEventCount, 0);
  });

  it("permite descartar eventos ainda não publicados", () => {
    const aggregate = new TestAggregate(
      EntityId.create(new FixedGenerator("aggregate-001")),
    );

    aggregate.performOperation();
    aggregate.clearDomainEvents();

    assert.equal(aggregate.hasDomainEvents, false);
  });
});