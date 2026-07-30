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
  setOnAirMatchId
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
const initialState = { homeScore: 0, awayScore: 0, homeScorers: [], awayScorers: [], events: [], phase: 'PRE_GAME', elapsedSeconds: 0, clockRunning: false, clockStartedAt: null, selectedType: 'GOAL' };

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
let tickTimer = null;
let publishing = false;
let lastRenderedSecond = -1;

function effectiveElapsed(coverage = state) {
  if (!coverage.clockRunning || !coverage.clockStartedAt) return Number(coverage.elapsedSeconds) || 0;
  return (Number(coverage.elapsedSeconds) || 0) + Math.max(0, Math.floor((Date.now() - Number(coverage.clockStartedAt)) / 1000));
}
function freezeElapsed() { state.elapsedSeconds = effectiveElapsed(); state.clockStartedAt = null; }
function saveState() { saveCoverage(match.id, { ...state }); }
function reloadState() { state = { ...initialState, ...readCoverage(match.id, initialState) }; render(); updateClockButton(); if (state.clockRunning) ensureTickTimer(); else stopTickTimer(); }
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
  $('manualHome').textContent = state.homeScore;
  $('manualAway').textContent = state.awayScore;
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
  renderTimeline();
  renderOtherMatches();
  renderOnAirStatus();
}
function renderTimeline() {
  const list = $('timelineList');
  if (!state.events.length) { list.innerHTML = '<div class="empty">Nenhum evento registrado.</div>'; return; }
  list.innerHTML = state.events.map(event => `<article class="timeline-item"><b class="minute">${event.minute}'</b><span class="tag" style="background:${event.color}22;color:${event.color};border:1px solid ${event.color}66">${event.icon} ${event.label}</span><div><strong>${escapeHtml(event.player || event.title || teamName(event.team))}</strong><small>${escapeHtml(event.details || teamName(event.team))}</small></div><b class="score-after">${event.score}</b></article>`).join('');
}
function renderOtherMatches() {
  const container = $('otherMatchesList');
  const others = getMatches().filter(item => item.id !== match.id);
  if (!others.length) { container.innerHTML = '<p class="other-empty">Nenhum outro jogo cadastrado.</p>'; return; }
  const onAirId = getOnAirMatchId();
  container.innerHTML = others.map(item => {
    const coverage = { ...initialState, phase: item.status || 'PRE_GAME', ...readCoverage(item.id, initialState) };
    const itemHome = getClub(item.homeClubId) || { shortName: 'Mandante' };
    const itemAway = getClub(item.awayClubId) || { shortName: 'Visitante' };
    return `<a class="other-match ${item.id === onAirId ? 'on-air' : ''}" href="/control/?matchId=${encodeURIComponent(item.id)}">
      <span class="other-status">${coverage.clockRunning ? '● AO VIVO' : (PHASES[coverage.phase]?.period || coverage.phase)}</span>
      <span class="other-row"><b>${escapeHtml(itemHome.shortName)}</b><strong>${coverage.homeScore || 0}</strong></span>
      <span class="other-row"><b>${escapeHtml(itemAway.shortName)}</b><strong>${coverage.awayScore || 0}</strong></span>
      <span class="other-clock">${formatClock(effectiveElapsed(coverage))}${item.id === onAirId ? ' · NO AR' : ''}</span>
    </a>`;
  }).join('');
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
  updateClockButton(); stopTickTimer(); saveState(); render(); publishScoreboard().catch(error => log(error.message));
}
function resetClock() { if (state.clockRunning) freezeElapsed(); state.clockRunning = false; state.elapsedSeconds = 0; state.clockStartedAt = null; stopTickTimer(); saveState(); render(); updateClockButton(); publishScoreboard().catch(error => log(error.message)); }
function setPhase(value) {
  if (state.clockRunning && (value === 'HALFTIME' || value === 'FINAL')) freezeElapsed();
  state.phase = value;
  if (value === 'HALFTIME' || value === 'FINAL') { state.clockRunning = false; stopTickTimer(); }
  if (value === 'FIRST_HALF' && effectiveElapsed() >= 45 * 60) { state.elapsedSeconds = 0; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  if (value === 'SECOND_HALF' && effectiveElapsed() < 45 * 60) { state.elapsedSeconds = 45 * 60; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  saveState(); render(); updateClockButton(); publishScoreboard().catch(error => log(error.message));
}
function makeEvent() {
  const meta = EVENT_META[state.selectedType];
  return { id: crypto.randomUUID?.() || String(Date.now()), type: state.selectedType, label: meta.label, icon: meta.icon, color: meta.color, minute: currentMinute(), team: $('team').value, player: $('player').value.trim(), details: $('details').value.trim(), createdAt: new Date().toISOString() };
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
    const event = makeEvent(); applyEvent(event); saveState(); render(); await publishScoreboard();
    const title = event.type === 'GOAL' ? `GOL DO ${teamName(event.team).toUpperCase()}!` : event.label;
    const text = [title, event.player, event.details].filter(Boolean).join(' — ');
    $('newsflashText').textContent = text;
    if (isMatchOnAir(match.id) && $('showTicker').checked) await command({ type: 'show', region: 'ticker', payload: { matchId: match.id, label: `${event.minute}'`, text } });
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
document.querySelectorAll('[data-score]').forEach(button => button.addEventListener('click', () => { const [side, delta] = button.dataset.score.split(':'); const key = side === 'home' ? 'homeScore' : 'awayScore'; state[key] = Math.max(0, state[key] + Number(delta)); saveState(); render(); publishScoreboard().catch(error => log(error.message)); }));
document.querySelectorAll('.flow').forEach(button => button.addEventListener('click', () => setPhase(button.dataset.phase)));
$('matchPhase').addEventListener('change', event => setPhase(event.target.value));
$('startClock').addEventListener('click', startClock);
$('pauseClock').addEventListener('click', pauseClock);
$('resetClock').addEventListener('click', resetClock);
$('publishEvent').addEventListener('click', publishEvent);
$('undoEvent').addEventListener('click', undoLast);
$('setOnAir').addEventListener('click', async () => { setOnAirMatchId(match.id); render(); await publishScoreboard(true); });
$('endCoverage').addEventListener('click', async () => { setPhase('FINAL'); if (isMatchOnAir(match.id)) await command({ type: 'show', region: 'ticker', payload: { matchId: match.id, label: 'FIM', text: `FIM DE JOGO — ${home.shortName.toUpperCase()} ${state.homeScore} × ${state.awayScore} ${away.shortName.toUpperCase()}` } }); });

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
