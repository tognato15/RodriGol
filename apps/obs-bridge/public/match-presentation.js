/**
 * Motor canônico de apresentação de partidas — RodriGol Studio Beta 1.6.1.3+
 * Fonte única para elapsed, fase visual, visibilidade do relógio e payloads de overlay.
 */

export const MATCH_PHASE = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  PRE_GAME: 'PRE_GAME',
  FIRST_HALF: 'FIRST_HALF',
  HALFTIME: 'HALFTIME',
  SECOND_HALF: 'SECOND_HALF',
  EXTRA_TIME: 'EXTRA_TIME',
  PENALTIES: 'PENALTIES',
  LIVE_UNKNOWN: 'LIVE_UNKNOWN',
  FINAL: 'FINAL',
  SUSPENDED: 'SUSPENDED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED'
});

const PHASE_PRESENTATION = Object.freeze({
  SCHEDULED: { status: 'PROGRAMADO', period: 'PROGRAMADO' },
  PRE_GAME: { status: 'PRÉ-JOGO', period: 'PRÉ-JOGO' },
  FIRST_HALF: { status: 'AO VIVO', period: '1º TEMPO' },
  HALFTIME: { status: 'INTERVALO', period: 'INTERVALO' },
  SECOND_HALF: { status: 'AO VIVO', period: '2º TEMPO' },
  EXTRA_TIME: { status: 'AO VIVO', period: 'PRORROGAÇÃO' },
  PENALTIES: { status: 'PÊNALTIS', period: 'PÊNALTIS' },
  LIVE_UNKNOWN: { status: 'AO VIVO', period: 'EM ANDAMENTO' },
  FINAL: { status: 'FINAL', period: 'FIM DE JOGO' },
  SUSPENDED: { status: 'SUSPENSA', period: 'SUSPENSA' },
  POSTPONED: { status: 'ADIADA', period: 'ADIADA' },
  CANCELLED: { status: 'CANCELADA', period: 'CANCELADA' }
});


export function canonicalMatchPhase(value = '') {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return '';
  if (Object.values(MATCH_PHASE).includes(raw)) return raw;
  if (raw.includes('2º') || raw.includes('2°') || raw.includes('SEGUNDO')) return MATCH_PHASE.SECOND_HALF;
  if (raw.includes('1º') || raw.includes('1°') || raw.includes('PRIMEIRO')) return MATCH_PHASE.FIRST_HALF;
  if (raw.includes('INTERVAL')) return MATCH_PHASE.HALFTIME;
  if (raw.includes('PRORROG')) return MATCH_PHASE.EXTRA_TIME;
  if (raw.includes('PÊNALT') || raw.includes('PENALT')) return MATCH_PHASE.PENALTIES;
  if (raw.includes('FINAL') || raw.includes('FIM DE JOGO') || raw.includes('ENCERR')) return MATCH_PHASE.FINAL;
  if (raw.includes('SUSPENS')) return MATCH_PHASE.SUSPENDED;
  if (raw.includes('ADIAD') || raw.includes('POSTPON')) return MATCH_PHASE.POSTPONED;
  if (raw.includes('CANCEL')) return MATCH_PHASE.CANCELLED;
  if (raw.includes('EM ANDAMENTO') || raw === 'AO VIVO' || raw.includes('LIVE_UNKNOWN')) return MATCH_PHASE.LIVE_UNKNOWN;
  if (raw.includes('PRÉ') || raw.includes('PRE_GAME') || raw.includes('PRE-GAME')) return MATCH_PHASE.PRE_GAME;
  if (raw.includes('PROGRAM') || raw.includes('AGEND') || raw === 'SCHEDULED') return MATCH_PHASE.SCHEDULED;
  return raw;
}

const CLOCK_PHASES = new Set(['FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME']);
const BEFORE_KICKOFF = new Set(['SCHEDULED', 'PRE_GAME']);
const NO_SCORE = new Set(['SCHEDULED', 'PRE_GAME']);

const FALLBACK_COVERAGE = Object.freeze({
  homeScore: 0,
  awayScore: 0,
  homeScorers: [],
  awayScorers: [],
  events: [],
  phase: MATCH_PHASE.PRE_GAME,
  elapsedSeconds: 0,
  clockRunning: false,
  clockStartedAt: null
});

export function getEffectiveElapsedSeconds(coverage = {}, now = Date.now()) {
  const base = Number(coverage.elapsedSeconds) || 0;
  if (!coverage.clockRunning || coverage.clockStartedAt == null) return base;
  return base + Math.max(0, Math.floor((now - Number(coverage.clockStartedAt)) / 1000));
}

export function formatClockSeconds(total = 0) {
  const safe = Math.max(0, Math.floor(Number(total) || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function parseClockSeconds(value = '') {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,3}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function parseMatchDate(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  match = raw.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12, 0, 0);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function scheduledDisplay(match = {}, coverage = {}) {
  const time = String(match.time || coverage.time || coverage.startTime || '').trim();
  const candidate = parseMatchDate(match.date || coverage.date);
  if (candidate) {
    const today = new Date();
    const sameDay = candidate.getFullYear() === today.getFullYear()
      && candidate.getMonth() === today.getMonth()
      && candidate.getDate() === today.getDate();
    if (!sameDay) {
      return `${String(candidate.getDate()).padStart(2, '0')}/${String(candidate.getMonth() + 1).padStart(2, '0')}`;
    }
  }
  return time || 'PROGRAMADO';
}

export function normalizeCoverage(match = null, stored = null) {
  const officialPhase = canonicalMatchPhase(match?.status);
  const storedPhase = canonicalMatchPhase(stored?.phase);
  const base = { ...FALLBACK_COVERAGE, ...(stored || {}) };

  // O resultado oficial FINAL nunca pode ser rebaixado por uma cobertura antiga.
  if (officialPhase === MATCH_PHASE.FINAL) {
    return { ...base, phase: MATCH_PHASE.FINAL, clockRunning: false, clockStartedAt: null };
  }

  // Coberturas antigas em PRE_GAME/SCHEDULED não podem sobrescrever um estado
  // operacional já consolidado no Editor/Cabine.
  if (officialPhase && !BEFORE_KICKOFF.has(officialPhase)
      && (!storedPhase || BEFORE_KICKOFF.has(storedPhase))) {
    return { ...base, phase: officialPhase };
  }

  if (officialPhase === MATCH_PHASE.SCHEDULED
      && (!stored || !storedPhase || BEFORE_KICKOFF.has(storedPhase))) {
    return { ...base, phase: MATCH_PHASE.SCHEDULED, clockRunning: false, elapsedSeconds: 0, clockStartedAt: null };
  }

  return { ...base, phase: storedPhase || officialPhase || MATCH_PHASE.PRE_GAME };
}

export function deriveVisualState(match = null, coverage = {}) {
  const phase = canonicalMatchPhase(coverage.phase || match?.status) || MATCH_PHASE.PRE_GAME;
  const labels = PHASE_PRESENTATION[phase] || PHASE_PRESENTATION.PRE_GAME;
  return {
    phase,
    status: labels.status,
    period: labels.period,
    beforeKickoff: BEFORE_KICKOFF.has(phase),
    showScore: !NO_SCORE.has(phase),
    isLive: ['FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME', 'PENALTIES', 'LIVE_UNKNOWN'].includes(phase),
    isFinal: phase === MATCH_PHASE.FINAL
  };
}

export function shouldShowClock(visualState = {}) {
  return CLOCK_PHASES.has(visualState.phase);
}

export function shouldShowRunningClock(visualState = {}, coverage = {}) {
  return shouldShowClock(visualState) && Boolean(coverage.clockRunning);
}

export function buildMatchPresentationPayload(match = {}, coverage = {}, options = {}) {
  const now = options.now ?? Date.now();
  const normalized = normalizeCoverage(match, coverage);
  const visual = deriveVisualState(match, normalized);
  const elapsed = getEffectiveElapsedSeconds(normalized, now);
  const showClock = shouldShowClock(visual);
  const timingLabel = visual.beforeKickoff ? scheduledDisplay(match, normalized) : '';

  return {
    matchId: match.id || '',
    phase: visual.phase,
    status: visual.status,
    period: visual.period,
    beforeKickoff: visual.beforeKickoff,
    showScore: visual.showScore,
    clock: showClock ? formatClockSeconds(elapsed) : '',
    clockVisible: showClock,
    finalClock: '',
    elapsedSeconds: elapsed,
    clockRunning: Boolean(normalized.clockRunning),
    clockStartedAt: normalized.clockRunning ? normalized.clockStartedAt : null,
    timingLabel,
    date: match.date || '',
    time: match.time || '',
    startTime: match.time || '',
    homeScore: Number(normalized.homeScore) || 0,
    awayScore: Number(normalized.awayScore) || 0
  };
}

/** Patch parcial para ticks de relógio — inclui unset para limpar campos obsoletos no Bridge. */
export function buildClockTickPatch(match = {}, coverage = {}, options = {}) {
  const presentation = buildMatchPresentationPayload(match, coverage, options);
  const unset = ['finalClock'];
  if (!presentation.clock) unset.push('clock');
  return {
    matchId: presentation.matchId,
    phase: presentation.phase,
    status: presentation.status,
    period: presentation.period,
    clock: presentation.clock,
    clockVisible: presentation.clockVisible,
    finalClock: '',
    beforeKickoff: presentation.beforeKickoff,
    unset
  };
}

/** Mescla payload recebido no overlay (parcial) sobre estado anterior. */
export function mergePresentationState(previous = {}, patch = {}) {
  const next = { ...previous };
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'unset' || key === 'replace') continue;
    if (value !== undefined) next[key] = value;
  }
  if (Array.isArray(patch.unset)) {
    for (const key of patch.unset) delete next[key];
  }
  return next;
}

export function presentationFromPayload(payload = {}) {
  const period = String(payload.period || '').trim();
  const status = String(payload.status || '').trim();
  const explicitPhase = canonicalMatchPhase(payload.phase);
  const phase = explicitPhase
    || (period.includes('INTERVALO') ? MATCH_PHASE.HALFTIME : null)
    || (period.includes('2º') || period.includes('SEGUNDO') ? MATCH_PHASE.SECOND_HALF : null)
    || (period.includes('1º') || period.includes('PRIMEIRO') ? MATCH_PHASE.FIRST_HALF : null)
    || (status.includes('FINAL') ? MATCH_PHASE.FINAL : null)
    || payload.phase
    || MATCH_PHASE.PRE_GAME;
  const visual = deriveVisualState(null, { phase });
  return {
    ...visual,
    clock: payload.clockVisible === false ? '' : String(payload.clock || '').trim(),
    showClock: payload.clockVisible !== false && shouldShowClock(visual) && Boolean(String(payload.clock || '').trim())
  };
}
