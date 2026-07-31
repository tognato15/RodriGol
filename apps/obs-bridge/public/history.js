import {
  getHistoryState,
  saveHistoryState,
  updateHistoryEntry,
  deleteHistoryEntry
} from './data-store.js';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
let selected = '';

function entries() { return getHistoryState().entries || []; }
function eventCount(entry) { return entry.coverage?.events?.length || 0; }
function goalCount(entry) { return (entry.coverage?.events || []).filter(event => event.type === 'GOAL').length; }
function dateValue(entry) { return entry.match?.date || entry.archivedAt || ''; }
function displayDate(value) { if (!value) return 'Data não informada'; const date = new Date(value.length === 10 ? `${value}T12:00:00` : value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR'); }
function displayDateTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR'); }

function populateFilters() {
  const data = entries();
  const competitions = [...new Set(data.map(item => item.match?.competition).filter(Boolean))].sort();
  const seasons = [...new Set(data.map(item => item.match?.season).filter(Boolean))].sort();
  const currentCompetition = $('competition').value;
  const currentSeason = $('season').value;
  $('competition').innerHTML = '<option value="ALL">Todas as competições</option>' + competitions.map(value => `<option>${esc(value)}</option>`).join('');
  $('season').innerHTML = '<option value="ALL">Todas as temporadas</option>' + seasons.map(value => `<option>${esc(value)}</option>`).join('');
  if ([...$('competition').options].some(option => option.value === currentCompetition)) $('competition').value = currentCompetition;
  if ([...$('season').options].some(option => option.value === currentSeason)) $('season').value = currentSeason;
}

function filtered() {
  const query = $('search').value.trim().toLowerCase();
  const competition = $('competition').value;
  const season = $('season').value;
  const status = $('status').value;
  const sort = $('sort').value;
  const result = entries().filter(item => {
    const haystack = [item.home?.shortName,item.home?.name,item.away?.shortName,item.away?.name,item.match?.competition,item.match?.season,item.match?.round,item.match?.date,item.match?.venue,item.notes,item.tags?.join(' ')].join(' ').toLowerCase();
    return (!query || haystack.includes(query)) &&
      (competition === 'ALL' || item.match?.competition === competition) &&
      (season === 'ALL' || item.match?.season === season) &&
      (status === 'ALL' || (status === 'FAVORITE' ? item.favorite : (item.archiveStatus || 'ACTIVE') === status));
  });
  return result.sort((a,b) => {
    if (sort === 'OLDEST') return String(dateValue(a)).localeCompare(String(dateValue(b)));
    if (sort === 'COMPETITION') return String(a.match?.competition || '').localeCompare(String(b.match?.competition || ''), 'pt-BR');
    if (sort === 'EVENTS') return eventCount(b) - eventCount(a);
    return String(dateValue(b)).localeCompare(String(dateValue(a)));
  });
}

function renderSummary() {
  const data = entries();
  const competitions = new Set(data.map(item => item.match?.competition).filter(Boolean)).size;
  const goals = data.reduce((sum,item) => sum + goalCount(item), 0);
  const events = data.reduce((sum,item) => sum + eventCount(item), 0);
  $('summary').innerHTML = `
    <article><small>COBERTURAS</small><strong>${data.length}</strong><span>preservadas no acervo</span></article>
    <article><small>COMPETIÇÕES</small><strong>${competitions}</strong><span>com registros históricos</span></article>
    <article><small>EVENTOS</small><strong>${events}</strong><span>na timeline inteligente</span></article>
    <article><small>GOLS</small><strong>${goals}</strong><span>registrados nas coberturas</span></article>`;
}

function renderList() {
  const data = filtered();
  $('count').textContent = `${data.length} cobertura${data.length === 1 ? '' : 's'}`;
  $('historyList').innerHTML = data.length ? data.map(item => `
    <article class="history-card ${selected === item.matchId ? 'active' : ''}" data-id="${esc(item.matchId)}">
      <div class="card-top"><small>${esc(item.match?.competition || 'Competição')} · ${esc(item.match?.season || '')}</small><button class="favorite ${item.favorite ? 'on' : ''}" data-favorite="${esc(item.matchId)}" title="Favoritar">★</button></div>
      <h3>${esc(item.home?.shortName || 'Mandante')} × ${esc(item.away?.shortName || 'Visitante')}</h3>
      <div class="score">${esc(item.finalScore || '0 × 0')}</div>
      <div class="card-meta"><span>${displayDate(item.match?.date)}</span><span>${eventCount(item)} eventos</span><span>${esc(item.archiveStatus === 'FINAL' ? 'Finalizada' : 'Em atualização')}</span></div>
    </article>`).join('') : '<div class="empty">Nenhuma cobertura encontrada.</div>';
  $('historyList').querySelectorAll('[data-id]').forEach(element => element.addEventListener('click', event => {
    if (event.target.closest('[data-favorite]')) return;
    selected = element.dataset.id;
    renderList();
    renderDetail();
  }));
  $('historyList').querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const item = entries().find(entry => entry.matchId === button.dataset.favorite);
    if (!item) return;
    updateHistoryEntry(item.matchId, { favorite: !item.favorite });
    refresh();
  }));
}

function lineupBlock(title, lineup = {}) {
  const starters = lineup.starters || [];
  const bench = lineup.bench || [];
  return `<article class="lineup-block"><h4>${esc(title)}</h4><p><b>Técnico:</b> ${esc(lineup.coach || 'Não informado')}</p><b>Titulares</b><ol>${starters.length ? starters.map(player => `<li>${esc(player)}</li>`).join('') : '<li>Não informados</li>'}</ol><b>Reservas</b><ul>${bench.length ? bench.map(player => `<li>${esc(player)}</li>`).join('') : '<li>Não informados</li>'}</ul></article>`;
}

function renderDetail() {
  const item = entries().find(entry => entry.matchId === selected);
  if (!item) { $('detail').innerHTML = '<div class="empty">Selecione uma cobertura.</div>'; return; }
  const events = item.coverage?.events || [];
  const lineups = item.coverage?.lineups || {};
  $('detail').innerHTML = `
    <div class="detail-actions">
      <button id="toggleFavorite">${item.favorite ? '★ Remover favorito' : '☆ Favoritar'}</button>
      <button id="exportOne">Exportar registro</button>
      <button id="deleteOne" class="danger">Excluir</button>
    </div>
    <small>${esc(item.match?.competition || '')} · ${esc(item.match?.round || '')} · ${esc(item.match?.season || '')}</small>
    <h2>${esc(item.home?.shortName)} ${esc(item.finalScore)} ${esc(item.away?.shortName)}</h2>
    <div class="facts"><span><b>Data</b>${displayDate(item.match?.date)}</span><span><b>Local</b>${esc(item.match?.venue || 'Não informado')}</span><span><b>Árbitro</b>${esc(item.match?.referee || 'Não informado')}</span><span><b>Arquivado</b>${displayDateTime(item.archivedAt)}</span></div>
    <label class="notes-label">ANOTAÇÕES DO ACERVO<textarea id="historyNotes" placeholder="Contexto, observações ou informações para futuras consultas">${esc(item.notes || '')}</textarea></label>
    <button id="saveNotes" class="primary">Salvar anotações</button>
    <details><summary>Escalações preservadas</summary><div class="lineups">${lineupBlock(item.home?.shortName || 'Mandante', lineups.home)}${lineupBlock(item.away?.shortName || 'Visitante', lineups.away)}</div></details>
    <h3>TIMELINE INTELIGENTE <span>${events.length} eventos</span></h3>
    <div class="timeline">${events.length ? events.map(event => `<article><b>${esc(event.minute)}'</b><span class="tag">${esc(event.icon || '•')} ${esc(event.label || event.type)}</span><div><strong>${esc(event.player || event.details || 'Atualização')}</strong><small>${esc(event.details || event.period || '')}</small>${event.editorialSuggestion ? `<div class="suggestion"><b>Sugestão editorial:</b> ${esc(event.editorialSuggestion)}</div>` : ''}</div><em>${esc(event.score || '')}</em></article>`).join('') : '<div class="empty">Sem eventos registrados.</div>'}</div>`;
  $('toggleFavorite').onclick = () => { updateHistoryEntry(item.matchId, { favorite: !item.favorite }); refresh(); };
  $('saveNotes').onclick = () => { updateHistoryEntry(item.matchId, { notes: $('historyNotes').value.trim() }); $('saveNotes').textContent = '✓ Salvo'; setTimeout(() => $('saveNotes').textContent = 'Salvar anotações', 1200); refresh(false); };
  $('exportOne').onclick = () => downloadJson(`rodrigol-historico-${item.matchId}.json`, { version: 2, exportedAt: new Date().toISOString(), entries: [item] });
  $('deleteOne').onclick = () => { if (!confirm('Excluir definitivamente esta cobertura do histórico?')) return; deleteHistoryEntry(item.matchId); selected = ''; refresh(); };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function exportAll() { downloadJson(`rodrigol-historico-${new Date().toISOString().slice(0,10)}.json`, { version: 2, exportedAt: new Date().toISOString(), entries: entries() }); }
function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incoming = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(incoming)) throw new Error('Formato inválido.');
      const current = entries();
      incoming.forEach(item => {
        if (!item?.matchId) return;
        const index = current.findIndex(existing => existing.matchId === item.matchId);
        if (index >= 0) current[index] = { ...current[index], ...item, updatedAt: new Date().toISOString() };
        else current.unshift({ ...item, importedAt: new Date().toISOString() });
      });
      saveHistoryState({ entries: current.slice(0, 500) });
      alert(`${incoming.length} registro(s) processado(s).`);
      refresh();
    } catch (error) { alert(`Não foi possível importar: ${error.message}`); }
  };
  reader.readAsText(file);
}

function refresh(renderDetails = true) { populateFilters(); renderSummary(); renderList(); if (renderDetails) renderDetail(); }
['search','competition','season','status','sort'].forEach(id => $(id).addEventListener('input', () => { renderList(); }));
$('clear').onclick = () => { $('search').value=''; $('competition').value='ALL'; $('season').value='ALL'; $('status').value='ALL'; $('sort').value='NEWEST'; renderList(); };
$('exportAll').onclick = exportAll;
$('importButton').onclick = () => $('importFile').click();
$('importFile').onchange = event => { const file = event.target.files?.[0]; if (file) importFile(file); event.target.value = ''; };
window.addEventListener('storage', event => { if (event.key === 'rodrigol-history-v1') refresh(); });
window.addEventListener('rodrigol:data-changed', event => { if (event.detail?.key === 'rodrigol-history-v1') refresh(); });
setInterval(() => $('now').textContent = new Date().toLocaleTimeString('pt-BR'), 1000);
refresh();
