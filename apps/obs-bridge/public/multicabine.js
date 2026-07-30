import { getMatches, getClub, readCoverage, saveCoverage, setActiveMatchId, getOnAirMatchId, setOnAirMatchId } from './data-store.js';

const $ = id => document.getElementById(id);
const phases = { PRE_GAME: 'PRÉ-JOGO', FIRST_HALF: '1º TEMPO', HALFTIME: 'INTERVALO', SECOND_HALF: '2º TEMPO', EXTRA_TIME: 'PRORROGAÇÃO', PENALTIES: 'PÊNALTIS', FINAL: 'FINALIZADA' };
const fallbackCoverage = { homeScore: 0, awayScore: 0, homeScorers: [], awayScorers: [], phase: 'PRE_GAME', elapsedSeconds: 0, clockRunning: false, clockStartedAt: null, events: [] };
let lastPublishedSignature = '';
let publishingOnAir = false;

function esc(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function elapsed(coverage) { const base = Number(coverage.elapsedSeconds) || 0; if (!coverage.clockRunning || !coverage.clockStartedAt) return base; return base + Math.max(0, Math.floor((Date.now() - Number(coverage.clockStartedAt)) / 1000)); }
function fmt(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function coverage(match) { return { ...fallbackCoverage, phase: match.status || 'PRE_GAME', ...readCoverage(match.id, fallbackCoverage) }; }
function persist(match, state) { saveCoverage(match.id, state); render(); if (match.id === getOnAirMatchId()) publishOnAir(true); }

function phaseMeta(value) {
  const table = {
    PRE_GAME: { status: 'PRÉ-JOGO', period: 'PRÉ-JOGO' },
    FIRST_HALF: { status: 'AO VIVO', period: '1º TEMPO' },
    HALFTIME: { status: 'INTERVALO', period: 'INTERVALO' },
    SECOND_HALF: { status: 'AO VIVO', period: '2º TEMPO' },
    EXTRA_TIME: { status: 'AO VIVO', period: 'PRORROGAÇÃO' },
    PENALTIES: { status: 'PÊNALTIS', period: 'PÊNALTIS' },
    FINAL: { status: 'FINALIZADA', period: 'FIM DE JOGO' }
  };
  return table[value] || table.PRE_GAME;
}
function crestPayload(club) {
  return {
    text: club.crestText || club.abbreviation || '?',
    image: club.crestDataUrl || '',
    background: club.primaryColor || '#18394a',
    color: club.secondaryColor || '#fff'
  };
}
function scoreboardPayload(match, state) {
  const home = getClub(match.homeClubId) || { shortName: 'Mandante', abbreviation: 'MAN' };
  const away = getClub(match.awayClubId) || { shortName: 'Visitante', abbreviation: 'VIS' };
  const meta = phaseMeta(state.phase);
  return {
    matchId: match.id,
    competition: [match.competition, match.round].filter(Boolean).join(' · ').toUpperCase(),
    homeName: String(home.shortName || 'Mandante').toUpperCase(),
    awayName: String(away.shortName || 'Visitante').toUpperCase(),
    homeShort: home.abbreviation || 'MAN',
    awayShort: away.abbreviation || 'VIS',
    homeCrest: crestPayload(home),
    awayCrest: crestPayload(away),
    homeScore: Number(state.homeScore) || 0,
    awayScore: Number(state.awayScore) || 0,
    homeScorers: Array.isArray(state.homeScorers) && state.homeScorers.length ? state.homeScorers.join(' · ') : '—',
    awayScorers: Array.isArray(state.awayScorers) && state.awayScorers.length ? state.awayScorers.join(' · ') : '—',
    clock: fmt(elapsed(state)),
    period: meta.period,
    status: meta.status,
    chronology: Array.isArray(state.events) ? state.events.slice(0, 6) : []
  };
}
async function sendCommand(command) {
  const response = await fetch('/api/commands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error('Não foi possível atualizar o overlay.');
}
async function publishOnAir(force = false) {
  if (publishingOnAir) return;
  const onAirId = getOnAirMatchId();
  const match = getMatches().find(item => item.id === onAirId);
  if (!match) return;
  const state = coverage(match);
  const payload = scoreboardPayload(match, state);
  const signature = JSON.stringify(payload);
  if (!force && signature === lastPublishedSignature) return;
  publishingOnAir = true;
  try {
    await sendCommand({ type: 'show', region: 'scoreboard', payload });
    lastPublishedSignature = signature;
  } catch (error) {
    console.error(error);
  } finally {
    publishingOnAir = false;
  }
}


function action(id, type) {
  const match = getMatches().find(item => item.id === id);
  if (!match) return;
  const state = coverage(match);

  if (type === 'open') {
    setActiveMatchId(id);
    location.href = `/control/?matchId=${encodeURIComponent(id)}`;
    return;
  }
  if (type === 'on-air') {
    setOnAirMatchId(id);
    lastPublishedSignature = '';
    render();
    publishOnAir(true);
    return;
  }
  if (type === 'start') {
    if (state.phase === 'FINAL' || state.clockRunning) return;
    if (state.phase === 'PRE_GAME') state.phase = 'FIRST_HALF';
    else if (state.phase === 'HALFTIME') state.phase = 'SECOND_HALF';
    state.clockRunning = true;
    state.clockStartedAt = Date.now();
  }
  if (type === 'pause') {
    state.elapsedSeconds = elapsed(state);
    state.clockRunning = false;
    state.clockStartedAt = null;
  }
  if (type === 'reset') {
    state.elapsedSeconds = 0;
    state.clockRunning = false;
    state.clockStartedAt = null;
  }
  persist(match, state);
}

function render() {
  const matches = getMatches();
  const onAirId = getOnAirMatchId();
  if (!matches.length) { $('grid').innerHTML = '<div class="empty">Nenhuma partida cadastrada.</div>'; return; }

  $('grid').innerHTML = matches.map(match => {
    const state = coverage(match);
    const home = getClub(match.homeClubId) || { shortName: 'Mandante', abbreviation: 'MAN' };
    const away = getClub(match.awayClubId) || { shortName: 'Visitante', abbreviation: 'VIS' };
    const onAir = match.id === onAirId;
    return `<article class="card ${state.clockRunning ? 'active' : ''} ${onAir ? 'on-air' : ''}">
      <div class="head"><b>${esc(match.competition || 'Partida')}</b><span>${phases[state.phase] || state.phase}</span></div>
      <div class="teams"><div class="team"><strong>${esc(home.shortName)}</strong><small>${esc(home.abbreviation)}</small></div><div class="score">${state.homeScore || 0} × ${state.awayScore || 0}</div><div class="team"><strong>${esc(away.shortName)}</strong><small>${esc(away.abbreviation)}</small></div></div>
      <div class="clock"><b>${fmt(elapsed(state))}</b><span>${state.clockRunning ? 'RELÓGIO EM ANDAMENTO' : 'RELÓGIO PAUSADO'}</span></div>
      <div class="air-status">${onAir ? '● SAÍDA PRINCIPAL DO OBS' : '○ FORA DO AR'}</div>
      <div class="actions"><button data-id="${match.id}" data-action="start">▶ Iniciar</button><button data-id="${match.id}" data-action="pause">Ⅱ Pausar</button><button data-id="${match.id}" data-action="reset">↺ Zerar</button><button data-id="${match.id}" data-action="on-air">${onAir ? 'No ar' : 'Colocar no ar'}</button><button class="primary" data-id="${match.id}" data-action="open">Abrir cabine</button></div>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => action(button.dataset.id, button.dataset.action)));
}

$('refresh').addEventListener('click', render);
window.addEventListener('storage', () => { render(); publishOnAir(true); });
window.addEventListener('rodrigol:data-changed', () => { render(); publishOnAir(true); });
setInterval(() => { $('now').textContent = new Date().toLocaleTimeString('pt-BR'); }, 1000);
setInterval(() => { render(); publishOnAir(); }, 1000);
render();
publishOnAir(true);
