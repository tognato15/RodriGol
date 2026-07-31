const CLUBS_KEY = 'rodrigol-clubs-v1';
const MATCHES_KEY = 'rodrigol-matches-v1';
const ACTIVE_MATCH_KEY = 'rodrigol-active-match-v1';
const ON_AIR_MATCH_KEY = 'rodrigol-on-air-match-v1';
const COVERAGE_PREFIX = 'rodrigol-coverage-v1:';
const HISTORY_KEY = 'rodrigol-history-v1';

const seedClubs = [
  { id: 'palmeiras', name: 'Palmeiras', shortName: 'Palmeiras', abbreviation: 'PAL', city: 'São Paulo', state: 'SP', country: 'Brasil', stadium: 'Allianz Parque', founded: '1914-08-26', primaryColor: '#1f6f43', secondaryColor: '#ffffff', tertiaryColor: '#0d3b24', crestText: 'P', crestDataUrl: '' },
  { id: 'bragantino', name: 'Red Bull Bragantino', shortName: 'Bragantino', abbreviation: 'RBB', city: 'Bragança Paulista', state: 'SP', country: 'Brasil', stadium: 'Nabi Abi Chedid', founded: '1928-01-08', primaryColor: '#d71920', secondaryColor: '#ffffff', tertiaryColor: '#111111', crestText: 'RB', crestDataUrl: '' },
  { id: 'flamengo', name: 'Clube de Regatas do Flamengo', shortName: 'Flamengo', abbreviation: 'FLA', city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', stadium: 'Maracanã', founded: '1895-11-17', primaryColor: '#c9151e', secondaryColor: '#111111', tertiaryColor: '#ffffff', crestText: 'F', crestDataUrl: '' }
];

const seedMatches = [
  { id: 'pal-rbb-2026', competition: 'Brasileirão Série A', season: '2026', round: '9ª Rodada', date: '2026-07-29', time: '20:30', venue: 'Allianz Parque', city: 'São Paulo, SP', referee: 'A definir', homeClubId: 'palmeiras', awayClubId: 'bragantino', status: 'PRE_GAME', notes: '' }
];

function has(key) { return localStorage.getItem(key) !== null; }
function parse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(value) ? value : fallback) : (value ?? fallback);
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('rodrigol:data-changed', { detail: { key, value } }));
  return value;
}
function remove(key) {
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('rodrigol:data-changed', { detail: { key, value: null } }));
}

export function uid(prefix = 'item') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export function getClubs() { if (!has(CLUBS_KEY)) return write(CLUBS_KEY, seedClubs); return parse(CLUBS_KEY, []); }
export function saveClubs(clubs) { return write(CLUBS_KEY, clubs); }
export function upsertClub(club) { const clubs = getClubs(); const index = clubs.findIndex(item => item.id === club.id); if (index >= 0) clubs[index] = club; else clubs.push(club); return saveClubs(clubs); }
export function deleteClub(id) { saveClubs(getClubs().filter(item => item.id !== id)); saveMatches(getMatches().filter(match => match.homeClubId !== id && match.awayClubId !== id)); }
export function getClub(id) { return getClubs().find(item => item.id === id) || null; }
export function getMatches(){if(!has(MATCHES_KEY))return write(MATCHES_KEY,seedMatches);return parse(MATCHES_KEY,[]);}
export function saveMatches(matches) { return write(MATCHES_KEY, matches); }
export function upsertMatch(match) { const matches = getMatches(); const index = matches.findIndex(item => item.id === match.id); if (index >= 0) matches[index] = match; else matches.push(match); return saveMatches(matches); }
export function deleteMatch(id) {
  const activeId = parse(ACTIVE_MATCH_KEY, '');
  const onAirId = parse(ON_AIR_MATCH_KEY, '');
  saveMatches(getMatches().filter(item => item.id !== id));
  if (activeId === id) remove(ACTIVE_MATCH_KEY);
  if (onAirId === id) remove(ON_AIR_MATCH_KEY);
  remove(COVERAGE_PREFIX + id);
}
export function getMatch(id) { return getMatches().find(item => item.id === id) || null; }
export function setActiveMatchId(id) { if (!getMatch(id)) return ''; write(ACTIVE_MATCH_KEY, id); return id; }
export function getActiveMatchId() { const matches = getMatches(); const stored = parse(ACTIVE_MATCH_KEY, ''); if (stored && matches.some(match => match.id === stored)) return stored; return matches[0]?.id || ''; }
export function getActiveMatch() { const id = getActiveMatchId(); return id ? getMatch(id) : null; }
export function setOnAirMatchId(id) { if (!getMatch(id)) return ''; write(ON_AIR_MATCH_KEY, id); return id; }
export function getOnAirMatchId() {
  const matches = getMatches();
  const stored = parse(ON_AIR_MATCH_KEY, '');
  if (stored && matches.some(match => match.id === stored)) return stored;
  const fallback = getActiveMatchId();
  if (fallback) write(ON_AIR_MATCH_KEY, fallback);
  return fallback;
}
export function isMatchOnAir(id) { return Boolean(id) && getOnAirMatchId() === id; }
export function coverageKey(matchId) { return COVERAGE_PREFIX + matchId; }
export function readCoverage(matchId, fallback) { return parse(coverageKey(matchId), fallback); }
export function saveCoverage(matchId, state) { return write(coverageKey(matchId), state); }

const EDITORIAL_KEY = 'rodrigol-editorial-v1';
export function getEditorialState() { const state = parse(EDITORIAL_KEY, { items: {}, agendas: [], scheduled: [], published: [] }); return { ...state, items: state.items || {}, agendas: Array.isArray(state.agendas) ? state.agendas : [], scheduled: Array.isArray(state.scheduled) ? state.scheduled : [], published: Array.isArray(state.published) ? state.published : [] }; }
export function saveEditorialState(state) { return write(EDITORIAL_KEY, state); }

const NEWS_KEY = 'rodrigol-news-v1';
export function getNewsState() {
  const state = parse(NEWS_KEY, { articles: [] });
  return { ...state, articles: Array.isArray(state.articles) ? state.articles : [] };
}
export function saveNewsState(state) { return write(NEWS_KEY, state); }


export function getHistoryState() {
  const state = parse(HISTORY_KEY, { entries: [] });
  return { ...state, entries: Array.isArray(state.entries) ? state.entries : [] };
}
export function saveHistoryState(state) { return write(HISTORY_KEY, state); }
export function updateHistoryEntry(matchId, patch) {
  const history = getHistoryState();
  const index = history.entries.findIndex(item => item.matchId === matchId);
  if (index < 0) return null;
  history.entries[index] = { ...history.entries[index], ...patch, updatedAt: new Date().toISOString() };
  saveHistoryState(history);
  return history.entries[index];
}
export function archiveCoverage(entry) {
  const history = getHistoryState();
  const normalized = {
    ...entry,
    id: entry.id || `history-${entry.matchId}-${Date.now()}`,
    archivedAt: entry.archivedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archiveStatus: entry.archiveStatus || (entry.coverage?.phase === 'FINAL' ? 'FINAL' : 'ACTIVE'),
    favorite: Boolean(entry.favorite),
    notes: entry.notes || '',
    tags: Array.isArray(entry.tags) ? entry.tags : []
  };
  const previousIndex = history.entries.findIndex(item => item.matchId === normalized.matchId);
  if (previousIndex >= 0) history.entries[previousIndex] = { ...history.entries[previousIndex], ...normalized };
  else history.entries.unshift(normalized);
  history.entries = history.entries.slice(0, 500);
  saveHistoryState(history);
  return normalized;
}
export function getHistoryEntry(matchId) { return getHistoryState().entries.find(item => item.matchId === matchId) || null; }
export function deleteHistoryEntry(matchId) { const history = getHistoryState(); history.entries = history.entries.filter(item => item.matchId !== matchId); return saveHistoryState(history); }

const TICKER_KEY = 'rodrigol-ticker-v1';
export function getTickerState() {
  const state = parse(TICKER_KEY, { items: [], enabled: true, intervalSeconds: 8, label: 'RODRIGOL AGORA', autoPublish: false, endBehavior: 'CONTINUE' });
  return {
    enabled: state.enabled !== false,
    intervalSeconds: Math.max(3, Number(state.intervalSeconds) || 8),
    label: state.label || 'RODRIGOL AGORA',
    autoPublish: state.autoPublish === true,
    endBehavior: state.endBehavior === 'HIDE_AFTER_CYCLE' ? 'HIDE_AFTER_CYCLE' : 'CONTINUE',
    items: Array.isArray(state.items) ? state.items : []
  };
}
export function saveTickerState(state) { return write(TICKER_KEY, getNormalizedTickerState(state)); }
function getNormalizedTickerState(state = {}) {
  return {
    enabled: state.enabled !== false,
    intervalSeconds: Math.max(3, Number(state.intervalSeconds) || 8),
    label: String(state.label || 'RODRIGOL AGORA').trim() || 'RODRIGOL AGORA',
    autoPublish: state.autoPublish === true,
    endBehavior: state.endBehavior === 'HIDE_AFTER_CYCLE' ? 'HIDE_AFTER_CYCLE' : 'CONTINUE',
    items: (Array.isArray(state.items) ? state.items : []).slice(0, 100)
  };
}
export function enqueueTickerItem(item) {
  const state = getTickerState();
  const normalized = {
    id: item.id || uid('ticker'),
    createdAt: item.createdAt || new Date().toISOString(),
    active: item.active !== false,
    priority: item.priority || 'NORMAL',
    competition: item.competition || '',
    match: item.match || '',
    eventType: item.eventType || 'INFORMAÇÃO',
    minute: item.minute ?? '',
    person: item.person || '',
    text: item.text || ''
  };
  const index = state.items.findIndex(entry => entry.sourceEventId && entry.sourceEventId === item.sourceEventId);
  if (index >= 0) state.items[index] = { ...state.items[index], ...normalized, sourceEventId: item.sourceEventId };
  else state.items.unshift({ ...normalized, sourceEventId: item.sourceEventId || '' });
  saveTickerState(state);
  return normalized;
}
export function removeTickerItem(id) { const state = getTickerState(); state.items = state.items.filter(item => item.id !== id); return saveTickerState(state); }
