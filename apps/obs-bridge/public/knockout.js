import {
  getCompetitions,
  getClubs,
  getMatches,
  readCoverage,
  getCompetitionKnockout,
  saveCompetitionKnockout,
  uid
} from './data-store.js';

const $ = id => document.getElementById(id);
let competitionId = '';
let model = { competitionId: '', season: '', phases: [] };

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const clubs = () => getClubs();
const clubById = id => clubs().find(club => club.id === id);
const matches = () => getMatches();

function clubOptions(selected = '') {
  return `<option value="">A definir</option>${clubs().map(club =>
    `<option value="${esc(club.id)}" ${club.id === selected ? 'selected' : ''}>${esc(club.shortName || club.name)}</option>`
  ).join('')}`;
}

function matchOptions(selected = '', homeClubId = '', awayClubId = '') {
  const relevant = matches().filter(match => {
    if (!homeClubId || !awayClubId) return true;
    return [match.homeClubId, match.awayClubId].includes(homeClubId)
      && [match.homeClubId, match.awayClubId].includes(awayClubId);
  });
  return `<option value="">Preenchimento manual</option>${relevant.map(match => {
    const home = clubById(match.homeClubId)?.shortName || 'Mandante';
    const away = clubById(match.awayClubId)?.shortName || 'Visitante';
    const label = `${match.date || 'Data não informada'} · ${home} x ${away}`;
    return `<option value="${esc(match.id)}" ${match.id === selected ? 'selected' : ''}>${esc(label)}</option>`;
  }).join('')}`;
}

function coverageFor(matchId) {
  if (!matchId) return null;
  return readCoverage(matchId, { homeScore: 0, awayScore: 0, phase: 'PRE_GAME' });
}

function scoreForClub(matchId, clubId) {
  const match = matches().find(item => item.id === matchId);
  const coverage = coverageFor(matchId);
  if (!match || !coverage || !clubId) return null;
  if (match.homeClubId === clubId) return Number(coverage.homeScore) || 0;
  if (match.awayClubId === clubId) return Number(coverage.awayScore) || 0;
  return null;
}

function syncTieFromMatches(tie, legMode) {
  if (legMode === 'SINGLE' && tie.singleMatchId) {
    const home = scoreForClub(tie.singleMatchId, tie.homeClubId);
    const away = scoreForClub(tie.singleMatchId, tie.awayClubId);
    if (home !== null) tie.homeScore = home;
    if (away !== null) tie.awayScore = away;
  }

  if (legMode === 'TWO_LEGS') {
    if (tie.firstLegMatchId) {
      const home = scoreForClub(tie.firstLegMatchId, tie.homeClubId);
      const away = scoreForClub(tie.firstLegMatchId, tie.awayClubId);
      if (home !== null) tie.firstLegHomeScore = home;
      if (away !== null) tie.firstLegAwayScore = away;
    }
    if (tie.secondLegMatchId) {
      const home = scoreForClub(tie.secondLegMatchId, tie.awayClubId);
      const away = scoreForClub(tie.secondLegMatchId, tie.homeClubId);
      if (home !== null) tie.secondLegHomeScore = home;
      if (away !== null) tie.secondLegAwayScore = away;
    }
    tie.aggregateHome = (Number(tie.firstLegHomeScore) || 0) + (Number(tie.secondLegAwayScore) || 0);
    tie.aggregateAway = (Number(tie.firstLegAwayScore) || 0) + (Number(tie.secondLegHomeScore) || 0);
  }
}

function notify(text) {
  $('notice').textContent = text;
  $('notice').classList.add('show');
  setTimeout(() => $('notice').classList.remove('show'), 2600);
}

function load(id) {
  competitionId = id;
  model = getCompetitionKnockout(id);
  const competition = getCompetitions().find(item => item.id === id);
  if (!model.season) model.season = competition?.season || '';
  $('season').value = model.season || '';
  resolveAdvancement();
  model.phases.forEach(phase => phase.ties.forEach(tie => syncTieFromMatches(tie, phase.legMode)));
  render();
}

function allEarlierTies(phaseIndex) {
  return model.phases.slice(0, phaseIndex).flatMap((phase, earlierIndex) =>
    phase.ties.map((tie, tieIndex) => ({ tie, phase, phaseIndex: earlierIndex, tieIndex }))
  );
}

function sourceOptions(phaseIndex, selected = '') {
  const options = allEarlierTies(phaseIndex).map(({ tie, phase, tieIndex }) => {
    const home = tie.homeClubName || clubById(tie.homeClubId)?.shortName || 'A definir';
    const away = tie.awayClubName || clubById(tie.awayClubId)?.shortName || 'A definir';
    const label = `${phase.name} · Confronto ${tieIndex + 1} (${home} x ${away})`;
    return `<option value="${esc(tie.id)}" ${tie.id === selected ? 'selected' : ''}>Vencedor · ${esc(label)}</option>`;
  }).join('');
  return `<option value="">Definição manual</option>${options}`;
}

function readForm() {
  model.season = $('season').value.trim();
  document.querySelectorAll('[data-phase]').forEach((node, phaseIndex) => {
    const phase = model.phases[phaseIndex];
    phase.name = node.querySelector('[data-phase-name]').value.trim() || `Fase ${phaseIndex + 1}`;
    phase.legMode = node.querySelector('[data-leg-mode]').value;

    node.querySelectorAll('[data-tie]').forEach((tieNode, tieIndex) => {
      const tie = phase.ties[tieIndex];
      for (const key of [
        'homeClubId', 'awayClubId', 'homeSourceTieId', 'awaySourceTieId',
        'singleMatchId', 'firstLegMatchId', 'secondLegMatchId',
        'winnerClubId', 'status', 'notes'
      ]) {
        const element = tieNode.querySelector(`[data-${key}]`);
        if (element) tie[key] = element.value;
      }
      for (const key of [
        'homeScore', 'awayScore', 'firstLegHomeScore', 'firstLegAwayScore',
        'secondLegHomeScore', 'secondLegAwayScore', 'penaltiesHome', 'penaltiesAway'
      ]) {
        const element = tieNode.querySelector(`[data-${key}]`);
        if (element) tie[key] = Number(element.value) || 0;
      }
      tie.homeClubName = clubById(tie.homeClubId)?.shortName || '';
      tie.awayClubName = clubById(tie.awayClubId)?.shortName || '';
      tie.winnerClubName = clubById(tie.winnerClubId)?.shortName || '';
      syncTieFromMatches(tie, phase.legMode);
    });
  });
}

function tieMap() {
  return new Map(model.phases.flatMap(phase => phase.ties).map(tie => [tie.id, tie]));
}

function resolveAdvancement() {
  const byId = tieMap();
  let changes = 0;
  model.phases.forEach(phase => {
    phase.ties.forEach(tie => {
      for (const side of ['home', 'away']) {
        const sourceId = tie[`${side}SourceTieId`];
        if (!sourceId) continue;
        const source = byId.get(sourceId);
        if (!source?.winnerClubId) continue;
        const key = `${side}ClubId`;
        if (tie[key] !== source.winnerClubId) {
          tie[key] = source.winnerClubId;
          tie[`${side}ClubName`] = source.winnerClubName || clubById(source.winnerClubId)?.shortName || '';
          changes += 1;
        }
      }
      syncTieFromMatches(tie, phase.legMode);
    });
  });
  return changes;
}

function connectPreviousPhase(phaseIndex) {
  if (phaseIndex <= 0) return;
  readForm();
  const previous = model.phases[phaseIndex - 1];
  const current = model.phases[phaseIndex];
  if (!previous.ties.length || !current.ties.length) {
    notify('Crie os confrontos nas duas fases antes de conectá-las.');
    return;
  }
  current.ties.forEach((tie, index) => {
    tie.homeSourceTieId = previous.ties[index * 2]?.id || '';
    tie.awaySourceTieId = previous.ties[index * 2 + 1]?.id || '';
  });
  resolveAdvancement();
  render();
  notify('Fase conectada aos vencedores da fase anterior.');
}

function render() {
  const empty = !competitionId || !model.phases.length;
  $('emptyState').style.display = empty ? 'block' : 'none';
  $('phaseList').innerHTML = model.phases.map((phase, phaseIndex) => `
    <article class="phase-card" data-phase>
      <div class="phase-head">
        <label>Nome da fase<input data-phase-name value="${esc(phase.name)}" placeholder="Quartas de final"/></label>
        <label>Formato<select data-leg-mode>
          <option value="SINGLE" ${phase.legMode === 'SINGLE' ? 'selected' : ''}>Partida única</option>
          <option value="TWO_LEGS" ${phase.legMode === 'TWO_LEGS' ? 'selected' : ''}>Ida e volta</option>
        </select></label>
        <div class="row-actions">
          ${phaseIndex > 0 ? `<button class="connect-btn" data-connect-phase="${phaseIndex}">Conectar fase anterior</button>` : ''}
          <button data-up-phase="${phaseIndex}">↑</button><button data-down-phase="${phaseIndex}">↓</button><button data-delete-phase="${phaseIndex}">Excluir fase</button>
        </div>
      </div>
      <div class="phase-flow">${phaseIndex === 0 ? 'Fase inicial: participantes definidos manualmente.' : 'Escolha a origem de cada vaga ou conecte a fase anterior.'}</div>
      <div class="ties">${phase.ties.map((tie, tieIndex) => tieMarkup(phase, tie, phaseIndex, tieIndex)).join('') || '<div class="empty">Nenhum confronto nesta fase.</div>'}</div>
      <div class="phase-actions"><button class="btn" data-add-tie="${phaseIndex}">+ Adicionar confronto</button></div>
    </article>`).join('');
  bind();
}

function tieMarkup(phase, tie, phaseIndex, tieIndex) {
  const winnerClass = tie.winnerClubId ? ' winner' : '';
  const homeAutomatic = Boolean(tie.homeSourceTieId);
  const awayAutomatic = Boolean(tie.awaySourceTieId);
  const homeName = clubById(tie.homeClubId)?.shortName || tie.homeClubName || 'Mandante';
  const awayName = clubById(tie.awayClubId)?.shortName || tie.awayClubName || 'Visitante';
  syncTieFromMatches(tie, phase.legMode);

  const matchSection = phase.legMode === 'TWO_LEGS' ? `
    <div class="leg-section">
      <h4>Jogo de ida</h4>
      <label class="full">Partida cadastrada<select data-firstLegMatchId>${matchOptions(tie.firstLegMatchId, tie.homeClubId, tie.awayClubId)}</select></label>
      <div class="leg-score"><span>${esc(homeName)}</span><input type="number" min="0" data-firstLegHomeScore value="${tie.firstLegHomeScore || 0}" ${tie.firstLegMatchId ? 'disabled' : ''}/><b>x</b><input type="number" min="0" data-firstLegAwayScore value="${tie.firstLegAwayScore || 0}" ${tie.firstLegMatchId ? 'disabled' : ''}/><span>${esc(awayName)}</span></div>
    </div>
    <div class="leg-section">
      <h4>Jogo de volta</h4>
      <label class="full">Partida cadastrada<select data-secondLegMatchId>${matchOptions(tie.secondLegMatchId, tie.homeClubId, tie.awayClubId)}</select></label>
      <div class="leg-score"><span>${esc(awayName)}</span><input type="number" min="0" data-secondLegHomeScore value="${tie.secondLegHomeScore || 0}" ${tie.secondLegMatchId ? 'disabled' : ''}/><b>x</b><input type="number" min="0" data-secondLegAwayScore value="${tie.secondLegAwayScore || 0}" ${tie.secondLegMatchId ? 'disabled' : ''}/><span>${esc(homeName)}</span></div>
    </div>
    <div class="aggregate-box"><span>AGREGADO AUTOMÁTICO</span><strong>${esc(homeName)} ${tie.aggregateHome || 0} x ${tie.aggregateAway || 0} ${esc(awayName)}</strong></div>` : `
    <div class="leg-section single-leg">
      <h4>Partida única</h4>
      <label class="full">Partida cadastrada<select data-singleMatchId>${matchOptions(tie.singleMatchId, tie.homeClubId, tie.awayClubId)}</select></label>
      <div class="leg-score"><span>${esc(homeName)}</span><input type="number" min="0" data-homeScore value="${tie.homeScore || 0}" ${tie.singleMatchId ? 'disabled' : ''}/><b>x</b><input type="number" min="0" data-awayScore value="${tie.awayScore || 0}" ${tie.singleMatchId ? 'disabled' : ''}/><span>${esc(awayName)}</span></div>
    </div>`;

  return `<div class="tie-card${winnerClass}" data-tie>
    ${phaseIndex > 0 ? `<div class="source-grid"><label>Origem da vaga do mandante<select data-homeSourceTieId>${sourceOptions(phaseIndex, tie.homeSourceTieId)}</select></label><label>Origem da vaga do visitante<select data-awaySourceTieId>${sourceOptions(phaseIndex, tie.awaySourceTieId)}</select></label></div>` : ''}
    <div class="tie-participants"><label>Clube A<select data-homeClubId ${homeAutomatic ? 'disabled' : ''}>${clubOptions(tie.homeClubId)}</select></label><div class="versus">CONFRONTO ${tieIndex + 1}</div><label>Clube B<select data-awayClubId ${awayAutomatic ? 'disabled' : ''}>${clubOptions(tie.awayClubId)}</select></label></div>
    <div class="match-entities">${matchSection}</div>
    ${phase.legMode === 'TWO_LEGS' ? `<div class="penalties-grid"><label>Pênaltis · ${esc(homeName)}<input type="number" min="0" data-penaltiesHome value="${tie.penaltiesHome || 0}"/></label><label>Pênaltis · ${esc(awayName)}<input type="number" min="0" data-penaltiesAway value="${tie.penaltiesAway || 0}"/></label></div>` : ''}
    <div class="tie-footer"><label>Status<select data-status><option value="SCHEDULED" ${tie.status === 'SCHEDULED' ? 'selected' : ''}>Programado</option><option value="LIVE" ${tie.status === 'LIVE' ? 'selected' : ''}>Em andamento</option><option value="FINISHED" ${tie.status === 'FINISHED' ? 'selected' : ''}>Finalizado</option><option value="CONFIRMED" ${tie.status === 'CONFIRMED' ? 'selected' : ''}>Classificado confirmado</option></select></label><label>Classificado<select data-winnerClubId><option value="">Ainda não definido</option>${clubOptions(tie.winnerClubId).replace('<option value="">A definir</option>', '')}</select></label><label>Observações<input data-notes value="${esc(tie.notes || '')}" placeholder="Classificado nos pênaltis"/></label><div class="row-actions"><button data-up-tie="${phaseIndex}:${tieIndex}">↑</button><button data-down-tie="${phaseIndex}:${tieIndex}">↓</button><button data-delete-tie="${phaseIndex}:${tieIndex}">Excluir</button></div></div>
  </div>`;
}

function blankTie(order) {
  return { id: uid('tie'), order, homeClubId: '', awayClubId: '', homeSourceTieId: '', awaySourceTieId: '', singleMatchId: '', firstLegMatchId: '', secondLegMatchId: '', homeScore: 0, awayScore: 0, firstLegHomeScore: 0, firstLegAwayScore: 0, secondLegHomeScore: 0, secondLegAwayScore: 0, aggregateHome: 0, aggregateAway: 0, penaltiesHome: 0, penaltiesAway: 0, winnerClubId: '', status: 'SCHEDULED', notes: '' };
}

function bind() {
  document.querySelectorAll('[data-add-tie]').forEach(button => { button.onclick = () => { readForm(); const phase = model.phases[Number(button.dataset.addTie)]; phase.ties.push(blankTie(phase.ties.length + 1)); render(); }; });
  document.querySelectorAll('[data-connect-phase]').forEach(button => { button.onclick = () => connectPreviousPhase(Number(button.dataset.connectPhase)); });
  document.querySelectorAll('[data-delete-phase]').forEach(button => { button.onclick = () => { readForm(); model.phases.splice(Number(button.dataset.deletePhase), 1); render(); }; });
  document.querySelectorAll('[data-up-phase],[data-down-phase]').forEach(button => { button.onclick = () => { readForm(); const index = Number(button.dataset.upPhase ?? button.dataset.downPhase); const direction = button.hasAttribute('data-up-phase') ? -1 : 1; const target = index + direction; if (target < 0 || target >= model.phases.length) return; [model.phases[index], model.phases[target]] = [model.phases[target], model.phases[index]]; render(); }; });
  document.querySelectorAll('[data-delete-tie]').forEach(button => { button.onclick = () => { readForm(); const [phaseIndex, tieIndex] = button.dataset.deleteTie.split(':').map(Number); const removedId = model.phases[phaseIndex].ties[tieIndex]?.id; model.phases[phaseIndex].ties.splice(tieIndex, 1); model.phases.forEach(phase => phase.ties.forEach(tie => { if (tie.homeSourceTieId === removedId) tie.homeSourceTieId = ''; if (tie.awaySourceTieId === removedId) tie.awaySourceTieId = ''; })); render(); }; });
  document.querySelectorAll('[data-up-tie],[data-down-tie]').forEach(button => { button.onclick = () => { readForm(); const raw = button.dataset.upTie ?? button.dataset.downTie; const [phaseIndex, tieIndex] = raw.split(':').map(Number); const direction = button.hasAttribute('data-up-tie') ? -1 : 1; const target = tieIndex + direction; const ties = model.phases[phaseIndex].ties; if (target < 0 || target >= ties.length) return; [ties[tieIndex], ties[target]] = [ties[target], ties[tieIndex]]; render(); }; });
  document.querySelectorAll('[data-leg-mode],[data-homeClubId],[data-awayClubId],[data-singleMatchId],[data-firstLegMatchId],[data-secondLegMatchId],[data-homeSourceTieId],[data-awaySourceTieId],[data-winnerClubId],[data-status]').forEach(select => { select.onchange = () => { readForm(); resolveAdvancement(); render(); }; });
}

function init() {
  const competitions = getCompetitions();
  $('competitionSelect').innerHTML = '<option value="">Selecione...</option>' + competitions.map(competition => `<option value="${esc(competition.id)}">${esc(competition.name)} — ${esc(competition.season || '')}</option>`).join('');
  const requested = new URLSearchParams(location.search).get('competition');
  if (requested && competitions.some(item => item.id === requested)) { $('competitionSelect').value = requested; load(requested); }
  $('competitionSelect').onchange = event => load(event.target.value);
  $('addPhase').onclick = () => { if (!competitionId) return notify('Selecione uma competição.'); readForm(); model.phases.push({ id: uid('phase'), name: `Fase ${model.phases.length + 1}`, order: model.phases.length + 1, legMode: 'SINGLE', ties: [] }); render(); };
  $('recalculate').onclick = () => { if (!competitionId) return notify('Selecione uma competição.'); readForm(); const changes = resolveAdvancement(); render(); notify(changes ? `${changes} vaga(s) atualizada(s) automaticamente.` : 'O chaveamento já está atualizado.'); };
  $('saveAll').onclick = () => { if (!competitionId) return notify('Selecione uma competição.'); readForm(); const changes = resolveAdvancement(); model.phases.forEach((phase, phaseIndex) => { phase.order = phaseIndex + 1; phase.ties.forEach((tie, tieIndex) => tie.order = tieIndex + 1); }); saveCompetitionKnockout(competitionId, model); notify(changes ? `Estrutura salva e ${changes} vaga(s) avançada(s).` : 'Estrutura eliminatória salva com sucesso.'); render(); };
}

init();
