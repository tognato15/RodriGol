import {
  getActiveMatch,
  getClub,
  getMatch,
  getMatches,
  getOnAirMatchId,
  isMatchOnAir,
  readCoverage,
  saveCoverage,
  setActiveMatchId,
  setOnAirMatchId,
  archiveCoverage,
  enqueueTickerItem
} from './data-store.js';

const $ = id => document.getElementById(id);
const PHASES = {
  PRE_GAME: { label: 'PRÉ-JOGO', period: 'PRÉ-JOGO' },
  FIRST_HALF: { label: 'AO VIVO', period: '1º TEMPO' },
  HALFTIME: { label: 'INTERVALO', period: 'INTERVALO' },
  SECOND_HALF: { label: 'AO VIVO', period: '2º TEMPO' },
  EXTRA_TIME: { label: 'AO VIVO', period: 'PRORROGAÇÃO' },
  PENALTIES: { label: 'PÊNALTIS', period: 'PÊNALTIS' },
  FINAL: { label: 'FINALIZADA', period: 'FIM DE JOGO' }
};
const EVENT_META = {
  GOAL: { label: 'GOL', icon: '⚽', color: '#18833a' },
  YELLOW_CARD: { label: 'CARTÃO AMARELO', icon: '🟨', color: '#a48700' },
  RED_CARD: { label: 'CARTÃO VERMELHO', icon: '🟥', color: '#9d2429' },
  SUBSTITUTION: { label: 'SUBSTITUIÇÃO', icon: '🔁', color: '#216ba0' },
  VAR: { label: 'VAR', icon: '▣', color: '#6a3b8d' },
  INFORMATION: { label: 'INFORMAÇÃO', icon: 'ⓘ', color: '#287596' },
  REVIEW: { label: 'APURAÇÃO', icon: '⌕', color: '#52616b' }
};
const initialState = { homeScore: 0, awayScore: 0, homeScorers: [], awayScorers: [], events: [], phase: 'PRE_GAME', elapsedSeconds: 0, clockRunning: false, clockStartedAt: null, selectedType: 'GOAL', lineups: { home: { coach: '', starters: [], bench: [] }, away: { coach: '', starters: [], bench: [] } } };
let editingEventId = null;
let lineupDraftDirty = false;

const requestedMatchId = new URLSearchParams(location.search).get('matchId');
let match = requestedMatchId ? getMatch(requestedMatchId) : getActiveMatch();
if (!match) {
  location.replace('/control/matches.html');
  throw new Error(requestedMatchId ? 'A partida solicitada não foi encontrada.' : 'Nenhuma partida cadastrada.');
}

// Toda cabine recebe uma identidade permanente na URL. Isso evita que abas
// diferentes voltem a depender da partida ativa global ao serem recarregadas.
if (!requestedMatchId) {
  const canonicalUrl = new URL(location.href);
  canonicalUrl.searchParams.set('matchId', match.id);
  history.replaceState(null, '', canonicalUrl);
}
setActiveMatchId(match.id);

const missingClub = (side, id) => ({
  id: id || `missing-${side.toLowerCase()}`,
  name: side === 'HOME' ? 'Mandante não encontrado' : 'Visitante não encontrado',
  shortName: side === 'HOME' ? 'Mandante' : 'Visitante',
  abbreviation: side === 'HOME' ? 'MAN' : 'VIS',
  primaryColor: '#18394a', secondaryColor: '#ffffff', crestText: side === 'HOME' ? 'M' : 'V', crestDataUrl: ''
});
let home = getClub(match.homeClubId) || missingClub('HOME', match.homeClubId);
let away = getClub(match.awayClubId) || missingClub('AWAY', match.awayClubId);
let state = { ...initialState, ...readCoverage(match.id, initialState) };
state.lineups = { home: { ...initialState.lineups.home, ...(state.lineups?.home || {}) }, away: { ...initialState.lineups.away, ...(state.lineups?.away || {}) } };
let tickTimer = null;
let publishing = false;
let lastRenderedSecond = -1;

function effectiveElapsed(coverage = state) {
  if (!coverage.clockRunning || !coverage.clockStartedAt) return Number(coverage.elapsedSeconds) || 0;
  return (Number(coverage.elapsedSeconds) || 0) + Math.max(0, Math.floor((Date.now() - Number(coverage.clockStartedAt)) / 1000));
}
function freezeElapsed() { state.elapsedSeconds = effectiveElapsed(); state.clockStartedAt = null; }
function saveState() { saveCoverage(match.id, { ...state, updatedAt: new Date().toISOString() }); }
function reloadState() { state = { ...initialState, ...readCoverage(match.id, initialState) }; state.lineups = { home: { ...initialState.lineups.home, ...(state.lineups?.home || {}) }, away: { ...initialState.lineups.away, ...(state.lineups?.away || {}) } }; render(); updateClockButton(); if (state.clockRunning) ensureTickTimer(); else stopTickTimer(); }
function log(value) { $('log').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
async function command(body) {
  const response = await fetch('/api/commands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Falha no comando');
  return result;
}
function formatClock(seconds) { const minutes = Math.floor(seconds / 60); const rest = seconds % 60; return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`; }
function phase() { return PHASES[state.phase] || PHASES.PRE_GAME; }
function teamName(team) { return team === 'HOME' ? home.shortName : team === 'AWAY' ? away.shortName : 'Neutro'; }
function currentMinute() { return Number($('minute').value) || Math.floor(effectiveElapsed() / 60); }
function eventSummary(event) { return [event.player, event.details].filter(Boolean).join(' · '); }
function crestPayload(club) { return { text: club.crestText || club.abbreviation || '?', image: club.crestDataUrl || '', background: club.primaryColor || '#18394a', color: club.secondaryColor || '#fff' }; }

function normalizedTimelineEvent(event) {
  return {
    ...event,
    matchId: match.id,
    competition: match.competition || '',
    round: match.round || '',
    season: match.season || '',
    homeClubId: match.homeClubId,
    awayClubId: match.awayClubId,
    homeName: home.shortName,
    awayName: away.shortName,
    phase: state.phase,
    period: phase().period,
    importance: event.type === 'GOAL' || event.type === 'RED_CARD' ? 'HIGH' : event.type === 'YELLOW_CARD' || event.type === 'VAR' ? 'MEDIUM' : 'NORMAL',
    editorialSuggestion: buildEditorialSuggestion(event)
  };
}
function buildEditorialSuggestion(event) {
  const side = teamName(event.team);
  const minute = `${event.minute}'`;
  if (event.type === 'GOAL') return `${event.player || side} marcou para ${side} aos ${minute} em ${home.shortName} × ${away.shortName}.`;
  if (event.type === 'YELLOW_CARD') return `${event.player || side} recebeu cartão amarelo aos ${minute}.`;
  if (event.type === 'RED_CARD') return `${event.player || side} foi expulso aos ${minute}.`;
  if (event.type === 'SUBSTITUTION') return `Substituição em ${side} aos ${minute}: ${event.player || event.details || 'alteração confirmada'}.`;
  if (event.type === 'VAR') return `VAR acionado aos ${minute} em ${home.shortName} × ${away.shortName}.`;
  return `${event.label || 'Informação'} aos ${minute}: ${event.player || event.details || home.shortName + ' × ' + away.shortName}.`;
}
function archiveCurrentCoverage(reason = 'Atualização da cobertura') {
  return archiveCoverage({
    matchId: match.id,
    match: { ...match },
    home: { id: home.id, name: home.name, shortName: home.shortName, abbreviation: home.abbreviation, crestDataUrl: home.crestDataUrl || '', primaryColor: home.primaryColor || '' },
    away: { id: away.id, name: away.name, shortName: away.shortName, abbreviation: away.abbreviation, crestDataUrl: away.crestDataUrl || '', primaryColor: away.primaryColor || '' },
    coverage: { ...state, elapsedSeconds: effectiveElapsed(), clockRunning: false, clockStartedAt: null },
    finalScore: `${state.homeScore} × ${state.awayScore}`,
    reason,
    archivedAt: new Date().toISOString()
  });
}
function addSystemTimelineEvent(type, label, icon, details = '') {
  const event = normalizedTimelineEvent({
    id: crypto.randomUUID?.() || String(Date.now()), type, label, icon, color: '#18394a',
    minute: Math.floor(effectiveElapsed() / 60), team: 'NEUTRAL', player: '', details,
    createdAt: new Date().toISOString(), score: `${state.homeScore} × ${state.awayScore}`, system: true
  });
  state.events.unshift(event);
}

function scoreboardPayload() {
  return {
    matchId: match.id,
    competition: [match.competition, match.round].filter(Boolean).join(' · ').toUpperCase(),
    homeName: home.shortName.toUpperCase(), awayName: away.shortName.toUpperCase(),
    homeShort: home.abbreviation, awayShort: away.abbreviation,
    homeCrest: crestPayload(home), awayCrest: crestPayload(away),
    homeScore: state.homeScore, awayScore: state.awayScore,
    homeScorers: state.homeScorers.join(' · ') || '—', awayScorers: state.awayScorers.join(' · ') || '—',
    clock: formatClock(effectiveElapsed()), period: phase().period, status: phase().label,
    chronology: state.events.slice(0, 6)
  };
}
async function publishScoreboard(force = false) {
  if (!force && !isMatchOnAir(match.id)) return;
  await command({ type: 'show', region: 'scoreboard', payload: scoreboardPayload() });
}
function renderCrest(element, club) {
  element.style.background = club.primaryColor || '#18394a';
  element.style.color = club.secondaryColor || '#fff';
  element.innerHTML = club.crestDataUrl ? `<img src="${club.crestDataUrl}" alt="${escapeHtml(club.shortName)}">` : escapeHtml(club.crestText || club.abbreviation || '?');
}
function render() {
  const currentPhase = phase();
  $('homeName').textContent = home.shortName.toUpperCase();
  $('awayName').textContent = away.shortName.toUpperCase();
  renderCrest($('homeCrest'), home);
  renderCrest($('awayCrest'), away);
  $('competitionText').textContent = [match.competition, match.round].filter(Boolean).join(' · ');
  $('venueText').textContent = [match.venue, match.city].filter(Boolean).join(' · ') || 'Local não informado';
  $('team').options[0].textContent = home.shortName;
  $('team').options[1].textContent = away.shortName;
  $('homeScoreText').textContent = state.homeScore;
  $('awayScoreText').textContent = state.awayScore;
  $('homeScorers').textContent = state.homeScorers.join(' · ') || '—';
  $('awayScorers').textContent = state.awayScorers.join(' · ') || '—';
  const elapsed = effectiveElapsed();
  $('clockText').textContent = formatClock(elapsed);
  $('matchStatusBadge').textContent = currentPhase.label;
  $('periodLabel').textContent = currentPhase.period;
  $('coverageStatus').textContent = currentPhase.label;
  $('matchPhase').value = state.phase;
  $('eventCount').textContent = state.events.length;
  if (document.activeElement !== $('minute')) $('minute').value = Math.floor(elapsed / 60);
  document.querySelectorAll('.event-type').forEach(button => button.classList.toggle('active', button.dataset.type === state.selectedType));
  renderLineups();
  renderTimeline();
  renderOtherMatches();
  renderOnAirStatus();
}
function renderTimeline() {
  const list = $('timelineList');
  if (!state.events.length) { list.innerHTML = '<div class="empty">Nenhum evento registrado.</div>'; return; }
  list.innerHTML = state.events.map(event => `<article class="timeline-item"><b class="minute">${event.minute}'</b><span class="tag" style="background:${event.color}22;color:${event.color};border:1px solid ${event.color}66">${event.icon} ${event.label}</span><div><strong>${escapeHtml(event.player || event.title || teamName(event.team))}</strong><small>${escapeHtml(event.details || teamName(event.team))}</small></div><b class="score-after">${event.score || ''}</b><div class="event-actions"><button data-edit-event="${event.id}">Editar</button><button class="danger" data-delete-event="${event.id}">Excluir</button></div></article>`).join('');
  list.querySelectorAll('[data-edit-event]').forEach(button => button.addEventListener('click', () => editEvent(button.dataset.editEvent)));
  list.querySelectorAll('[data-delete-event]').forEach(button => button.addEventListener('click', () => deleteEvent(button.dataset.deleteEvent)));
}
function renderLineups() {
  $('homeLineupTitle').textContent = home.shortName.toUpperCase();
  $('awayLineupTitle').textContent = away.shortName.toUpperCase();
  if (lineupDraftDirty) return;
  const fields = [
    ['homeCoach', state.lineups.home.coach || ''], ['homeStarters', (state.lineups.home.starters || []).join('\n')], ['homeBench', (state.lineups.home.bench || []).join('\n')],
    ['awayCoach', state.lineups.away.coach || ''], ['awayStarters', (state.lineups.away.starters || []).join('\n')], ['awayBench', (state.lineups.away.bench || []).join('\n')]
  ];
  fields.forEach(([id, value]) => { $(id).value = value; });
}
function lines(value) { return String(value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean); }
function saveLineups() {
  const button = $('saveLineups');
  button.disabled = true;
  const originalText = button.textContent;
  try {
    state.lineups = {
      home: { coach: $('homeCoach').value.trim(), starters: lines($('homeStarters').value), bench: lines($('homeBench').value) },
      away: { coach: $('awayCoach').value.trim(), starters: lines($('awayStarters').value), bench: lines($('awayBench').value) }
    };
    saveState();
    const persisted = readCoverage(match.id, initialState);
    if (!persisted?.lineups) throw new Error('A gravação não pôde ser confirmada.');
    lineupDraftDirty = false;
    $('lineupStatus').textContent = `Escalações salvas para ${home.shortName} × ${away.shortName}.`;
    button.textContent = '✓ Salvo';
    log({ ok: true, matchId: match.id, lineupsSaved: true });
  } catch (error) {
    $('lineupStatus').textContent = `Não foi possível salvar: ${error.message}`;
    log(error.message);
  } finally {
    setTimeout(() => { button.disabled = false; button.textContent = originalText; }, 1200);
  }
}
function rebuildFromEvents() {
  let homeScore = 0, awayScore = 0;
  const homeScorers = [], awayScorers = [];
  [...state.events].reverse().forEach(event => {
    if (event.type === 'GOAL') {
      if (event.team === 'HOME') { homeScore += 1; if (event.player) homeScorers.push(`${event.minute}' ${event.player}`); }
      if (event.team === 'AWAY') { awayScore += 1; if (event.player) awayScorers.push(`${event.minute}' ${event.player}`); }
    }
    event.score = `${homeScore} × ${awayScore}`;
  });
  state.homeScore = homeScore; state.awayScore = awayScore; state.homeScorers = homeScorers; state.awayScorers = awayScorers;
}
function editEvent(id) {
  const event = state.events.find(item => item.id === id); if (!event) return;
  editingEventId = id; state.selectedType = event.type; render();
  $('minute').value = event.minute; $('team').value = event.team; $('player').value = event.player || event.title || ''; $('details').value = event.details || '';
  $('publishEvent').textContent = '💾 SALVAR ALTERAÇÃO';
  $('eventPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function deleteEvent(id) {
  const event = state.events.find(item => item.id === id); if (!event) return;
  if (!confirm(`Excluir ${event.label.toLowerCase()} de ${event.player || teamName(event.team)}?`)) return;
  state.events = state.events.filter(item => item.id !== id); rebuildFromEvents(); saveState(); render(); publishScoreboard().catch(error => log(error.message));
}
function clearCoverage() {
  if (!confirm('Limpar placar, autores, cartões e toda a cronologia desta cobertura? O relógio e as escalações serão preservados.')) return;
  state.homeScore = 0; state.awayScore = 0; state.homeScorers = []; state.awayScorers = []; state.events = []; editingEventId = null;
  saveState(); render(); publishScoreboard().catch(error => log(error.message));
}
function renderOtherMatches() {
  const container = $('otherMatchesList');
  const right = $('otherMatchesRight');
  const others = getMatches().filter(item => item.id !== match.id);
  if (!others.length) { const empty = '<p class="other-empty">Nenhum outro jogo cadastrado.</p>'; if (container) container.innerHTML = empty; if (right) right.innerHTML = empty; return; }
  const onAirId = getOnAirMatchId();
  const markup = others.map(item => {
    const coverage = { ...initialState, phase: item.status || 'PRE_GAME', ...readCoverage(item.id, initialState) };
    const itemHome = getClub(item.homeClubId) || { shortName: 'Mandante' };
    const itemAway = getClub(item.awayClubId) || { shortName: 'Visitante' };
    const crestMarkup = club => club.crestDataUrl
      ? `<span class="other-crest"><img src="${escapeHtml(club.crestDataUrl)}" alt="${escapeHtml(club.shortName)}"></span>`
      : `<span class="other-crest" style="background:${escapeHtml(club.primaryColor || '#18394a')};color:${escapeHtml(club.secondaryColor || '#fff')}">${escapeHtml(club.crestText || club.abbreviation || '?')}</span>`;
    return `<a class="other-match ${item.id === onAirId ? 'on-air' : ''}" href="/control/?matchId=${encodeURIComponent(item.id)}">
      <span class="other-status">${coverage.clockRunning ? '● AO VIVO' : (PHASES[coverage.phase]?.period || coverage.phase)}</span>
      <span class="other-team-row">${crestMarkup(itemHome)}<b>${escapeHtml(itemHome.shortName)}</b><strong>${coverage.homeScore || 0}</strong></span>
      <span class="other-team-row">${crestMarkup(itemAway)}<b>${escapeHtml(itemAway.shortName)}</b><strong>${coverage.awayScore || 0}</strong></span>
      <span class="other-clock">${formatClock(effectiveElapsed(coverage))}${item.id === onAirId ? ' · NO AR' : ''}</span>
    </a>`;
  }).join('');
  if (container) container.innerHTML = markup;
  if (right) right.innerHTML = markup;
}
function renderOnAirStatus() {
  const onAir = isMatchOnAir(match.id);
  $('onAirIndicator').textContent = onAir ? '● ESTA PARTIDA ESTÁ NO AR' : '○ ESTA PARTIDA NÃO ESTÁ NO AR';
  $('onAirIndicator').classList.toggle('active', onAir);
  $('setOnAir').textContent = onAir ? 'SAÍDA PRINCIPAL' : 'COLOCAR NO AR';
  $('setOnAir').disabled = onAir;
}
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function updateClockButton() {
  if (state.clockRunning) { $('startClock').textContent = '▶ Rodando'; $('startClock').disabled = true; }
  else { $('startClock').textContent = '▶ Iniciar'; $('startClock').disabled = false; }
}
function startClock() {
  if (state.phase === 'PRE_GAME' || state.phase === 'HALFTIME') state.phase = state.phase === 'PRE_GAME' ? 'FIRST_HALF' : 'SECOND_HALF';
  if (state.phase === 'FINAL' || state.clockRunning) return;
  state.clockRunning = true;
  state.clockStartedAt = Date.now();
  addSystemTimelineEvent(state.phase === 'SECOND_HALF' ? 'SECOND_HALF_START' : 'MATCH_START', state.phase === 'SECOND_HALF' ? 'RECOMEÇOU' : 'COMEÇOU', '▶', phase().period);
  saveState(); render(); updateClockButton(); ensureTickTimer(); publishScoreboard().catch(error => log(error.message));
}
function ensureTickTimer() {
  if (tickTimer) return;
  tickTimer = setInterval(async () => {
    const second = effectiveElapsed();
    if (second === lastRenderedSecond) return;
    lastRenderedSecond = second;
    render();
    if (!isMatchOnAir(match.id)) return;
    try { await command({ type: 'update', region: 'scoreboard', payload: { matchId: match.id, clock: formatClock(second), period: phase().period, status: phase().label } }); } catch { /* diagnóstico mantém a cabine operacional */ }
  }, 250);
}
function stopTickTimer() { if (tickTimer) clearInterval(tickTimer); tickTimer = null; lastRenderedSecond = -1; }
function pauseClock() {
  if (state.clockRunning) freezeElapsed();
  state.clockRunning = false;
  addSystemTimelineEvent('CLOCK_PAUSE', 'JOGO PAUSADO', 'Ⅱ', phase().period);
  updateClockButton(); stopTickTimer(); saveState(); render(); publishScoreboard().catch(error => log(error.message));
}
function resetClock() { if (state.clockRunning) freezeElapsed(); state.clockRunning = false; state.elapsedSeconds = 0; state.clockStartedAt = null; stopTickTimer(); saveState(); render(); updateClockButton(); publishScoreboard().catch(error => log(error.message)); }
function setPhase(value) {
  if (state.clockRunning && (value === 'HALFTIME' || value === 'FINAL')) freezeElapsed();
  const previousPhase = state.phase;
  state.phase = value;
  if (value === 'HALFTIME' || value === 'FINAL') { state.clockRunning = false; stopTickTimer(); }
  if (previousPhase !== value) {
    if (value === 'HALFTIME') addSystemTimelineEvent('HALFTIME', 'INTERVALO', '⏸', 'Fim do primeiro tempo');
    if (value === 'SECOND_HALF') addSystemTimelineEvent('SECOND_HALF', 'SEGUNDO TEMPO', '▶', 'Recomeço da partida');
    if (value === 'FINAL') addSystemTimelineEvent('FINAL', 'FIM DE JOGO', '✓', `${home.shortName} ${state.homeScore} × ${state.awayScore} ${away.shortName}`);
  }
  if (value === 'FIRST_HALF' && effectiveElapsed() >= 45 * 60) { state.elapsedSeconds = 0; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  if (value === 'SECOND_HALF' && effectiveElapsed() < 45 * 60) { state.elapsedSeconds = 45 * 60; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  saveState();
  if (value === 'FINAL') archiveCurrentCoverage('Cobertura encerrada');
  render(); updateClockButton(); publishScoreboard().catch(error => log(error.message));
}
function makeEvent() {
  const meta = EVENT_META[state.selectedType];
  return normalizedTimelineEvent({ id: crypto.randomUUID?.() || String(Date.now()), type: state.selectedType, label: meta.label, icon: meta.icon, color: meta.color, minute: currentMinute(), team: $('team').value, player: $('player').value.trim(), details: $('details').value.trim(), createdAt: new Date().toISOString() });
}
function applyEvent(event) {
  if (event.type === 'GOAL') {
    if (event.team === 'HOME') { state.homeScore++; if (event.player) state.homeScorers.push(`${event.minute}' ${event.player}`); }
    if (event.team === 'AWAY') { state.awayScore++; if (event.player) state.awayScorers.push(`${event.minute}' ${event.player}`); }
  }
  event.score = `${state.homeScore} × ${state.awayScore}`;
  state.events.unshift(event);
}
async function publishEvent() {
  if (publishing) return;
  publishing = true; $('publishEvent').disabled = true;
  try {
    const event = makeEvent();
    if (editingEventId) { const index = state.events.findIndex(item => item.id === editingEventId); if (index >= 0) { event.id = editingEventId; state.events[index] = event; rebuildFromEvents(); } editingEventId = null; $('publishEvent').textContent = '⚡ REGISTRAR & PUBLICAR'; } else { applyEvent(event); }
    saveState(); archiveCurrentCoverage('Timeline atualizada'); render(); await publishScoreboard();
    const title = event.type === 'GOAL' ? `GOL DO ${teamName(event.team).toUpperCase()}!` : event.label;
    const text = [title, event.player, event.details].filter(Boolean).join(' — ');
    $('newsflashText').textContent = text;
    if ($('showTicker').checked) {
      enqueueTickerItem({
        sourceEventId: event.id,
        competition: match.competition || '',
        match: `${home.shortName} × ${away.shortName}`,
        eventType: event.label || event.type,
        minute: `${event.minute}'`,
        person: event.player || '',
        text: event.details || text,
        priority: event.importance === 'HIGH' ? 'HIGH' : 'NORMAL'
      });
      if (isMatchOnAir(match.id)) await command({ type: 'show', region: 'ticker', payload: { matchId: match.id, label: `${event.minute}'`, text } });
    }
    if (isMatchOnAir(match.id) && $('showAlert').checked) await command({ type: 'show', region: 'side-alert', payload: { matchId: match.id, label: event.label, headline: title, summary: eventSummary(event) }, durationMs: 6500 });
    log({ ok: true, event, placar: event.score, publicadoNoObs: isMatchOnAir(match.id) });
    $('player').value = ''; $('details').value = '';
  } catch (error) { log(error.message); }
  finally { publishing = false; $('publishEvent').disabled = false; }
}
function undoLast() {
  const event = state.events.shift(); if (!event) return;
  if (event.type === 'GOAL') {
    if (event.team === 'HOME') { state.homeScore = Math.max(0, state.homeScore - 1); if (event.player) state.homeScorers.pop(); }
    if (event.team === 'AWAY') { state.awayScore = Math.max(0, state.awayScore - 1); if (event.player) state.awayScorers.pop(); }
  }
  saveState(); render(); publishScoreboard().catch(error => log(error.message));
}
async function health() {
  const status = $('status');
  if (!status) return;
  try {
    const response = await fetch('/health', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const connections = Number.isFinite(Number(data.connections)) ? Number(data.connections) : 0;
    status.textContent = `Bridge online · ${connections} overlay(s)`;
    status.style.color = '#3dde78';
  } catch (error) {
    status.textContent = 'Bridge indisponível';
    status.style.color = '#ff5d5d';
    console.error('Falha no diagnóstico do Bridge:', error);
  }
}

// Ligações da interface
document.querySelectorAll('.event-type').forEach(button => button.addEventListener('click', () => { state.selectedType = button.dataset.type; saveState(); render(); }));
document.querySelectorAll('.flow').forEach(button => button.addEventListener('click', () => setPhase(button.dataset.phase)));
$('matchPhase').addEventListener('change', event => setPhase(event.target.value));
$('startClock').addEventListener('click', startClock);
$('pauseClock').addEventListener('click', pauseClock);
$('resetClock').addEventListener('click', resetClock);
$('clearCoverage').addEventListener('click', clearCoverage);
$('saveLineups').addEventListener('click', saveLineups);
['homeCoach', 'homeStarters', 'homeBench', 'awayCoach', 'awayStarters', 'awayBench'].forEach(id => {
  $(id).addEventListener('input', () => { lineupDraftDirty = true; $('lineupStatus').textContent = 'Alterações ainda não salvas.'; });
});
$('publishEvent').addEventListener('click', publishEvent);
$('undoEvent').addEventListener('click', undoLast);
$('setOnAir').addEventListener('click', async () => { setOnAirMatchId(match.id); render(); await publishScoreboard(true); });
$('endCoverage').addEventListener('click', async () => { setPhase('FINAL'); archiveCurrentCoverage('Cobertura encerrada pelo operador'); if (isMatchOnAir(match.id)) await command({ type: 'show', region: 'ticker', payload: { matchId: match.id, label: 'FIM', text: `FIM DE JOGO — ${home.shortName.toUpperCase()} ${state.homeScore} × ${state.awayScore} ${away.shortName.toUpperCase()}` } }); });

// Navegação interna: todos os caminhos visíveis levam a uma área real da tela.
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
  const target = document.getElementById(button.dataset.section);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('[data-section]').forEach(item => item.classList.toggle('active', item === button));
}));
document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.tool;
  if (type === 'note') { state.selectedType = 'INFORMATION'; $('details').focus(); }
  if (type === 'review') { state.selectedType = 'REVIEW'; $('player').focus(); }
  if (type === 'publication') location.href = '/control/editorial.html';
  saveState(); render();
}));

window.addEventListener('storage', event => {
  if (event.key === `rodrigol-coverage-v1:${match.id}`) reloadState();
  else if (event.key === 'rodrigol-on-air-match-v1' || event.key === 'rodrigol-matches-v1') render();
});
window.addEventListener('rodrigol:data-changed', event => {
  const key = event.detail?.key;
  if (key === `rodrigol-coverage-v1:${match.id}`) reloadState();
  else if (key === 'rodrigol-on-air-match-v1' || key === 'rodrigol-matches-v1') render();
});
window.addEventListener('beforeunload', () => { if (state.clockRunning) saveState(); });
setInterval(() => { $('now').textContent = new Date().toLocaleTimeString('pt-BR'); renderOtherMatches(); }, 1000);
setInterval(health, 2500);
health();
try {
  render();
  updateClockButton();
  if (state.clockRunning) ensureTickTimer();
  publishScoreboard().catch(error => log(error.message));
} catch (error) {
  console.error('Falha ao iniciar a cabine:', error);
  const status = $('status');
  if (status) {
    status.textContent = 'Cabine com erro de inicialização';
    status.style.color = '#ff5d5d';
  }
  log(error.message || String(error));
}
