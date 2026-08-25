import { publishCommand } from './bridge-client.js';
import {
  getClubs,
  getMatches,
  readCoverage,
  getEditorialState,
  saveEditorialState,
  getNewsState,
  saveNewsState
} from './data-store.js';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

let filter = 'ALL';
let showHistoricalEvents = false;
const MAX_COLUMN_ITEMS = 80;
let editorial = getEditorialState();
const livePhases = ['FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME','EXTRA_TIME_FIRST_HALF','EXTRA_TIME_HALFTIME','EXTRA_TIME_SECOND_HALF','PENALTIES'];
const agendaStatuses = ['RECEIVED', 'ANALYSIS', 'PRIORITY', 'SCHEDULED', 'PUBLISHED'];

function club(id) {
  return getClubs().find(item => item.id === id) || { shortName: 'Clube removido' };
}

function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function eventOperationalToday(event, match, coverage) {
  if (showHistoricalEvents) return true;
  if (livePhases.includes(String(coverage?.phase || match?.status || ''))) return true;
  const queueSince = String(editorial.queueSince || localDateKey());
  const eventDay = event?.createdAt ? localDateKey(event.createdAt) : String(match?.date || '');
  return Boolean(eventDay && eventDay >= queueSince);
}
function allEvents() {
  const result = [];
  for (const match of getMatches()) {
    if (!showHistoricalEvents && String(match.date || '') && String(match.date) < String(editorial.queueSince || localDateKey())) {
      const status = String(match.status || '').toUpperCase();
      if (!livePhases.includes(status)) continue;
    }
    const coverage = readCoverage(match.id, { events: [], phase: match.status || 'PRE_GAME' });
    for (const event of coverage.events || []) {
      if (!eventOperationalToday(event, match, coverage)) continue;
      result.push({
        ...event, matchId: match.id, match, home: club(match.homeClubId), away: club(match.awayClubId)
      });
    }
  }
  return result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function statusOf(event) {
  return editorial.items?.[event.id]?.status || 'RECEIVED';
}

function dataOf(event) {
  return editorial.items?.[event.id] || {};
}

function persist() {
  editorial = saveEditorialState(editorial);
}

function nowIso() {
  return new Date().toISOString();
}

function agendaStatusLabel(status) {
  return ({
    RECEIVED: 'Recebida',
    ANALYSIS: 'Em análise',
    PRIORITY: 'Prioridade máxima',
    SCHEDULED: 'Programada',
    PUBLISHED: 'Publicada'
  })[status] || 'Recebida';
}

function agendaPriorityLabel(priority) {
  return ({ LOW: 'Baixa', NORMAL: 'Normal', HIGH: 'Alta', URGENT: 'Urgente' })[priority] || 'Normal';
}

function matchLabel(matchId) {
  const match = getMatches().find(item => item.id === matchId);
  return match
    ? `${club(match.homeClubId).shortName} × ${club(match.awayClubId).shortName}`
    : 'Sem partida relacionada';
}

function titleOf(event) {
  const team = event.team === 'HOME'
    ? event.home.shortName
    : event.team === 'AWAY'
      ? event.away.shortName
      : '';
  return event.type === 'GOAL'
    ? `GOL! ${event.player || team}`
    : (event.player || event.label || 'Informação');
}

function textOf(event) {
  return event.details || `${event.label} em ${event.home.shortName} × ${event.away.shortName}`;
}

const LEGACY_TO_STUDIO = {
  ticker: 'editorial-highlight',
  'side-alert': 'editorial-highlight',
  'lower-third': 'studio-lower-third',
  headline: 'studio-headline',
  fullscreen: 'studio-fullscreen',
  timeline: 'live-events',
  newsroom: 'editorial-highlight'
};

function resolveStudioRegion(channel = 'ticker') {
  if (channel === 'studio-breaking-ticker') return 'editorial-highlight';
  return LEGACY_TO_STUDIO[channel] || channel || 'editorial-highlight';
}

function editorialHighlightPayload({ label = 'AGORA', text = '' } = {}) {
  const headline = String(text || '').trim();
  return {
    label,
    text: headline,
    headlines: headline ? [{ text: headline }] : [],
    mode: 'FIXED',
    intervalSeconds: 10
  };
}

function buildStudioPayload(region, payload = {}) {
  if (region === 'editorial-highlight') {
    return {
      label: payload.label || 'INFORMAÇÃO',
      headline: payload.headline || payload.text || '',
      summary: payload.summary || '',
      durationMs: payload.durationMs
    };
  }
  if (region === 'editorial-highlight') {
    const text = [payload.headline, payload.text, payload.summary].filter(Boolean).join(' — ');
    return editorialHighlightPayload({ label: payload.label || 'AGORA', text });
  }
  if (region === 'studio-lower-third') {
    return {
      eyebrow: payload.eyebrow || payload.label || '',
      headline: payload.headline || payload.text || '',
      summary: payload.summary || ''
    };
  }
  if (region === 'studio-headline') {
    return {
      label: payload.label || 'URGENTE',
      headline: payload.headline || payload.text || ''
    };
  }
  if (region === 'studio-fullscreen') {
    return {
      label: payload.label || 'RODRIGOL STUDIO',
      headline: payload.headline || payload.text || '',
      summary: payload.summary || ''
    };
  }
  return payload;
}

async function command(body) { return publishCommand(body); }

async function publishEvent(event) {
  const item = dataOf(event);
  const text = [titleOf(event), textOf(event)].filter(Boolean).join(' — ');
  const region = resolveStudioRegion(item.channel || 'ticker');
  await command({
    type: 'show',
    region,
    payload: buildStudioPayload(region, region === 'editorial-highlight'
      ? { label: event.label || 'INFORMAÇÃO', headline: titleOf(event), summary: textOf(event) }
      : { label: `${event.minute ?? 0}'`, text })
  });
  editorial.items[event.id] = { ...item, status: 'PUBLISHED', publishedAt: nowIso(), selected: false };
  editorial.published = [
    { id: event.id, kind: 'event', text, matchId: event.matchId, publishedAt: nowIso() },
    ...(editorial.published || []).filter(item => item.id !== event.id)
  ].slice(0, 100);
  persist();
  $('newsflashText').textContent = text;
  render();
}

function setEventStatus(id, status) {
  editorial.items[id] = { ...(editorial.items?.[id] || {}), status, updatedAt: nowIso() };
  persist();
  render();
}

function scheduleEvent(id) {
  const suggested = new Date(Date.now() + 15 * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const time = window.prompt('Horário da publicação (HH:MM):', suggested);
  if (!time) return;
  editorial.items[id] = {
    ...(editorial.items?.[id] || {}),
    status: 'SCHEDULED',
    scheduledTime: time,
    updatedAt: nowIso()
  };
  persist();
  render();
}

function eventCard(event, status) {
  const item = dataOf(event);
  return `<article class="editorial-card ${status.toLowerCase()}" data-id="${event.id}">
    <div class="card-top">
      <input type="checkbox" data-select="${event.id}" ${item.selected ? 'checked' : ''}>
      <span>${new Date(event.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      <b>${esc(event.home.shortName)} × ${esc(event.away.shortName)}</b>
    </div>
    <strong>${esc(titleOf(event))}</strong>
    <p>${esc(textOf(event))}</p>
    <div class="card-actions">
      ${status !== 'ANALYSIS' ? `<button data-event-status="${event.id}:ANALYSIS">Analisar</button>` : ''}
      ${status !== 'PRIORITY' ? `<button data-event-status="${event.id}:PRIORITY">Prioridade</button>` : ''}
      <button data-event-schedule="${event.id}">${item.scheduledTime || 'Agendar'}</button>
      <button data-event-publish="${event.id}">Publicar</button>
    </div>
  </article>`;
}

function renderColumn(id, events, status) {
  const visible = events.slice(0, MAX_COLUMN_ITEMS);
  const hidden = Math.max(0, events.length - visible.length);
  $(id).innerHTML = visible.length
    ? visible.map(event => eventCard(event, status)).join('') + (hidden ? `<div class="empty">${hidden} item(ns) adicionais ocultos para manter a Mesa rápida. Use a busca para localizar um evento específico.</div>` : '')
    : '<div class="empty">Nenhuma informação nesta etapa.</div>';
}

function appendAgendaHistory(agenda, action, detail = '') {
  const entry = { id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, action, detail, at: nowIso() };
  return { ...agenda, history: [entry, ...(agenda.history || [])].slice(0, 50), updatedAt: entry.at };
}

function agendaPublicationText(agenda) {
  const related = agenda.matchId ? ` · ${matchLabel(agenda.matchId)}` : '';
  return `${agenda.title}${related}${agenda.description ? ` — ${agenda.description}` : ''}`;
}


function syncAgendaToNews(agenda) {
  const news = getNewsState();
  const previous = (news.articles || []).find(item => item.sourceAgendaId === agenda.id);
  const article = {
    ...previous,
    id: previous?.id || `news-${agenda.id}`,
    sourceAgendaId: agenda.id,
    title: agenda.title,
    subtitle: agenda.description || '',
    body: previous?.body || agenda.description || '',
    category: agenda.category || 'Geral',
    priority: agenda.priority || 'NORMAL',
    matchId: agenda.matchId || '',
    author: agenda.author || 'Redação RodriGol',
    status: 'PUBLISHED',
    publishedAt: agenda.publishedAt || nowIso(),
    createdAt: previous?.createdAt || agenda.createdAt || nowIso(),
    updatedAt: nowIso()
  };
  news.articles = [article, ...(news.articles || []).filter(item => item.id !== article.id)];
  saveNewsState(news);
}

async function publishAgenda(id, automatic = false) {
  const agenda = (editorial.agendas || []).find(item => item.id === id);
  if (!agenda) return;
  const text = agendaPublicationText(agenda);
  const region = resolveStudioRegion(agenda.channel || 'ticker');
  await command({
    type: 'show',
    region,
    payload: buildStudioPayload(region, region === 'editorial-highlight'
      ? { label: agenda.category || 'PAUTA', headline: agenda.title, summary: agenda.description || matchLabel(agenda.matchId) }
      : { label: agenda.category || 'PAUTA', text })
  });
  const publishedAt = nowIso();
  const updated = appendAgendaHistory({ ...agenda, status: 'PUBLISHED', publishedAt }, automatic ? 'Publicação automática' : 'Publicada no overlay', region);
  editorial.agendas = (editorial.agendas || []).map(item => item.id === id ? updated : item);
  syncAgendaToNews(updated);
  editorial.published = [
    { id: agenda.id, kind: 'agenda', text, matchId: agenda.matchId, publishedAt },
    ...(editorial.published || []).filter(item => item.id !== agenda.id)
  ].slice(0, 100);
  persist();
  $('newsflashText').textContent = text;
  render();
}

function moveAgenda(id, status) {
  const agenda = (editorial.agendas || []).find(item => item.id === id);
  if (!agenda || !agendaStatuses.includes(status)) return;
  let updated = { ...agenda, status };
  if (status !== 'SCHEDULED') updated.scheduledAt = status === 'PUBLISHED' ? agenda.scheduledAt : '';
  updated = appendAgendaHistory(updated, `Movida para ${agendaStatusLabel(status)}`);
  editorial.agendas = (editorial.agendas || []).map(item => item.id === id ? updated : item);
  persist();
  render();
}

function agendaActions(agenda) {
  const buttons = [];
  if (agenda.status !== 'RECEIVED') buttons.push(`<button data-agenda-status="${agenda.id}:RECEIVED">Recebida</button>`);
  if (agenda.status !== 'ANALYSIS') buttons.push(`<button data-agenda-status="${agenda.id}:ANALYSIS">Analisar</button>`);
  if (agenda.status !== 'PRIORITY') buttons.push(`<button data-agenda-status="${agenda.id}:PRIORITY">Prioridade</button>`);
  if (agenda.status !== 'SCHEDULED') buttons.push(`<button data-edit-agenda="${agenda.id}" data-focus-schedule="1">Programar</button>`);
  if (agenda.status !== 'PUBLISHED') buttons.push(`<button class="publish" data-publish-agenda="${agenda.id}">Publicar</button>`);
  buttons.push(`<button data-edit-agenda="${agenda.id}">Editar</button>`);
  buttons.push(`<button data-history-agenda="${agenda.id}">Histórico</button>`);
  buttons.push(`<button class="danger" data-delete-agenda="${agenda.id}">Excluir</button>`);
  return buttons.join('');
}

function agendaCard(agenda) {
  const history = (agenda.history || []).slice(0, 8);
  return `<article class="agenda-card priority-${String(agenda.priority || 'NORMAL').toLowerCase()} status-${String(agenda.status || 'RECEIVED').toLowerCase()}">
    <div class="agenda-main">
      <div class="agenda-tags">
        <span>${esc(agendaStatusLabel(agenda.status))}</span>
        <span>${esc(agendaPriorityLabel(agenda.priority))}</span>
        <span>${esc(agenda.category || 'Geral')}</span>
      </div>
      <b>${esc(agenda.title)}</b>
      ${agenda.description ? `<p>${esc(agenda.description)}</p>` : ''}
      <small>${esc(matchLabel(agenda.matchId))} · ${esc(agenda.author || 'Redação RodriGol')} · ${new Date(agenda.createdAt).toLocaleString('pt-BR')}${agenda.scheduledAt ? ` · Programada para ${new Date(agenda.scheduledAt).toLocaleString('pt-BR')}` : ''}</small>
      <div class="agenda-history" id="history-${agenda.id}" hidden>
        <strong>Histórico editorial</strong>
        ${history.length ? history.map(item => `<div><time>${new Date(item.at).toLocaleString('pt-BR')}</time><span>${esc(item.action)}${item.detail ? ` · ${esc(item.detail)}` : ''}</span></div>`).join('') : '<div><span>Sem alterações registradas.</span></div>'}
      </div>
    </div>
    <div class="agenda-actions">${agendaActions(agenda)}</div>
  </article>`;
}

function filteredAgendas(query) {
  return (editorial.agendas || []).filter(agenda => {
    const matchesFilter = filter === 'ALL' || agenda.status === filter;
    const haystack = [agenda.title, agenda.description, agenda.category, agenda.author, matchLabel(agenda.matchId)].join(' ').toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
}

function render() {
  const query = $('globalSearch').value.trim().toLowerCase();
  const events = allEvents().filter(event => !query || [
    event.label,
    event.player,
    event.details,
    event.home.shortName,
    event.away.shortName,
    event.match.competition
  ].join(' ').toLowerCase().includes(query));

  const groups = { RECEIVED: [], ANALYSIS: [], PRIORITY: [], SCHEDULED: [], PUBLISHED: [] };
  events.forEach(event => (groups[statusOf(event)] || groups.RECEIVED).push(event));
  renderColumn('receivedList', groups.RECEIVED, 'RECEIVED');
  renderColumn('analysisList', groups.ANALYSIS, 'ANALYSIS');
  renderColumn('priorityList', groups.PRIORITY, 'PRIORITY');
  renderColumn('scheduledList', groups.SCHEDULED, 'SCHEDULED');

  for (const key of ['received', 'analysis', 'priority', 'scheduled']) {
    $(`${key}Count`).textContent = groups[key.toUpperCase()].length;
    $(`${key}Badge`).textContent = groups[key.toUpperCase()].length;
  }
  $('publishedCount').textContent = groups.PUBLISHED.length + (editorial.agendas || []).filter(item => item.status === 'PUBLISHED').length;
  $('publishedMini').textContent = (editorial.published || []).length;
  $('sideReceived').textContent = groups.RECEIVED.length + (editorial.agendas || []).filter(item => item.status === 'RECEIVED').length;
  $('sidePublished').textContent = (editorial.published || []).length;

  const matches = getMatches();
  const live = matches.filter(match => livePhases.includes(readCoverage(match.id, { phase: match.status }).phase)).length;
  $('liveCount').textContent = live;
  $('footerLive').textContent = `${live} ao vivo`;
  $('sourcesCount').textContent = matches.length;
  const priorityTotal = groups.PRIORITY.length + (editorial.agendas || []).filter(item => item.status === 'PRIORITY').length;
  $('operationPercent').textContent = priorityTotal ? `${Math.max(70, 100 - priorityTotal * 3)}%` : '100%';

  $('publishedList').innerHTML = (editorial.published || []).length
    ? (editorial.published || []).slice(0, 8).map(item => `<div><b>${new Date(item.publishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${esc(item.text)}</b><small>${item.kind === 'agenda' ? 'Pauta editorial' : 'Evento de cobertura'} · Overlay e redação</small></div>`).join('')
    : '<div class="empty">Nenhuma publicação nesta sessão.</div>';

  $('sourcesList').innerHTML = matches.slice(0, 8).map(match => {
    const coverage = readCoverage(match.id, { events: [] });
    return `<div><b>${esc(club(match.homeClubId).shortName)} × ${esc(club(match.awayClubId).shortName)}</b><small>${coverage.events?.length || 0} informações · ${esc(match.competition)}</small></div>`;
  }).join('');

  $('alerts').innerHTML = `<div class="urgent">● ${priorityTotal} item(ns) exigem decisão imediata</div><div class="warning">▲ ${groups.ANALYSIS.length + (editorial.agendas || []).filter(item => item.status === 'ANALYSIS').length} informação(ões) em análise</div><div>◉ ${groups.SCHEDULED.length + (editorial.agendas || []).filter(item => item.status === 'SCHEDULED').length} publicação(ões) programada(s)</div>`;

  $('ranking').innerHTML = matches.map(match => ({ match, total: readCoverage(match.id, { events: [] }).events?.length || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item, index) => `<div><b>${index + 1}. ${esc(club(item.match.homeClubId).shortName)} × ${esc(club(item.match.awayClubId).shortName)}</b> <span>${item.total}</span></div>`).join('');

  const agendas = filteredAgendas(query);
  $('agendaCount').textContent = `${agendas.length}/${(editorial.agendas || []).length}`;
  $('agendaList').innerHTML = agendas.length
    ? agendas.map(agendaCard).join('')
    : '<div class="empty">Nenhuma pauta encontrada neste filtro.</div>';
  $('agendaFilterLabel').textContent = filter === 'ALL' ? 'Todas as etapas' : agendaStatusLabel(filter);
  $('lastUpdate').textContent = `Atualizados às ${new Date().toLocaleTimeString('pt-BR')}`;
  bind();
}

function bind() {
  document.querySelectorAll('[data-event-status]').forEach(button => {
    button.onclick = () => {
      const [id, status] = button.dataset.eventStatus.split(':');
      setEventStatus(id, status);
    };
  });
  document.querySelectorAll('[data-event-schedule]').forEach(button => button.onclick = () => scheduleEvent(button.dataset.eventSchedule));
  document.querySelectorAll('[data-event-publish]').forEach(button => {
    button.onclick = () => {
      const event = allEvents().find(item => item.id === button.dataset.eventPublish);
      if (event) publishEvent(event).catch(error => alert(error.message));
    };
  });
  document.querySelectorAll('[data-select]').forEach(control => {
    control.onchange = () => {
      editorial.items[control.dataset.select] = { ...(editorial.items?.[control.dataset.select] || {}), selected: control.checked };
      persist();
    };
  });
  document.querySelectorAll('[data-agenda-status]').forEach(button => {
    button.onclick = () => {
      const [id, status] = button.dataset.agendaStatus.split(':');
      moveAgenda(id, status);
    };
  });
  document.querySelectorAll('[data-publish-agenda]').forEach(button => button.onclick = () => publishAgenda(button.dataset.publishAgenda).catch(error => alert(error.message)));
  document.querySelectorAll('[data-edit-agenda]').forEach(button => {
    button.onclick = () => openAgendaModal(button.dataset.editAgenda, button.dataset.focusSchedule === '1');
  });
  document.querySelectorAll('[data-delete-agenda]').forEach(button => button.onclick = () => deleteAgenda(button.dataset.deleteAgenda));
  document.querySelectorAll('[data-history-agenda]').forEach(button => {
    button.onclick = () => {
      const history = $(`history-${button.dataset.historyAgenda}`);
      if (history) history.hidden = !history.hidden;
    };
  });
}

$('showHistorical').onclick = () => { showHistoricalEvents = !showHistoricalEvents; $('showHistorical').textContent = showHistoricalEvents ? '◷ Ocultar históricos' : '◷ Mostrar históricos'; render(); };
$('cleanupEditorial').onclick = () => {
  const today = localDateKey();
  if (!confirm(`Arquivar da fila editorial os eventos anteriores a ${today}? O histórico das partidas não será apagado.`)) return;
  editorial.queueSince = today;
  const validIds = new Set(allEvents().map(event => event.id));
  editorial.items = Object.fromEntries(Object.entries(editorial.items || {}).filter(([id, item]) => validIds.has(id) || item?.status === 'PUBLISHED'));
  editorial.lastQueueCleanupAt = nowIso();
  showHistoricalEvents = false;
  persist();
  render();
};

$('publishSelected').onclick = async () => {
  const selected = allEvents().filter(event => dataOf(event).selected);
  if (!selected.length) return alert('Selecione pelo menos uma informação.');
  for (const event of selected) await publishEvent(event);
};

$('quickPublish').onclick = async () => {
  const text = $('quickText').value.trim();
  if (!text) return alert('Digite a informação.');
  const region = resolveStudioRegion($('quickChannel').value);
  await command({
    type: 'show',
    region,
    payload: buildStudioPayload(region, region === 'editorial-highlight'
      ? { label: 'INFORMAÇÃO', headline: 'AGORA NA REDAÇÃO', summary: text }
      : { label: 'AGORA', text })
  });
  editorial.published = [{ id: `quick-${Date.now()}`, kind: 'quick', text, publishedAt: nowIso() }, ...(editorial.published || [])].slice(0, 100);
  persist();
  $('quickText').value = '';
  $('newsflashText').textContent = text;
  render();
};

function fillMatchOptions(selected = '') {
  $('agendaMatch').innerHTML = [
    '<option value="">Sem partida relacionada</option>',
    ...getMatches().map(match => `<option value="${match.id}" ${match.id === selected ? 'selected' : ''}>${esc(club(match.homeClubId).shortName)} × ${esc(club(match.awayClubId).shortName)} — ${esc(match.competition || 'Competição')}</option>`)
  ].join('');
}

function openAgendaModal(id = '', focusSchedule = false) {
  const agenda = (editorial.agendas || []).find(item => item.id === id);
  $('agendaForm').reset();
  $('agendaId').value = agenda?.id || '';
  $('agendaModalTitle').textContent = agenda ? 'Editar pauta' : 'Nova pauta';
  $('agendaTitle').value = agenda?.title || '';
  $('agendaDescription').value = agenda?.description || '';
  $('agendaPriority').value = agenda?.priority || 'NORMAL';
  $('agendaCategory').value = agenda?.category || 'Geral';
  $('agendaAuthor').value = agenda?.author || 'Redação RodriGol';
  $('agendaStatus').value = agenda?.status || 'RECEIVED';
  $('agendaChannel').value = resolveStudioRegion(agenda?.channel || 'ticker');
  $('agendaSchedule').value = agenda?.scheduledAt ? new Date(agenda.scheduledAt).toISOString().slice(0, 16) : '';
  fillMatchOptions(agenda?.matchId || '');
  $('agendaModal').classList.add('open');
  $('agendaModal').setAttribute('aria-hidden', 'false');
  setTimeout(() => (focusSchedule ? $('agendaSchedule') : $('agendaTitle')).focus(), 0);
}

function closeAgendaModal() {
  $('agendaModal').classList.remove('open');
  $('agendaModal').setAttribute('aria-hidden', 'true');
}

function deleteAgenda(id) {
  const agenda = (editorial.agendas || []).find(item => item.id === id);
  if (!agenda || !confirm(`Excluir a pauta “${agenda.title}”?`)) return;
  editorial.agendas = (editorial.agendas || []).filter(item => item.id !== id);
  persist();
  render();
}

$('agendaForm').onsubmit = event => {
  event.preventDefault();
  const title = $('agendaTitle').value.trim();
  if (!title) return;
  const id = $('agendaId').value || `agenda-${Date.now()}`;
  const previous = (editorial.agendas || []).find(item => item.id === id);
  const scheduledValue = $('agendaSchedule').value;
  let agenda = {
    ...previous,
    id,
    title,
    description: $('agendaDescription').value.trim(),
    priority: $('agendaPriority').value,
    category: $('agendaCategory').value,
    matchId: $('agendaMatch').value,
    author: $('agendaAuthor').value.trim() || 'Redação RodriGol',
    status: $('agendaStatus').value,
    channel: resolveStudioRegion($('agendaChannel').value),
    scheduledAt: scheduledValue ? new Date(scheduledValue).toISOString() : '',
    createdAt: previous?.createdAt || nowIso()
  };
  if (agenda.scheduledAt && agenda.status !== 'PUBLISHED') agenda.status = 'SCHEDULED';
  agenda = appendAgendaHistory(agenda, previous ? 'Pauta atualizada' : 'Pauta criada', agendaStatusLabel(agenda.status));
  editorial.agendas = [agenda, ...(editorial.agendas || []).filter(item => item.id !== id)];
  persist();
  closeAgendaModal();
  render();
};

$('agendaCancel').onclick = closeAgendaModal;
$('agendaClose').onclick = closeAgendaModal;
$('agendaModal').onclick = event => { if (event.target === $('agendaModal')) closeAgendaModal(); };
window.addEventListener('keydown', event => { if (event.key === 'Escape' && $('agendaModal').classList.contains('open')) closeAgendaModal(); });

$('refresh').onclick = render;
$('globalSearch').oninput = render;
$('newAgenda').onclick = () => openAgendaModal();
document.querySelectorAll('[data-filter]').forEach(button => {
  button.onclick = () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('selected', item === button));
    render();
    $('agendaPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
});

async function health() {
  try {
    const response = await fetch('/health', { cache: 'no-store' });
    if (!response.ok) throw new Error('Bridge indisponível');
    const data = await response.json();
    $('bridgeStatus').textContent = `Online · ${data.connections} overlay(s)`;
  } catch {
    $('bridgeStatus').textContent = 'Bridge indisponível';
  }
}

async function publishScheduled() {
  const now = Date.now();
  const dueAgendas = (editorial.agendas || []).filter(agenda =>
    agenda.status === 'SCHEDULED' &&
    agenda.scheduledAt &&
    new Date(agenda.scheduledAt).getTime() <= now &&
    !agenda.publishedAt
  );
  for (const agenda of dueAgendas) {
    try { await publishAgenda(agenda.id, true); } catch { /* tenta novamente no próximo ciclo */ }
  }

  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  for (const event of allEvents().filter(item => statusOf(item) === 'SCHEDULED' && dataOf(item).scheduledTime === currentTime)) {
    try { await publishEvent(event); } catch { /* tenta novamente no próximo ciclo */ }
  }
}

setInterval(() => {
  $('now').textContent = new Date().toLocaleTimeString('pt-BR');
  $('today').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}, 1000);
setInterval(health, 3000);
setInterval(publishScheduled, 15000);
window.addEventListener('storage', () => { editorial = getEditorialState(); render(); });
window.addEventListener('rodrigol:data-changed', event => {
  if (event.detail?.key === 'rodrigol-editorial-v1') editorial = getEditorialState();
  render();
});

render();
health();
publishScheduled();
