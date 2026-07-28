import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  Duration,
  FixedClock,
  Instant,
  InvalidArgumentError,
  SystemClock,
} from "../dist/index.js";

describe("Duration", () => {
  it("cria durações em diferentes unidades", () => {
    assert.equal(
      Duration.fromMilliseconds(500).milliseconds,
      500,
    );

    assert.equal(
      Duration.fromSeconds(2).milliseconds,
      2_000,
    );

    assert.equal(
      Duration.fromMinutes(2).milliseconds,
      120_000,
    );

    assert.equal(
      Duration.fromHours(2).milliseconds,
      7_200_000,
    );
  });

  it("expõe conversões de unidade", () => {
    const duration = Duration.fromHours(2);

    assert.equal(duration.hours, 2);
    assert.equal(duration.minutes, 120);
    assert.equal(duration.seconds, 7_200);
    assert.equal(duration.isZero, false);
  });

  it("cria uma duração zero", () => {
    const duration = Duration.zero();

    assert.equal(duration.milliseconds, 0);
    assert.equal(duration.isZero, true);
  });

  it("soma e subtrai durações", () => {
    const first = Duration.fromMinutes(10);
    const second = Duration.fromMinutes(5);

    assert.equal(
      first.add(second).minutes,
      15,
    );

    assert.equal(
      first.subtract(second).minutes,
      5,
    );
  });

  it("rejeita duração negativa", () => {
    assert.throws(
      () => Duration.fromMilliseconds(-1),
      (error) =>
        error instanceof InvalidArgumentError
        && error.code === "NEGATIVE_DURATION",
    );
  });

  it("rejeita subtração com resultado negativo", () => {
    const first = Duration.fromSeconds(5);
    const second = Duration.fromSeconds(10);

    assert.throws(
      () => first.subtract(second),
      (error) =>
        error instanceof InvalidArgumentError
        && error.code === "NEGATIVE_DURATION_RESULT",
    );
  });
});

describe("Instant", () => {
  it("cria um instante a partir de uma data ISO", () => {
    const instant = Instant.parse(
      "2026-08-03T18:30:00.000Z",
    );

    assert.equal(
      instant.toISOString(),
      "2026-08-03T18:30:00.000Z",
    );
  });

  it("cria um instante a partir de Date", () => {
    const date = new Date(
      "2026-01-01T12:00:00.000Z",
    );

    const instant = Instant.fromDate(date);

    assert.equal(
      instant.epochMilliseconds,
      date.getTime(),
    );
  });

  it("soma e subtrai durações", () => {
    const instant = Instant.parse(
      "2026-08-03T18:00:00.000Z",
    );

    const later = instant.add(
      Duration.fromMinutes(30),
    );

    assert.equal(
      later.toISOString(),
      "2026-08-03T18:30:00.000Z",
    );

    assert.equal(
      later.subtract(
        Duration.fromMinutes(15),
      ).toISOString(),
      "2026-08-03T18:15:00.000Z",
    );
  });

  it("calcula a duração entre dois instantes", () => {
    const start = Instant.parse(
      "2026-08-03T18:00:00.000Z",
    );

    const end = Instant.parse(
      "2026-08-03T19:30:00.000Z",
    );

    assert.equal(
      end.durationSince(start).minutes,
      90,
    );
  });

  it("compara a ordem dos instantes", () => {
    const first = Instant.parse(
      "2026-08-03T18:00:00.000Z",
    );

    const second = Instant.parse(
      "2026-08-03T19:00:00.000Z",
    );

    assert.equal(first.isBefore(second), true);
    assert.equal(second.isAfter(first), true);
    assert.equal(first.isAfter(second), false);
  });

  it("rejeita uma data inválida", () => {
    assert.throws(
      () => Instant.parse("data inválida"),
      (error) =>
        error instanceof InvalidArgumentError
        && error.code === "INVALID_INSTANT_FORMAT",
    );
  });

  it("rejeita duração entre instantes invertidos", () => {
    const first = Instant.parse(
      "2026-08-03T19:00:00.000Z",
    );

    const second = Instant.parse(
      "2026-08-03T18:00:00.000Z",
    );

    assert.throws(
      () => second.durationSince(first),
      (error) =>
        error instanceof InvalidArgumentError
        && error.code === "INVALID_INSTANT_ORDER",
    );
  });
});

describe("Clock", () => {
  it("mantém um horário fixo", () => {
    const initialInstant = Instant.parse(
      "2026-08-03T18:00:00.000Z",
    );

    const clock = FixedClock.at(initialInstant);

    assert.equal(
      clock.now().toISOString(),
      "2026-08-03T18:00:00.000Z",
    );
  });

  it("avança o relógio fixo", () => {
    const clock = FixedClock.at(
      Instant.parse(
        "2026-08-03T18:00:00.000Z",
      ),
    );

    clock.advanceBy(Duration.fromMinutes(45));

    assert.equal(
      clock.now().toISOString(),
      "2026-08-03T18:45:00.000Z",
    );
  });

  it("altera diretamente o relógio fixo", () => {
    const clock = FixedClock.at(
      Instant.parse(
        "2026-08-03T18:00:00.000Z",
      ),
    );

    clock.set(
      Instant.parse(
        "2026-08-04T10:00:00.000Z",
      ),
    );

    assert.equal(
      clock.now().toISOString(),
      "2026-08-04T10:00:00.000Z",
    );
  });

  it("obtém o horário real do sistema", () => {
    const before = Date.now();
    const instant = new SystemClock().now();
    const after = Date.now();

    assert.equal(
      instant.epochMilliseconds >= before,
      true,
    );

    assert.equal(
      instant.epochMilliseconds <= after,
      true,
    );
  });
});