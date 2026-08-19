import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATCH_PHASE,
  buildClockTickPatch,
  buildMatchPresentationPayload,
  deriveVisualState,
  formatClockSeconds,
  getEffectiveElapsedSeconds,
  mergePresentationState,
  normalizeCoverage,
  scheduledDisplay,
  shouldShowClock
} from '../public/match-presentation.js';

const match = { id: 'm1', date: '2026-08-03', time: '16:00' };

test('Programado → 1º tempo exibe relógio e período correto', () => {
  const pre = buildMatchPresentationPayload(match, { phase: MATCH_PHASE.PRE_GAME, elapsedSeconds: 0, clockRunning: false });
  assert.equal(pre.clock, '');
  assert.equal(pre.period, 'PRÉ-JOGO');
  assert.equal(pre.beforeKickoff, true);

  const first = buildMatchPresentationPayload(match, {
    phase: MATCH_PHASE.FIRST_HALF,
    elapsedSeconds: 0,
    clockRunning: true,
    clockStartedAt: Date.now() - 125000
  });
  assert.equal(first.period, '1º TEMPO');
  assert.equal(first.clockVisible, true);
  assert.match(first.clock, /^02:/);
});

test('1º tempo → intervalo oculta relógio', () => {
  const half = buildMatchPresentationPayload(match, {
    phase: MATCH_PHASE.HALFTIME,
    elapsedSeconds: 2700,
    clockRunning: false,
    clockStartedAt: null
  });
  assert.equal(half.period, 'INTERVALO');
  assert.equal(half.clock, '');
  assert.equal(half.clockVisible, false);
  assert.equal(shouldShowClock(deriveVisualState(match, { phase: MATCH_PHASE.HALFTIME })), false);
});

test('Intervalo → 2º tempo restaura relógio e período', () => {
  const second = buildMatchPresentationPayload(match, {
    phase: MATCH_PHASE.SECOND_HALF,
    elapsedSeconds: 2700,
    clockRunning: true,
    clockStartedAt: Date.now() - 60000
  });
  assert.equal(second.period, '2º TEMPO');
  assert.equal(second.clockVisible, true);
  assert.equal(second.clock, formatClockSeconds(2760));
});

test('2º tempo → final remove relógio em todos os campos', () => {
  const final = buildMatchPresentationPayload(match, {
    phase: MATCH_PHASE.FINAL,
    elapsedSeconds: 5400,
    clockRunning: false
  });
  assert.equal(final.period, 'FIM DE JOGO');
  assert.equal(final.clock, '');
  assert.equal(final.finalClock, '');
  assert.equal(final.clockVisible, false);
});

test('Em andamento sem relógio não exibe cronômetro', () => {
  const live = buildMatchPresentationPayload(match, {
    phase: MATCH_PHASE.LIVE_UNKNOWN,
    elapsedSeconds: 0,
    clockRunning: false
  });
  assert.equal(live.period, 'EM ANDAMENTO');
  assert.equal(live.clock, '');
  assert.equal(live.clockVisible, false);
});

test('Pausar congela elapsedSeconds derivado', () => {
  const paused = {
    phase: MATCH_PHASE.FIRST_HALF,
    elapsedSeconds: 600,
    clockRunning: false,
    clockStartedAt: null
  };
  assert.equal(getEffectiveElapsedSeconds(paused), 600);
  const patch = buildClockTickPatch(match, paused);
  assert.equal(patch.clock, '10:00');
  assert.deepEqual(patch.unset, ['finalClock']);
});

test('mergePresentationState limpa campos via unset', () => {
  const merged = mergePresentationState(
    { clock: '45:00', finalClock: '45:00', period: '1º TEMPO' },
    { phase: MATCH_PHASE.HALFTIME, period: 'INTERVALO', clock: '', clockVisible: false, unset: ['clock', 'finalClock'] }
  );
  assert.equal(merged.period, 'INTERVALO');
  assert.equal('clock' in merged, false);
  assert.equal('finalClock' in merged, false);
});

test('Recarregar cobertura normaliza relógio ativo', () => {
  const stored = {
    phase: MATCH_PHASE.FIRST_HALF,
    elapsedSeconds: 120,
    clockRunning: true,
    clockStartedAt: Date.now() - 30000
  };
  const normalized = normalizeCoverage(match, stored);
  const elapsed = getEffectiveElapsedSeconds(normalized);
  assert.ok(elapsed >= 150);
});

test('Programado exibe horário ou data via scheduledDisplay', () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  assert.equal(scheduledDisplay({ date: `${y}-${m}-${d}`, time: '21:30' }), '21:30');
  assert.equal(scheduledDisplay({ date: '2026-12-25', time: '21:30' }), '25/12');
});
