import { publishCommand } from './bridge-client.js';
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
  upsertMatch
} from './data-store.js';
import {
  buildClockTickPatch,
  buildMatchPresentationPayload,
  deriveVisualState,
  formatClockSeconds,
  getEffectiveElapsedSeconds,
  normalizeCoverage,
  shouldShowClock
} from './match-presentation.js';
import { finishMatch, migrateMatchLifecycle, syncMatchFromCoverage, transitionMatch } from './match-lifecycle.js';
import { publishStudioSnapshot, publishStudioLiveUpdate, scheduleStudioSnapshot } from './studio-regions.js';
import { lookupCurrentWeather } from './weather-service.js';

import { applySubstitution, normalizeOperationalLineups, rebuildOperationalLineups, substitutionOptions, substitutionText } from './substitution-engine.js';
const $ = id => document.getElementById(id);migrateMatchLifecycle();
const PHASES = {
  PRE_GAME: { label: 'PRÉ-JOGO', period: 'PRÉ-JOGO' },
  FIRST_HALF: { label: 'AO VIVO', period: '1º TEMPO' },
  LIVE_UNKNOWN: { label: 'AO VIVO', period: 'EM ANDAMENTO' },
  HALFTIME: { label: 'INTERVALO', period: 'INTERVALO' },
  SECOND_HALF: { label: 'AO VIVO', period: '2º TEMPO' },
  EXTRA_TIME: { label: 'AO VIVO', period: 'PRORROGAÇÃO' },
  PENALTIES: { label: 'PÊNALTIS', period: 'PÊNALTIS' },
  FINAL: { label: 'FINALIZADA', period: 'FIM DE JOGO' }
};
const EVENT_META = {
  GOAL: { label: 'GOL', icon: '⚽', color: '#18833a' },
  PENALTY_SCORED: { label: 'PÊNALTI CONVERTIDO', icon: '✅', color: '#18833a' },
  PENALTY_MISSED: { label: 'PÊNALTI PERDIDO', icon: '❌', color: '#9d2429' },
  YELLOW_CARD: { label: 'CARTÃO AMARELO', icon: '🟨', color: '#a48700' },
  RED_CARD: { label: 'CARTÃO VERMELHO', icon: '🟥', color: '#9d2429' },
  SUBSTITUTION: { label: 'SUBSTITUIÇÃO', icon: '🔁', color: '#216ba0' },
  VAR: { label: 'VAR', icon: '▣', color: '#6a3b8d' },
  INFORMATION: { label: 'INFORMAÇÃO', icon: 'ⓘ', color: '#287596' },
  REVIEW: { label: 'APURAÇÃO', icon: '⌕', color: '#52616b' }
};
const initialState = { homeScore: 0, awayScore: 0, penaltiesHome: 0, penaltiesAway: 0, homeScorers: [], awayScorers: [], events: [], phase: 'PRE_GAME', elapsedSeconds: 0, clockRunning: false, clockStartedAt: null, selectedType: 'GOAL', referee: '', attendance: '', weather: '', lineups: { home: { coach: '', starters: [], bench: [] }, away: { coach: '', starters: [], bench: [] } } };
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
let state = { ...initialState, ...normalizeCoverage(match, readCoverage(match.id, initialState)) };
state.lineups = normalizeOperationalLineups({ home: { ...initialState.lineups.home, ...(state.lineups?.home || {}) }, away: { ...initialState.lineups.away, ...(state.lineups?.away || {}) } });
let tickTimer = null;
let publishing = false;
let lastRenderedSecond = -1;

function effectiveElapsed(coverage = state) {
  return getEffectiveElapsedSeconds(coverage);
}
function freezeElapsed() { state.elapsedSeconds = effectiveElapsed(); state.clockStartedAt = null; }
let lastLocalMutationAt=0;
function saveState() { lastLocalMutationAt=Date.now(); const result=syncMatchFromCoverage(match.id,{ ...state, updatedAt: new Date().toISOString() }); if(result) match=result.match; }
function reloadState() { state = { ...initialState, ...normalizeCoverage(match, readCoverage(match.id, initialState)) }; state.lineups = normalizeOperationalLineups({ home: { ...initialState.lineups.home, ...(state.lineups?.home || {}) }, away: { ...initialState.lineups.away, ...(state.lineups?.away || {}) } }); render(); updateClockButton(); if (state.clockRunning) ensureTickTimer(); else stopTickTimer(); }
function log(value) { $('log').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
async function command(body) { return publishCommand(body); }
function formatClock(seconds) { return formatClockSeconds(seconds); }
function phase() { return deriveVisualState(match, state); }
function teamName(team) { return team === 'HOME' ? home.shortName : team === 'AWAY' ? away.shortName : 'Neutro'; }
function currentMinute() { return Number($('minute').value) || Math.floor(effectiveElapsed() / 60); }
function eventSummary(event) { if(event.type==='SUBSTITUTION')return substitutionText(event); return [event.player, event.details].filter(Boolean).join(' · '); }
function substitutionLineupsSource(){
  const persisted=readCoverage(match.id,initialState)?.lineups||{};
  const source={
    home:{
      ...(persisted.home||{}),
      ...(state.lineups?.home||{}),
      starters:lines($('homeStarters')?.value||'').length?lines($('homeStarters').value):((state.lineups?.home?.starters||persisted.home?.starters||[])),
      bench:lines($('homeBench')?.value||'').length?lines($('homeBench').value):((state.lineups?.home?.bench||persisted.home?.bench||[]))
    },
    away:{
      ...(persisted.away||{}),
      ...(state.lineups?.away||{}),
      starters:lines($('awayStarters')?.value||'').length?lines($('awayStarters').value):((state.lineups?.away?.starters||persisted.away?.starters||[])),
      bench:lines($('awayBench')?.value||'').length?lines($('awayBench').value):((state.lineups?.away?.bench||persisted.away?.bench||[]))
    }
  };
  return rebuildOperationalLineups(normalizeOperationalLineups(source),state.events);
}
function updateDatalistStable(list,values=[]){
  if(!list)return;
  const normalized=values.map(value=>String(value||''));
  const signature=JSON.stringify(normalized);
  if(list.dataset.signature===signature)return;
  list.dataset.signature=signature;
  list.innerHTML=normalized.map(player=>`<option value="${escapeHtml(player)}"></option>`).join('');
}
function renderEventPlayerOptions(){
  const list=$('eventPlayerList'),input=$('player');
  if(!list||!input)return;
  const selectable=['GOAL','YELLOW_CARD','RED_CARD'].includes(state.selectedType);
  const selectedTeam=$('team')?.value||'HOME';
  if(!selectable||selectedTeam==='NEUTRAL'){
    list.innerHTML='';
    input.placeholder='Nome do jogador ou título';
    return;
  }
  const source=substitutionLineupsSource();
  const lineup=selectedTeam==='AWAY'?source.away:source.home;
  const players=(lineup?.onField?.length?lineup.onField:lineup?.starters)||[];
  updateDatalistStable(list,players);
  input.placeholder=players.length?`Selecione ou digite (${players.length} em campo)`:'Digite o nome do jogador';
}
function renderSubstitutionFields(){
  renderEventPlayerOptions();
  const active=state.selectedType==='SUBSTITUTION',box=$('substitutionFields'),generic=$('genericPlayerField');
  if(!box)return;
  box.hidden=!active;
  if(generic)generic.hidden=active;
  if(!active)return;

  const team=$('team').value==='AWAY'?'AWAY':'HOME';
  const source=substitutionLineupsSource();
  const options=substitutionOptions(source,team);
  const outInput=$('substitutionOut'),inInput=$('substitutionIn');
  const outList=$('substitutionOutList'),inList=$('substitutionInList');

  updateDatalistStable(outList,options.outPlayers);
  updateDatalistStable(inList,options.inPlayers);

  outInput.placeholder=options.outPlayers.length
    ?`Selecione ou digite (${options.outPlayers.length} em campo)`
    :'Digite manualmente quem sai';
  inInput.placeholder=options.inPlayers.length
    ?`Selecione ou digite (${options.inPlayers.length} reservas)`
    :'Digite manualmente quem entra';

  outInput.dataset.available=String(options.outPlayers.length);
  inInput.dataset.available=String(options.inPlayers.length);
}
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
function systemTimelineGroup(type = '') {
  if (['SECOND_HALF', 'SECOND_HALF_START'].includes(type)) return 'SECOND_HALF';
  if (['MATCH_START', 'MATCH_START_UNKNOWN'].includes(type)) return 'MATCH_START';
  return type;
}
function addSystemTimelineEvent(type, label, icon, details = '') {
  const group = systemTimelineGroup(type);
  const now = Date.now();
  const duplicate = state.events.find(event => event.system && systemTimelineGroup(event.type) === group && now - new Date(event.createdAt || 0).getTime() < 15000);
  if (duplicate) return false;
  const event = normalizedTimelineEvent({
    id: crypto.randomUUID?.() || String(Date.now()), type, label, icon, color: '#18394a',
    minute: Math.floor(effectiveElapsed() / 60), team: 'NEUTRAL', player: '', details,
    createdAt: new Date().toISOString(), score: `${state.homeScore} × ${state.awayScore}`, system: true
  });
  state.events.unshift(event);
  return true;
}

function scoreboardPayload() {
  const presentation = buildMatchPresentationPayload(match, state);
  return {
    matchId: match.id,
    competition: [match.competition, match.round].filter(Boolean).join(' · ').toUpperCase(),
    homeName: home.shortName.toUpperCase(), awayName: away.shortName.toUpperCase(),
    homeShort: home.abbreviation, awayShort: away.abbreviation,
    homeCrest: crestPayload(home), awayCrest: crestPayload(away),
    homeScore: state.homeScore, awayScore: state.awayScore,
    penaltiesHome: Number(state.penaltiesHome)||0, penaltiesAway: Number(state.penaltiesAway)||0,
    homeScorers: state.homeScorers.join(' · ') || '—', awayScorers: state.awayScorers.join(' · ') || '—',
    ...presentation,
    venue: match.venue || match.city || 'Local não informado',
    referee: state.referee || match.referee || '',
    attendance: state.attendance || match.attendance || '',
    weather: state.weather || match.weather || '',
    chronology: state.events.slice(0, 8),
    lineups: state.lineups
  };
}
let scoreboardFullPublished=false;
function scoreboardDynamicPayload(){
  const payload=scoreboardPayload();
  const dynamic={...payload};
  for(const key of ['homeCrest','awayCrest','homeName','awayName','homeShort','awayShort','competition','venue'])delete dynamic[key];
  return dynamic;
}
async function publishScoreboard(force = false) {
  if (!force && !isMatchOnAir(match.id)) return;
  const full=force||!scoreboardFullPublished;
  await command({ type: full?'show':'update', region: 'scoreboard', payload: full?scoreboardPayload():scoreboardDynamicPayload() });
  scoreboardFullPublished=true;
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
  $('clockText').textContent = shouldShowClock(currentPhase) ? formatClock(elapsed) : '';
  $('matchStatusBadge').textContent = currentPhase.status;
  $('periodLabel').textContent = currentPhase.period;
  $('coverageStatus').textContent = currentPhase.status;
  $('matchPhase').value = state.phase;
  $('eventCount').textContent = state.events.length;
  if (document.activeElement !== $('minute')) $('minute').value = Math.floor(elapsed / 60);
  document.querySelectorAll('.event-type').forEach(button => button.classList.toggle('active', button.dataset.type === state.selectedType));
  renderMatchFacts();
  renderLineups();
  renderSubstitutionFields();
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
function renderMatchFacts() {
  if (document.activeElement !== $('matchReferee')) $('matchReferee').value = state.referee || match.referee || '';
  if (document.activeElement !== $('matchAttendance')) $('matchAttendance').value = state.attendance || match.attendance || '';
  if (document.activeElement !== $('matchWeather')) $('matchWeather').value = state.weather || match.weather || '';
}

async function fetchCurrentMatchWeather() {
  const button = $('fetchMatchWeather');
  const status = $('matchWeatherLookupStatus');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Consultando...';
  status.textContent = 'Localizando o estádio/cidade e consultando a temperatura atual...';
  try {
    const result = await lookupCurrentWeather({ match, homeClub: home });
    $('matchWeather').value = result.value;
    status.textContent = `${result.value} · ${result.locationLabel} · Open-Meteo. Clique em “Salvar dados” para publicar.`;
  } catch (error) {
    status.textContent = `Consulta automática indisponível: ${error.message} O preenchimento manual continua funcionando.`;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function saveMatchFacts() {
  const button = $('saveMatchFacts');
  const originalText = button.textContent;
  button.disabled = true;
  try {
    state.referee = $('matchReferee').value.trim();
    state.attendance = $('matchAttendance').value.trim();
    state.weather = $('matchWeather').value.trim();
    match = { ...match, referee: state.referee, attendance: state.attendance, weather: state.weather, updatedAt: new Date().toISOString() };
    upsertMatch(match);
    saveState();
    const onAir = isMatchOnAir(match.id);
    $('matchFactsStatus').textContent = onAir ? 'Dados salvos e atualizados no overlay.' : 'Dados salvos. Eles aparecerão quando esta partida entrar no ar.';
    button.textContent = '✓ Salvo';
    await publishScoreboard();
    await publishStudioSnapshot();
    log({ ok: true, matchId: match.id, referee: state.referee, attendance: state.attendance, weather: state.weather });
  } catch (error) {
    $('matchFactsStatus').textContent = `Não foi possível salvar: ${error.message}`;
    log(error.message);
  } finally {
    setTimeout(() => { button.disabled = false; button.textContent = originalText; }, 1200);
  }
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
function lines(value) { return String(value || '').split(/\r?\n|;\s*|,\s*(?=\d{1,3}(?:[.\s]|$)|[A-ZÀ-Ý])/).map(item => item.trim()).filter(Boolean); }
function saveLineups() {
  const button = $('saveLineups');
  button.disabled = true;
  const originalText = button.textContent;
  try {
    state.lineups = rebuildOperationalLineups({
      home: { coach: $('homeCoach').value.trim(), starters: lines($('homeStarters').value), bench: lines($('homeBench').value) },
      away: { coach: $('awayCoach').value.trim(), starters: lines($('awayStarters').value), bench: lines($('awayBench').value) }
    },state.events);
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
    if(event.type==='PENALTY_SCORED'){ if(event.team==='HOME')penaltiesHome+=1; if(event.team==='AWAY')penaltiesAway+=1; }
    event.score = `${homeScore} × ${awayScore}`;
  });
  state.homeScore = homeScore; state.awayScore = awayScore; state.penaltiesHome=penaltiesHome; state.penaltiesAway=penaltiesAway; state.homeScorers = homeScorers; state.awayScorers = awayScorers;
  state.lineups = rebuildOperationalLineups(state.lineups,state.events);
}
function editEvent(id) {
  const event = state.events.find(item => item.id === id); if (!event) return;
  editingEventId = id; state.selectedType = event.type; render();
  $('minute').value = event.minute; $('team').value = event.team; renderSubstitutionFields();
  if(event.type==='SUBSTITUTION'){
    renderSubstitutionFields();
    $('substitutionOut').value=event.substitutionOut||'';
    $('substitutionIn').value=event.substitutionIn||'';
  }else $('player').value = event.player || event.title || '';
  $('details').value = event.type==='SUBSTITUTION'?'':(event.details || '');
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
function matchOperationalMeta(item, coverage) {
  const visual = deriveVisualState(item, coverage);
  const phase = String(visual.phase || coverage.phase || item.status || 'SCHEDULED').toUpperCase();
  const final = ['FINAL', 'FINISHED', 'CONFIRMED', 'ARCHIVED'].includes(phase) || Boolean(item.archivedAt);
  const live = ['FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME', 'LIVE_UNKNOWN'].includes(phase);
  const halftime = phase === 'HALFTIME';
  const preGame = phase === 'PRE_GAME';
  const scheduled = phase === 'SCHEDULED';
  const dateTime = new Date(`${item.date || ''}T${item.time || '00:00'}:00`);
  const minutesToStart = Number.isNaN(dateTime.getTime()) ? Infinity : Math.round((dateTime.getTime() - Date.now()) / 60000);
  let priority = 50;
  if (live) priority = 0;
  else if (halftime) priority = 1;
  else if (preGame || (scheduled && minutesToStart >= -10 && minutesToStart <= 30)) priority = 2;
  else if (scheduled) priority = 3;
  else if (final) priority = 9;
  return { visual, phase, final, live, halftime, preGame, scheduled, minutesToStart, priority };
}
function latestOperationalEvent(coverage) {
  const event = Array.isArray(coverage.events) ? coverage.events[0] : null;
  if (!event) return '';
  const label = event.label || event.type || 'INFORMAÇÃO';
  const author = event.player || event.title || '';
  return `${event.icon || ''} ${label}${author ? ` · ${author}` : ''}`.trim();
}
function renderOtherMatches() {
  const container = $('otherMatchesList');
  const right = $('otherMatchesRight');
  const onAirId = getOnAirMatchId();
  const rows = getMatches().filter(item => item.id !== match.id).map(item => {
    const coverage = normalizeCoverage(item, readCoverage(item.id, initialState));
    return { item, coverage, meta: matchOperationalMeta(item, coverage) };
  });
  const operational = rows.filter(row => !row.meta.final).sort((a,b) => a.meta.priority - b.meta.priority || String(a.item.date || '').localeCompare(String(b.item.date || '')) || String(a.item.time || '').localeCompare(String(b.item.time || '')));
  const finishedToday = rows.filter(row => row.meta.final && String(row.item.finishedAt || row.coverage.updatedAt || '').slice(0,10) === new Date().toISOString().slice(0,10));
  const crestMarkup = club => club.crestDataUrl
    ? `<span class="other-crest"><img src="${escapeHtml(club.crestDataUrl)}" alt="${escapeHtml(club.shortName)}"></span>`
    : `<span class="other-crest" style="background:${escapeHtml(club.primaryColor || '#18394a')};color:${escapeHtml(club.secondaryColor || '#fff')}">${escapeHtml(club.crestText || club.abbreviation || '?')}</span>`;
  const card = ({item, coverage, meta}) => {
    const itemHome = getClub(item.homeClubId) || { shortName: 'Mandante' };
    const itemAway = getClub(item.awayClubId) || { shortName: 'Visitante' };
    const recent = latestOperationalEvent(coverage);
    const recentEvent = Array.isArray(coverage.events) ? coverage.events[0] : null;
    const recentAt = new Date(recentEvent?.createdAt || 0).getTime();
    const urgent = recentEvent && ['GOAL','RED_CARD','VAR'].includes(recentEvent.type) && Date.now() - recentAt < 180000;
    const pausedLive = meta.live && shouldShowClock(meta.visual) && !coverage.clockRunning;
    const attention = urgent ? 'ATENÇÃO' : pausedLive ? 'RELÓGIO PAUSADO' : '';
    const liveClock = shouldShowClock(meta.visual) ? formatClock(effectiveElapsed(coverage)) : '';
    const status = meta.live ? `● ${meta.visual.period}` : meta.halftime ? 'INTERVALO' : meta.preGame ? 'EM PREPARAÇÃO' : meta.scheduled ? (meta.minutesToStart <= 30 ? `COMEÇA EM ${Math.max(0, meta.minutesToStart)} MIN` : `${item.date || ''} ${item.time || ''}`.trim()) : meta.visual.period;
    const primaryAction = meta.live || meta.halftime ? 'ASSUMIR' : meta.preGame || meta.scheduled ? 'PREPARAR' : 'ABRIR';
    return `<article class="other-match operational-card ${item.id === onAirId ? 'on-air' : ''} ${attention ? 'needs-attention' : ''}" data-match-card="${item.id}">
      <span class="other-context">${escapeHtml([item.competition,item.round].filter(Boolean).join(' · '))}</span>
      <span class="other-status">${escapeHtml(status)}${item.id === onAirId ? ' · NO AR' : ''}${attention ? ` · ${escapeHtml(attention)}` : ''}</span>
      <span class="other-team-row">${crestMarkup(itemHome)}<b>${escapeHtml(itemHome.shortName)}</b><strong>${coverage.homeScore || 0}</strong></span>
      <span class="other-team-row">${crestMarkup(itemAway)}<b>${escapeHtml(itemAway.shortName)}</b><strong>${coverage.awayScore || 0}</strong></span>
      <span class="other-clock">${escapeHtml(liveClock)}</span>
      ${recent ? `<span class="other-recent">${escapeHtml(recent)}</span>` : ''}
      <span class="other-actions"><button type="button" data-open-other="${item.id}">${primaryAction}</button><button type="button" data-air-other="${item.id}" ${item.id === onAirId ? 'disabled' : ''}>COLOCAR NO AR</button></span>
    </article>`;
  };
  const mainMarkup = operational.length ? operational.map(card).join('') : '<p class="other-empty">Nenhum outro jogo exige operação agora.</p>';
  const footer = `<div class="operational-footer"><button type="button" id="toggleFinishedToday">FINALIZADOS HOJE (${finishedToday.length})</button><a href="/control/archive.html">ABRIR ARQUIVO OPERACIONAL</a></div><div id="finishedTodayList" class="finished-today" hidden>${finishedToday.length ? finishedToday.map(card).join('') : '<p class="other-empty">Nenhum jogo finalizado hoje.</p>'}</div>`;
  const markup = mainMarkup + footer;
  if (container) container.innerHTML = markup;
  if (right) right.innerHTML = markup;
  document.querySelectorAll('[data-open-other]').forEach(button => button.onclick = () => {
    setActiveMatchId(button.dataset.openOther);
    location.href = `/control/?matchId=${encodeURIComponent(button.dataset.openOther)}`;
  });
  document.querySelectorAll('[data-air-other]').forEach(button => button.onclick = () => {
    const id = button.dataset.airOther;
    setActiveMatchId(id); setOnAirMatchId(id);
    location.href = `/control/?matchId=${encodeURIComponent(id)}&takeOnAir=1`;
  });
  document.querySelectorAll('#toggleFinishedToday').forEach(button => button.onclick = () => {
    const list = button.parentElement?.nextElementSibling;
    if (list) list.hidden = !list.hidden;
  });
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
  saveState(); render(); updateClockButton(); ensureTickTimer(); publishScoreboard().catch(error => log(error.message)); publishStudioSnapshot().catch(error => log(error.message));
}
function renderClockTick() {
  const currentPhase = phase();
  const elapsed = effectiveElapsed();
  $('clockText').textContent = shouldShowClock(currentPhase) ? formatClock(elapsed) : '';
  if (document.activeElement !== $('minute')) $('minute').value = Math.floor(elapsed / 60);
}
function ensureTickTimer() {
  if (tickTimer) return;
  tickTimer = setInterval(async () => {
    const second = effectiveElapsed();
    if (second === lastRenderedSecond) return;
    lastRenderedSecond = second;
    renderClockTick();
    if (!isMatchOnAir(match.id)) return;
    try { await command({ type: 'update', region: 'scoreboard', payload: buildClockTickPatch(match, state) }); } catch { /* diagnóstico mantém a cabine operacional */ }
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
  if (state.clockRunning && (value === 'HALFTIME' || value === 'FINAL' || value === 'LIVE_UNKNOWN')) freezeElapsed();
  const previousPhase = state.phase;
  state.phase = value;
  if (value === 'HALFTIME' || value === 'FINAL' || value === 'LIVE_UNKNOWN') { state.clockRunning = false; stopTickTimer(); }
  if (previousPhase !== value) {
    if (value === 'LIVE_UNKNOWN') addSystemTimelineEvent('MATCH_START_UNKNOWN', 'EM ANDAMENTO', '▶', 'Partida em andamento sem relógio confirmado');
    if (value === 'HALFTIME') addSystemTimelineEvent('HALFTIME', 'INTERVALO', '⏸', 'Fim do primeiro tempo');
    if (value === 'SECOND_HALF') addSystemTimelineEvent('SECOND_HALF', 'SEGUNDO TEMPO', '▶', 'Recomeço da partida');
    if (value === 'FINAL') addSystemTimelineEvent('FINAL', 'FIM DE JOGO', '✓', `${home.shortName} ${state.homeScore} × ${state.awayScore} ${away.shortName}`);
  }
  if (value === 'FIRST_HALF' && effectiveElapsed() >= 45 * 60) { state.elapsedSeconds = 0; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  if (value === 'SECOND_HALF' && effectiveElapsed() < 45 * 60) { state.elapsedSeconds = 45 * 60; state.clockStartedAt = state.clockRunning ? Date.now() : null; }
  if(value==='FINAL'){const result=finishMatch(match.id,state);if(result){match=result.match;state={...state,...result.coverage};}}else{const result=transitionMatch(match.id,value,state);if(result){match=result.match;state={...state,...result.coverage};}}
  render(); updateClockButton(); publishScoreboard().catch(error => log(error.message)); publishStudioSnapshot().catch(error => log(error.message));
}
function makeEvent() {
  const meta = EVENT_META[state.selectedType],createdAt=new Date().toISOString(),id=crypto.randomUUID?.() || String(Date.now());
  const base={id,type:state.selectedType,label:meta.label,icon:meta.icon,color:meta.color,minute:currentMinute(),team:$('team').value,player:$('player').value.trim(),details:$('details').value.trim(),createdAt};
  if(state.selectedType==='SUBSTITUTION'){
    const substitutionOut=$('substitutionOut').value,substitutionIn=$('substitutionIn').value;
    if(!substitutionOut||!substitutionIn)throw new Error('Selecione quem sai e quem entra.');
    return normalizedTimelineEvent({...base,player:substitutionIn,substitutionOut,substitutionIn,details:`ENTRA ${substitutionIn} · SAI ${substitutionOut}`});
  }
  return normalizedTimelineEvent(base);
}
function applyEvent(event) {
  if (event.type === 'GOAL') {
    if (event.team === 'HOME') { state.homeScore++; if (event.player) state.homeScorers.push(`${event.minute}' ${event.player}`); }
    if (event.team === 'AWAY') { state.awayScore++; if (event.player) state.awayScorers.push(`${event.minute}' ${event.player}`); }
  }
  if(event.type==='PENALTY_SCORED'){
    if(state.phase!=='PENALTIES')throw new Error('Marque a fase PÊNALTIS antes de registrar cobranças.');
    if(event.team==='HOME')state.penaltiesHome=(Number(state.penaltiesHome)||0)+1;
    if(event.team==='AWAY')state.penaltiesAway=(Number(state.penaltiesAway)||0)+1;
  }
  if(event.type==='PENALTY_MISSED'&&state.phase!=='PENALTIES')throw new Error('Marque a fase PÊNALTIS antes de registrar cobranças.');
  if (event.type === 'SUBSTITUTION') {
    if(!['HOME','AWAY'].includes(event.team))throw new Error('A substituição precisa pertencer ao mandante ou visitante.');
    const side=event.team==='AWAY'?'away':'home';
    let operational=substitutionLineupsSource();
    const outgoing=String(event.substitutionOut||'').trim(),incoming=String(event.substitutionIn||'').trim();
    if(outgoing&&!operational[side].onField.includes(outgoing))operational[side].onField=[...operational[side].onField,outgoing];
    if(incoming&&!operational[side].bench.includes(incoming))operational[side].bench=[...operational[side].bench,incoming];
    state.lineups=applySubstitution(operational,event.team,outgoing,incoming,event);
  }
  event.score = state.phase==='PENALTIES'&&['PENALTY_SCORED','PENALTY_MISSED'].includes(event.type)?`PÊNALTIS ${Number(state.penaltiesHome)||0} × ${Number(state.penaltiesAway)||0}`:`${state.homeScore} × ${state.awayScore}`;
  state.events.unshift(event);
}
function renderEventFast(){
  $('homeScoreText').textContent=state.homeScore;
  $('awayScoreText').textContent=state.awayScore;
  $('homeScorers').textContent=state.homeScorers.join(' · ')||'—';
  $('awayScorers').textContent=state.awayScorers.join(' · ')||'—';
  $('eventCount').textContent=state.events.length;
  document.querySelectorAll('.event-type').forEach(button=>button.classList.toggle('active',button.dataset.type===state.selectedType));
  renderTimeline();
  renderOnAirStatus();
}
async function publishEvent() {
  if (publishing) return;
  publishing = true; $('publishEvent').disabled = true;
  try {
    const event = makeEvent();
    if (editingEventId) { const index = state.events.findIndex(item => item.id === editingEventId); if (index >= 0) { event.id = editingEventId; state.events[index] = event; rebuildFromEvents(); } editingEventId = null; $('publishEvent').textContent = '⚡ REGISTRAR & PUBLICAR'; } else { applyEvent(event); }
    saveState(); renderEventFast();
    Promise.allSettled([publishScoreboard(),publishStudioLiveUpdate()]).then(results=>{for(const result of results)if(result.status==='rejected')log(result.reason?.message||String(result.reason));});
    scheduleStudioSnapshot(2500);
    const title = event.type === 'GOAL' ? `GOL DO ${teamName(event.team).toUpperCase()}!` : event.label;
    const scoreText = `${home.shortName} ${state.homeScore} x ${state.awayScore} ${away.shortName}`;
    const text = event.type === 'GOAL' ? [title, event.player, scoreText].filter(Boolean).join(' — ') : [title, event.player, event.details].filter(Boolean).join(' — ');
    $('newsflashText').textContent = text;
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
  if(event.type==='PENALTY_SCORED'){if(event.team==='HOME')state.penaltiesHome=Math.max(0,(Number(state.penaltiesHome)||0)-1);if(event.team==='AWAY')state.penaltiesAway=Math.max(0,(Number(state.penaltiesAway)||0)-1);}
  if(event.type==='SUBSTITUTION')state.lineups=rebuildOperationalLineups(state.lineups,state.events);
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
document.querySelectorAll('.event-type').forEach(button => button.addEventListener('click', () => { state.selectedType = button.dataset.type; document.querySelectorAll('.event-type').forEach(item=>item.classList.toggle('active',item===button)); renderSubstitutionFields(); renderEventPlayerOptions(); }));
document.querySelectorAll('.flow').forEach(button => button.addEventListener('click', () => setPhase(button.dataset.phase)));
$('matchPhase').addEventListener('change', event => setPhase(event.target.value));
$('startClock').addEventListener('click', startClock);
$('pauseClock').addEventListener('click', pauseClock);
$('resetClock').addEventListener('click', resetClock);
$('clearCoverage').addEventListener('click', clearCoverage);
$('saveLineups').addEventListener('click', saveLineups);
$('saveMatchFacts').addEventListener('click', saveMatchFacts);
$('fetchMatchWeather').addEventListener('click', fetchCurrentMatchWeather);
['homeCoach', 'homeStarters', 'homeBench', 'awayCoach', 'awayStarters', 'awayBench'].forEach(id => {
  $(id).addEventListener('input', () => { lineupDraftDirty = true; $('lineupStatus').textContent = 'Alterações ainda não salvas.'; });
});
$('team').addEventListener('change',()=>{renderSubstitutionFields();renderEventPlayerOptions();});
$('publishEvent').addEventListener('click', publishEvent);
$('undoEvent').addEventListener('click', undoLast);
$('setOnAir').addEventListener('click', async () => { setOnAirMatchId(match.id); render(); await publishScoreboard(true); });
$('endCoverage').addEventListener('click', async () => { setPhase('FINAL'); archiveCurrentCoverage('Cobertura encerrada pelo operador'); await publishScoreboard(true); await publishStudioSnapshot(); });

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
  document.querySelectorAll('.event-type').forEach(item=>item.classList.toggle('active',item.dataset.type===state.selectedType)); renderSubstitutionFields(); renderEventPlayerOptions();
}));

window.addEventListener('storage', event => {
  if (event.key === `rodrigol-coverage-v1:${match.id}`) reloadState();
  else if (event.key === 'rodrigol-on-air-match-v1' || event.key === 'rodrigol-matches-v1') render();
});
window.addEventListener('rodrigol:data-changed', event => {
  const key = event.detail?.key;
  if (key === `rodrigol-coverage-v1:${match.id}`) { if(publishing||Date.now()-lastLocalMutationAt<1200)return; reloadState(); }
  else if (key === 'rodrigol-on-air-match-v1' || key === 'rodrigol-matches-v1') render();
});
window.addEventListener('beforeunload', () => { if (state.clockRunning) saveState(); });
setInterval(() => { $('now').textContent = new Date().toLocaleTimeString('pt-BR'); if(!document.hidden)renderOtherMatches(); }, 15000);
setInterval(() => { if(!document.hidden)health(); }, 30000);
health();
try {
  render();
  updateClockButton();
  if (state.clockRunning) ensureTickTimer();
  const takeOnAir = new URLSearchParams(location.search).get('takeOnAir') === '1';
  if (takeOnAir) {
    setOnAirMatchId(match.id);
    publishScoreboard(true).then(() => publishStudioSnapshot()).catch(error => log(error.message));
    const cleanUrl = new URL(location.href); cleanUrl.searchParams.delete('takeOnAir'); history.replaceState(null, '', cleanUrl);
  } else publishScoreboard().catch(error => log(error.message));
} catch (error) {
  console.error('Falha ao iniciar a cabine:', error);
  const status = $('status');
  if (status) {
    status.textContent = 'Cabine com erro de inicialização';
    status.style.color = '#ff5d5d';
  }
  log(error.message || String(error));
}
