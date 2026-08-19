import { publishCommand } from './bridge-client.js';
import {
  getMatches, getClub, readCoverage, uid,
  getOverlayControlState, saveOverlayControlState, getCompetitions, getRounds, getStandingsState, getSidebarSequenceState, saveSidebarSequenceState, getSidebarLowerState, saveSidebarLowerState, getClubs, findCompetitionByName, getKnockoutState, setOnAirMatchId, setActiveMatchId
} from './data-store.js';
import { standingPanel } from './standings-engine.js';
import { buildMatchPresentationPayload, deriveVisualState, formatClockSeconds, getEffectiveElapsedSeconds, normalizeCoverage, scheduledDisplay, shouldShowClock } from './match-presentation.js';

const $ = id => document.getElementById(id);
const FALLBACK = { homeScore:0, awayScore:0, homeScorers:[], awayScorers:[], events:[], phase:'PRE_GAME', elapsedSeconds:0, clockRunning:false, clockStartedAt:null };
const PHASES = { SCHEDULED:'PROGRAMADO', PRE_GAME:'PRÉ-JOGO', FIRST_HALF:'1º TEMPO', HALFTIME:'INTERVALO', SECOND_HALF:'2º TEMPO', EXTRA_TIME:'PRORROGAÇÃO', PENALTIES:'PÊNALTIS', FINAL:'FINAL' };
// Compatibilidade dos testes e documentação: {type:'show',region:'round-scoreboard'} · PUBLICADO · ${payload.length} JOGO(S)
let state = getOverlayControlState();
let selectedCollectionId = state.activeCollectionId;
let matchListFilter = 'ALL';

function esc(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function collection(){return state.collections.find(item=>item.id===selectedCollectionId)||state.collections[0]||null;}
function matchState(match){return normalizeCoverage(match, readCoverage(match.id, null));}
function elapsed(coverage){return getEffectiveElapsedSeconds(coverage);}
function clock(value){return formatClockSeconds(value);}
function club(id,side){return getClub(id)||{name:side,shortName:side,abbreviation:side.slice(0,3).toUpperCase(),primaryColor:'#18394a',secondaryColor:'#fff',crestText:side[0],crestDataUrl:''};}
function crestPayload(item){return {text:item.crestText||item.abbreviation||'?',image:item.crestDataUrl||'',background:item.primaryColor||'#18394a',color:item.secondaryColor||'#fff'};}
function scorerObjects(values=[]){return values.map(text=>{const parts=String(text).trim().split(/\s+/);return {minute:parts.shift()||'',player:parts.join(' ')};});}
function payloadFor(match){
  const coverage=matchState(match),home=club(match.homeClubId,'Mandante'),away=club(match.awayClubId,'Visitante'),presentation=buildMatchPresentationPayload(match, coverage);
  return {
    matchId:match.id,competition:match.competition||'Competição',competitionShort:match.competitionShort||'',round:match.round||'',
    ...presentation,
    venue:[match.venue,match.city].filter(Boolean).join(' · ')||'Local não informado',
    homeName:home.shortName||home.name,awayName:away.shortName||away.name,homeShort:home.abbreviation,awayShort:away.abbreviation,
    homeCrest:crestPayload(home),awayCrest:crestPayload(away),
    homeScorers:coverage.homeScorers||[],awayScorers:coverage.awayScorers||[],
    scorers:[...(coverage.homeScorers||[]),...(coverage.awayScorers||[])].join(' · '),
    goals:[...scorerObjects(coverage.homeScorers||[]),...scorerObjects(coverage.awayScorers||[])],
    chronology:Array.isArray(coverage.events)?coverage.events.slice(0,8):[],
    lineups:coverage.lineups||{home:{coach:'',formation:'',starters:[],bench:[]},away:{coach:'',formation:'',starters:[],bench:[]}},
    referee:coverage.referee||match.referee||'',
    attendance:coverage.attendance||match.attendance||'',
    weather:coverage.weather||match.weather||''
  };
}
function currentActiveCollection(){return state.collections.find(item=>item.id===state.activeCollectionId)||state.collections[0]||null;}
function activePayload(){const current=currentActiveCollection();const map=new Map(getMatches().map(match=>[match.id,match]));return (current?.matchIds||[]).map(id=>map.get(id)).filter(Boolean).map(payloadFor);}
function mainPayload(){const map=new Map(getMatches().map(match=>[match.id,match]));const match=map.get(state.activeMainMatchId)||map.get(currentActiveCollection()?.matchIds?.[0]);if(!match)return null;const payload=payloadFor(match);return {...payload,competition:[payload.competition,match.round].filter(Boolean).join(' · ').toUpperCase(),homeScorers:payload.homeScorers.join(' · ')||'—',awayScorers:payload.awayScorers.join(' · ')||'—',message:payload.status};}
function tickerSourceMatches(){
  const all=getMatches(),active=currentActiveCollection(),selectedIds=new Set(active?.matchIds||[]),selected=all.filter(m=>selectedIds.has(m.id));
  const explicitRoundId=String(state.yellowTickerRoundId||'');
  const selectedRoundIds=new Set(selected.map(m=>String(m.roundId||'')).filter(Boolean));
  const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})();
  let source=all;
  if(state.yellowTickerScope==='SELECTED')source=selected;
  else if(state.yellowTickerScope==='ROUND')source=explicitRoundId?all.filter(m=>String(m.roundId||'')===explicitRoundId):all.filter(m=>selectedRoundIds.has(String(m.roundId||'')));
  else if(state.yellowTickerScope==='BOTH')source=all.filter(m=>m.date===today||(explicitRoundId?String(m.roundId||'')===explicitRoundId:selectedRoundIds.has(String(m.roundId||''))));
  else source=all.filter(m=>m.date===today);
  return source.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||'')));
}
function summaryPayload(){return tickerSourceMatches().map(payloadFor).filter(item=>{const v=deriveVisualState(null,{phase:item.phase});if(v.beforeKickoff)return state.yellowTickerIncludeScheduled!==false;if(v.isFinal)return state.yellowTickerIncludeFinal!==false;return state.yellowTickerIncludeLive!==false;}).map(item=>({...item,mode:state.yellowTickerMode,speedSeconds:state.yellowTickerSpeed}));}
function renderTickerControls(){
  const competitionSelect=$('tickerCompetition'),roundSelect=$('tickerRound'),scope=$('tickerScope');if(!competitionSelect||!roundSelect||!scope)return;
  const competitions=getCompetitions();
  competitionSelect.innerHTML='<option value="">Selecione</option>'+competitions.map(c=>`<option value="${esc(c.id)}">${esc(c.shortName||c.name)}</option>`).join('');
  competitionSelect.value=state.yellowTickerCompetitionId||'';
  const rounds=getRounds({competitionId:competitionSelect.value||undefined});
  roundSelect.innerHTML='<option value="">Selecione</option>'+rounds.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  roundSelect.value=state.yellowTickerRoundId||'';
  const needsRound=['ROUND','BOTH'].includes(scope.value);competitionSelect.disabled=!needsRound;roundSelect.disabled=!needsRound;
  const payload=summaryPayload(),preview=$('tickerPreview');if(preview){if(!payload.length){preview.innerHTML='<b>PRÉVIA</b><span> Nenhuma partida encontrada para a configuração atual.</span>';}else{preview.innerHTML=`<b>PRÉVIA · ${payload.length} JOGO(S)</b><span> ${payload.slice(0,3).map(i=>`${esc(i.homeName)} ${i.homeScore} x ${i.awayScore} ${esc(i.awayName)}${i.scorers?` — ${esc(i.scorers)}`:''}`).join(' · ')}</span>`;}}
}
async function command(body){return publishCommand(body);}
async function publishRegion(region,payload,label,showFeedback=true){try{await command({type:'show',region,payload});if(showFeedback)showSuccess(label);return true;}catch(error){showFailure(error);return false;}}
function showSuccess(label){$('bridgeBadge').textContent=`PUBLICADO · ${label}`;$('bridgeBadge').classList.add('ok');setTimeout(()=>health(),1800);}
function showFailure(error){$('bridgeBadge').textContent='ERRO AO PUBLICAR';$('bridgeBadge').classList.remove('ok');console.error('Falha ao publicar:',error);alert(`Não foi possível publicar no Overlay.\n\n${error.message}`);}
async function publishScoreboard(showFeedback=true){const button=$('publishActive');try{if(button)button.disabled=true;const payload=activePayload();return await publishRegion('round-scoreboard',payload,`${payload.length} JOGO(S)`,showFeedback);}finally{if(button)button.disabled=false;}}
async function publishMain(showFeedback=true){const payload=mainPayload();if(!payload){if(showFeedback)alert('Escolha um jogo principal antes de publicar.');return false;}return publishRegion('scoreboard',payload,'JOGO PRINCIPAL',showFeedback);}
async function publishSummary(showFeedback=true){return publishRegion('round-summary',summaryPayload(),state.yellowTickerMode==='POP'?'TICKER PIPOCANDO':'TICKER EM ROLAGEM',showFeedback);}
async function publishAll(){const button=$('publishAll');try{button.disabled=true;const scoreboard=await publishScoreboard(false);const main=await publishMain(false);const summary=await publishSummary(false);if(scoreboard&&main&&summary)showSuccess('TUDO');}finally{button.disabled=false;}}
function persist(){state=saveOverlayControlState(state);render();}
function ensureSelection(){if(!state.collections.some(item=>item.id===selectedCollectionId))selectedCollectionId=state.collections[0]?.id||'';}
function renderCollections(){ensureSelection();$('collectionList').innerHTML=state.collections.map(item=>`<button class="collection-card ${item.id===selectedCollectionId?'active':''} ${item.id===state.activeCollectionId?'on-air':''}" data-collection="${esc(item.id)}"><b>${esc(item.name)}</b><span>${esc(item.sport)}</span><small>${item.matchIds.length} de 6 eventos</small></button>`).join('');document.querySelectorAll('[data-collection]').forEach(button=>button.onclick=()=>{selectedCollectionId=button.dataset.collection;render();});}
function renderEditor(){const current=collection();const disabled=!current;for(const id of ['collectionName','collectionSport','saveCollection','duplicateCollection','deleteCollection','setActive'])$(id).disabled=disabled;if(!current){$('editorTitle').textContent='SCOREBOARD';$('editorSubtitle').textContent='Crie uma coleção para começar';$('matchSelector').innerHTML='';return;}$('editorTitle').textContent=current.name.toUpperCase();$('editorSubtitle').textContent=`${current.sport} · ${current.matchIds.length} eventos selecionados`;$('collectionName').value=current.name;$('collectionSport').value=current.sport;$('onAirBadge').textContent=current.id===state.activeCollectionId?'● NO AR':'FORA DO AR';$('onAirBadge').classList.toggle('live',current.id===state.activeCollectionId);$('tickerMode').value=state.yellowTickerMode;$('tickerSpeed').value=String(state.yellowTickerSpeed||60);if($('tickerScope'))$('tickerScope').value=state.yellowTickerScope||'DAY';if($('tickerScheduled'))$('tickerScheduled').checked=state.yellowTickerIncludeScheduled!==false;if($('tickerLive'))$('tickerLive').checked=state.yellowTickerIncludeLive!==false;if($('tickerFinal'))$('tickerFinal').checked=state.yellowTickerIncludeFinal!==false;renderTickerControls();renderMatches(current);}
function localDateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function matchOperationalState(match){const presentation=buildMatchPresentationPayload(match,matchState(match)),visual=deriveVisualState(null,{phase:presentation.phase});return {presentation,visual};}
function matchSortBucket(match,today){const {visual}=matchOperationalState(match);if(match.date===today&&!visual.beforeKickoff&&!visual.isFinal)return 0;if(match.date===today&&visual.beforeKickoff)return 1;if(match.date===today&&visual.isFinal)return 2;if(String(match.date||'')>today)return 3;if(visual.isFinal)return 5;return 4;}
function matchPassesListFilter(match,today){const {visual}=matchOperationalState(match);if(matchListFilter==='TODAY')return match.date===today;if(matchListFilter==='LIVE')return !visual.beforeKickoff&&!visual.isFinal;if(matchListFilter==='UPCOMING')return visual.beforeKickoff&&String(match.date||'')>=today;if(matchListFilter==='FINAL')return visual.isFinal;return true;}
function renderMatches(current){const selected=new Set(current.matchIds);const orderedIndex=new Map(current.matchIds.map((id,index)=>[id,index]));const today=localDateKey();const matches=[...getMatches()].filter(match=>matchPassesListFilter(match,today)).sort((a,b)=>{const bucket=matchSortBucket(a,today)-matchSortBucket(b,today);if(bucket)return bucket;const date=String(a.date||'9999-12-31').localeCompare(String(b.date||'9999-12-31'));if(date)return date;const time=String(a.time||'99:99').localeCompare(String(b.time||'99:99'));if(time)return time;const ai=orderedIndex.has(a.id)?orderedIndex.get(a.id):999,bi=orderedIndex.has(b.id)?orderedIndex.get(b.id):999;return ai-bi||String(a.competition||'').localeCompare(String(b.competition||''));});$('selectionCounter').textContent=`${current.matchIds.length} de 6`;const filter=$('matchListFilter');if(filter)filter.value=matchListFilter;$('matchSelector').innerHTML=matches.map(match=>{const home=club(match.homeClubId,'Mandante'),away=club(match.awayClubId,'Visitante'),isSelected=selected.has(match.id),index=current.matchIds.indexOf(match.id),isMain=match.id===state.activeMainMatchId,{presentation}=matchOperationalState(match);return `<article class="match-row ${isSelected?'selected':''} ${isMain?'main-selected':''}"><input class="match-check" type="checkbox" data-toggle-match="${esc(match.id)}" ${isSelected?'checked':''} ${!isSelected&&current.matchIds.length>=6?'disabled':''}><div class="match-info"><b>${esc(home.shortName)} x ${esc(away.shortName)}</b><small><span class="match-state-chip">${esc(presentation.status||'PROGRAMADO')}</span>${esc(match.competition||'Competição')} · ${esc(match.date||'Sem data')} ${esc(match.time||'')}</small></div><div class="match-actions"><button class="main-match-button ${isMain?'active':''}" data-main-match="${esc(match.id)}" title="Tornar jogo principal">★</button><div class="match-order"><button data-move="up" data-match="${esc(match.id)}" ${!isSelected||index<=0?'disabled':''}>▲</button><button data-move="down" data-match="${esc(match.id)}" ${!isSelected||index<0||index>=current.matchIds.length-1?'disabled':''}>▼</button></div></div></article>`}).join('')||'<div class="preview-empty">Nenhuma partida encontrada neste filtro.</div>';document.querySelectorAll('[data-toggle-match]').forEach(input=>input.onchange=()=>toggleMatch(input.dataset.toggleMatch,input.checked));document.querySelectorAll('[data-move]').forEach(button=>button.onclick=()=>moveMatch(button.dataset.match,button.dataset.move));document.querySelectorAll('[data-main-match]').forEach(button=>button.onclick=()=>setMainMatch(button.dataset.mainMatch));}
function toggleMatch(matchId,checked){const current=collection();if(!current)return;if(checked){if(current.matchIds.length>=6)return;current.matchIds.push(matchId);}else current.matchIds=current.matchIds.filter(id=>id!==matchId);current.updatedAt=new Date().toISOString();persist();if(current.id===state.activeCollectionId){publishScoreboard(false);publishSummary(false);}}
function moveMatch(matchId,direction){const current=collection();if(!current)return;const index=current.matchIds.indexOf(matchId);const next=direction==='up'?index-1:index+1;if(index<0||next<0||next>=current.matchIds.length)return;[current.matchIds[index],current.matchIds[next]]=[current.matchIds[next],current.matchIds[index]];current.updatedAt=new Date().toISOString();persist();if(current.id===state.activeCollectionId){publishScoreboard(false);publishSummary(false);}}
function setMainMatch(matchId){state.activeMainMatchId=matchId;setActiveMatchId(matchId);setOnAirMatchId(matchId);persist();publishMain();}
function crestHtml(crest){return crest.image?`<img src="${esc(crest.image)}" alt="">`:`<span style="background:${esc(crest.background)};color:${esc(crest.color)}">${esc(crest.text)}</span>`;}
function renderPreview(){const current=collection();const map=new Map(getMatches().map(match=>[match.id,match]));const items=(current?.matchIds||[]).map(id=>map.get(id)).filter(Boolean).map(payloadFor);$('scoreboardPreview').innerHTML=items.length?items.map(item=>`<article class="preview-match"><span class="preview-crest">${crestHtml(item.homeCrest)}</span><span class="preview-team">${esc(item.homeName)}</span><span class="preview-score">${item.homeScore} x ${item.awayScore}<small>${esc(item.status)} · ${esc(item.clock)}</small></span><span class="preview-team away">${esc(item.awayName)}</span><span class="preview-crest">${crestHtml(item.awayCrest)}</span></article>`).join(''):'<div class="preview-empty">Selecione até seis partidas para visualizar o scoreboard.</div>';}
function renderSummary(){const active=currentActiveCollection();const main=getMatches().find(match=>match.id===state.activeMainMatchId);const home=main?club(main.homeClubId,'Mandante'):null,away=main?club(main.awayClubId,'Visitante'):null;$('collectionCount').textContent=state.collections.length;$('activeName').textContent=active?.name||'—';$('activeCount').textContent=`${active?.matchIds.length||0}/6`;$('footerCollections').textContent=state.collections.length;$('footerSelected').textContent=active?.matchIds.length||0;$('mainMatchName').textContent=main?`${home.shortName} x ${away.shortName}`:'—';}


function mainHighlightContext(){
  const match=getMatches().find(item=>item.id===state.activeMainMatchId);
  if(!match)return {home:'Mandante',away:'Visitante'};
  const home=club(match.homeClubId,'Mandante'),away=club(match.awayClubId,'Visitante');
  return {home:home.shortName||home.name,away:away.shortName||away.name};
}
function resetMainHighlightForm(){
  if(!$('mainHighlightEditId'))return;
  $('mainHighlightEditId').value='';$('mainHighlightSide').value='HOME';$('mainHighlightTitle').value='';$('mainHighlightText').value='';$('mainHighlightAdd').textContent='＋ Adicionar';$('mainHighlightCancel').classList.add('hidden');
}
function renderMainHighlightEditor(){
  if(!$('mainHighlightMode'))return;
  const mode=state.mainHighlightMode==='MANUAL'?'MANUAL':'AUTO',context=mainHighlightContext(),items=Array.isArray(state.mainHighlightItems)?state.mainHighlightItems:[];
  $('mainHighlightMode').value=mode;$('mainHighlightInterval').value=String(state.mainHighlightInterval||8);
  $('mainHighlightComposer').classList.toggle('is-disabled',mode!=='MANUAL');
  $('mainHighlightHelp').innerHTML=mode==='AUTO'?`<b>AUTOMÁTICO</b> · O overlay usa os gols do jogo principal e troca os cards a cada ${Number(state.mainHighlightInterval)||8}s.`:`<b>MANUAL</b> · ${esc(context.home)} / ${esc(context.away)}. Monte a sequência que será exibida no quadro de Destaques.`;
  $('mainHighlightQueue').innerHTML=items.length?items.map((item,index)=>{const side=item.side==='HOME'?context.home:item.side==='AWAY'?context.away:'NEUTRO';return `<article class="rg-highlight-row ${item.active===false?'inactive':''}"><span class="rg-highlight-side">${esc(side)}</span><div class="rg-highlight-copy"><b>${esc(item.title||side)}</b><span>${esc(item.text||'Sem texto')}</span></div><div class="rg-highlight-actions"><button data-highlight-edit="${esc(item.id)}">Editar</button><button data-highlight-toggle="${esc(item.id)}">${item.active===false?'Ativar':'Pausar'}</button><button data-highlight-up="${esc(item.id)}" ${index===0?'disabled':''}>↑</button><button data-highlight-down="${esc(item.id)}" ${index===items.length-1?'disabled':''}>↓</button><button class="danger" data-highlight-delete="${esc(item.id)}">×</button></div></article>`}).join(''):'<div class="rg-empty-state">Nenhum destaque manual criado.</div>';
  document.querySelectorAll('[data-highlight-edit]').forEach(button=>button.onclick=()=>{const item=state.mainHighlightItems.find(x=>x.id===button.dataset.highlightEdit);if(!item)return;$('mainHighlightEditId').value=item.id;$('mainHighlightSide').value=item.side;$('mainHighlightTitle').value=item.title;$('mainHighlightText').value=item.text;$('mainHighlightAdd').textContent='✓ Salvar alteração';$('mainHighlightCancel').classList.remove('hidden');$('mainHighlightTitle').focus();});
  document.querySelectorAll('[data-highlight-toggle]').forEach(button=>button.onclick=()=>{const item=state.mainHighlightItems.find(x=>x.id===button.dataset.highlightToggle);if(!item)return;item.active=item.active===false;persist();});
  const move=(id,delta)=>{const i=state.mainHighlightItems.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=state.mainHighlightItems.length)return;[state.mainHighlightItems[i],state.mainHighlightItems[j]]=[state.mainHighlightItems[j],state.mainHighlightItems[i]];persist();};
  document.querySelectorAll('[data-highlight-up]').forEach(button=>button.onclick=()=>move(button.dataset.highlightUp,-1));document.querySelectorAll('[data-highlight-down]').forEach(button=>button.onclick=()=>move(button.dataset.highlightDown,1));
  document.querySelectorAll('[data-highlight-delete]').forEach(button=>button.onclick=()=>{state.mainHighlightItems=state.mainHighlightItems.filter(x=>x.id!==button.dataset.highlightDelete);resetMainHighlightForm();persist();});
}

function sidebarCompetitionId(value=''){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'competicao';}
function sidebarItemKey(item){return [item.type,item.competitionId,item.phaseId||''].join(':');}
function sidebarCandidates(){
  const comps=getCompetitions(),matches=getMatches(),standing=getStandingsState(),knockout=getKnockoutState();
  const used=new Set(),items=[];
  for(const match of matches){
    const comp=findCompetitionByName(match.competition),id=comp?.id||sidebarCompetitionId(match.competition),key=`matches:${id}:`;
    if(id&&!used.has(key)){used.add(key);items.push({type:'matches',competitionId:id,phaseId:'',label:`Jogos · ${comp?.shortName||match.competition||'Competição'}`});}
  }
  for(const tableId of standing.publishedTableIds||standing.publishedCompetitionIds||[]){
    const meta=standing.tableMeta?.[tableId]||{},competitionId=meta.competitionId||String(tableId).split('__')[0],comp=comps.find(c=>c.id===competitionId),phaseId=tableId===competitionId?'':tableId;
    items.push({type:'standings',competitionId,phaseId,label:`Classificação · ${comp?.shortName||comp?.name||competitionId}${meta.name?` · ${meta.name}`:''}`});
  }
  for(const [competitionId,model] of Object.entries(knockout.competitions||{})){
    const comp=comps.find(c=>c.id===competitionId);
    for(const phase of model.phases||[]){
      if(!(phase.ties||[]).length)continue;
      items.push({type:'knockout',competitionId,phaseId:phase.id,label:`Confrontos · ${comp?.shortName||comp?.name||competitionId} · ${phase.name}`});
    }
  }
  return items;
}
function knockoutStatus(status){return ({SCHEDULED:'PROGRAMADO',LIVE:'EM ANDAMENTO',FINISHED:'FINALIZADO',CONFIRMED:'CLASSIFICADO'})[status]||status||'PROGRAMADO';}
function knockoutPanel(competition,model,phase,clubs){
  const legMode=phase.legMode==='TWO_LEGS'?'IDA E VOLTA':'PARTIDA ÚNICA';
  const matchById=new Map(getMatches().map(match=>[match.id,match]));
  const now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const legText=(matchId,homeName,awayName,storedHome,storedAway)=>{
    const match=matchById.get(matchId);
    if(!match)return `${homeName} ${Number(storedHome)||0} x ${Number(storedAway)||0} ${awayName}`;
    const coverage=matchState(match),presentation=buildMatchPresentationPayload(match,coverage);
    if(presentation.beforeKickoff){
      if(String(match.date||'')===today&&match.time)return `${match.time} · ${homeName} x ${awayName}`;
      if(match.date){const parts=String(match.date).split('-');return `${parts.length===3?`${parts[2]}/${parts[1]}`:match.date} · ${homeName} x ${awayName}`;}
      return `${homeName} x ${awayName}`;
    }
    return `${homeName} ${Number(presentation.homeScore)||0} x ${Number(presentation.awayScore)||0} ${awayName}`;
  };
  return {
    key:`knockout:${competition?.id||model.competitionId}:${phase.id}`,
    competitionId:competition?.id||model.competitionId,
    phaseId:phase.id,
    title:`CONFRONTOS · ${competition?.shortName||competition?.name||'COMPETIÇÃO'}`,
    subtitle:`${phase.name} · ${legMode}`,
    type:'knockout',
    items:(phase.ties||[]).map(tie=>{
      const home=clubs.get(tie.homeClubId)?.shortName||tie.homeClubName||'A definir';
      const away=clubs.get(tie.awayClubId)?.shortName||tie.awayClubName||'A definir';
      const winner=clubs.get(tie.winnerClubId)?.shortName||tie.winnerClubName||'';
      const firstLeg=phase.legMode==='TWO_LEGS'?legText(tie.firstLegMatchId,home,away,tie.firstLegHomeScore,tie.firstLegAwayScore):'';
      const secondLeg=phase.legMode==='TWO_LEGS'?legText(tie.secondLegMatchId,away,home,tie.secondLegHomeScore,tie.secondLegAwayScore):'';
      const aggregate=phase.legMode==='TWO_LEGS'?`${Number(tie.aggregateHome)||0} x ${Number(tie.aggregateAway)||0}`:'';
      const penalties=(Number(tie.penaltiesHome)||Number(tie.penaltiesAway))?`${Number(tie.penaltiesHome)||0} x ${Number(tie.penaltiesAway)||0}`:'';
      const centralHome=phase.legMode==='TWO_LEGS'?Number(tie.aggregateHome)||0:Number(tie.homeScore)||0;
      const centralAway=phase.legMode==='TWO_LEGS'?Number(tie.aggregateAway)||0:Number(tie.awayScore)||0;
      return {home,away,homeScore:centralHome,awayScore:centralAway,firstLeg,secondLeg,aggregate,penalties,status:knockoutStatus(tie.status),winner,notes:tie.notes||''};
    })
  };
}
function sidebarPayload(){
  const matches=getMatches(),competitions=getCompetitions(),standing=getStandingsState(),knockout=getKnockoutState(),clubs=new Map(getClubs().map(c=>[c.id,c]));
  const groups=new Map();
  const today=sidebarLowerTodayKey();
  for(const match of matches){
    if(String(match.date||'')!==today) continue;
    const competition=findCompetitionByName(match.competition),competitionId=competition?.id||sidebarCompetitionId(match.competition),coverage=matchState(match),home=club(match.homeClubId,'Mandante'),away=club(match.awayClubId,'Visitante'),latest=(coverage.events||[])[0],presentation=buildMatchPresentationPayload(match, coverage);
    if(!groups.has(competitionId))groups.set(competitionId,{name:competition?.name||match.competition||'Competição',items:[]});
    const beforeKickoff=presentation.beforeKickoff;
    groups.get(competitionId).items.push({title:beforeKickoff?`${home.shortName||home.name} x ${away.shortName||away.name}`:`${home.shortName||home.name} ${Number(coverage.homeScore)||0} x ${Number(coverage.awayScore)||0} ${away.shortName||away.name}`,status:presentation.status,clock:beforeKickoff?'':presentation.clock,finalClock:'',clockVisible:presentation.clockVisible,period:presentation.period,date:match.date||'',time:match.time||'',startTime:match.time||'',beforeKickoff,roundId:match.roundId||'',round:match.round||'',matchId:match.id,phase:presentation.phase,elapsedSeconds:presentation.elapsedSeconds,clockRunning:presentation.clockRunning,clockStartedAt:presentation.clockStartedAt,latestAction:beforeKickoff?'':latest?`${latest.icon||''} ${latest.label||latest.type||'INFORMAÇÃO'}${latest.player?` · ${latest.player}`:''}`.trim():''});
  }
  const matchPanels=[...groups.entries()].map(([competitionId,group])=>({key:`matches:${competitionId}:`,competitionId,phaseId:'',title:group.name,type:'grouped-matches',groups:[group]}));
  const standingPanels=(standing.publishedTableIds||standing.publishedCompetitionIds||[]).map(tableId=>standingPanel(tableId)).filter(panel=>panel.items.length);
  const knockoutPanels=[];
  for(const [competitionId,model] of Object.entries(knockout.competitions||{})){
    const competition=competitions.find(c=>c.id===competitionId)||{id:competitionId,name:competitionId};
    for(const phase of model.phases||[])if((phase.ties||[]).length)knockoutPanels.push(knockoutPanel(competition,model,phase,clubs));
  }
  const available=new Map([...matchPanels,...standingPanels,...knockoutPanels].map(panel=>[panel.key,panel]));
  for(const panel of standingPanels){if(panel.competitionId&&!available.has(`standings:${panel.competitionId}:`))available.set(`standings:${panel.competitionId}:`,panel)}
  const sequence=getSidebarSequenceState();
  const panels=sequence.items.filter(item=>item.active!==false).map(item=>{const panel=available.get(sidebarItemKey(item));if(!panel)return null;if(item.type==='matches'&&item.roundId){return {...panel,subtitle:item.roundId,groups:(panel.groups||[]).map(group=>({...group,items:(group.items||[]).filter(match=>match.roundId===item.roundId)})).filter(group=>group.items.length)};}return panel;}).filter(panel=>panel&&(!panel.groups||panel.groups.some(group=>group.items.length)));
  return {intervalSeconds:sequence.intervalSeconds||12,panels,lower:sidebarLowerPayload()};
}

function sidebarLowerTodayKey(){const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
function sidebarLowerEligibleMatches(matches=getMatches()){
  const today=sidebarLowerTodayKey();
  return (Array.isArray(matches)?matches:[]).filter(match=>String(match.date||'')>=today).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||'')));
}
function sidebarLowerGoals(coverage={}){
  const goals=(coverage.events||[]).filter(event=>String(event.type||'').toUpperCase()==='GOAL').map(event=>({team:event.team==='AWAY'?'AWAY':'HOME',minute:Number.isFinite(Number(event.minute))?`${Number(event.minute)}'`:'',player:event.player||event.title||'Gol'}));
  return {homeGoals:goals.filter(goal=>goal.team==='HOME'),awayGoals:goals.filter(goal=>goal.team==='AWAY')};
}
function sidebarLowerCard(match,type='match',side='home') {
  const coverage=matchState(match),home=club(match.homeClubId,'Mandante'),away=club(match.awayClubId,'Visitante'),presentation=buildMatchPresentationPayload(match,coverage);
  if(type==='lineup'){
    const team=side==='away'?away:home, lineup=(coverage.lineups?.[side]||{});
    return {type:'lineup',matchId:match.id,side,teamName:team.shortName||team.name||'Equipe',teamShort:team.abbreviation||'',crest:crestPayload(team),starters:Array.isArray(lineup.starters)?lineup.starters.slice(0,11):[],coach:lineup.coach||''};
  }
  return {type:'match',matchId:match.id,competition:match.competition||'Competição',homeName:home.shortName||home.name,awayName:away.shortName||away.name,homeCrest:crestPayload(home),awayCrest:crestPayload(away),homeScore:Number(coverage.homeScore)||0,awayScore:Number(coverage.awayScore)||0,...sidebarLowerGoals(coverage),...presentation};
}
function sidebarLowerPayload(){
  const eligible=sidebarLowerEligibleMatches(),byId=new Map(eligible.map(match=>[match.id,match])),state=getSidebarLowerState();
  return {intervalSeconds:state.intervalSeconds||10,cards:(state.items||[]).filter(item=>item.active!==false).map(item=>{const match=byId.get(item.matchId);return match?sidebarLowerCard(match,item.type,item.side):null;}).filter(Boolean)};
}
function renderSidebarLowerQueue(){
  const box=$('sidebarLowerQueue'),available=$('sidebarLowerAvailable');if(!box||!available)return;
  let state=getSidebarLowerState();const matches=sidebarLowerEligibleMatches(),byId=new Map(matches.map(m=>[m.id,m])),eligibleIds=new Set(matches.map(m=>m.id));
  const cleanedItems=(state.items||[]).filter(item=>eligibleIds.has(item.matchId));
  if(cleanedItems.length!==(state.items||[]).length){state=saveSidebarLowerState({...state,items:cleanedItems});}
  const label=item=>{const m=byId.get(item.matchId);if(!m)return 'Partida indisponível';const h=club(m.homeClubId,'Mandante'),a=club(m.awayClubId,'Visitante');return item.type==='lineup'?`Escalação · ${item.side==='away'?a.shortName:h.shortName}`:`Jogo · ${h.shortName} x ${a.shortName}`};
  box.innerHTML=(state.items||[]).map((item,index)=>`<article class="sidebar-queue-row lower-row"><input type="checkbox" data-lower-active="${esc(item.id)}" ${item.active===false?'':'checked'}><b>${esc(label(item))}</b><button data-lower-up="${esc(item.id)}" ${index===0?'disabled':''}>▲</button><button data-lower-down="${esc(item.id)}" ${index===(state.items||[]).length-1?'disabled':''}>▼</button><button class="sidebar-remove" data-lower-remove="${esc(item.id)}">×</button></article>`).join('')||'<div class="sidebar-empty">Nenhum card escolhido para o carrossel inferior.</div>';
  available.innerHTML=matches.map(m=>{const h=club(m.homeClubId,'Mandante'),a=club(m.awayClubId,'Visitante');return `<article class="sidebar-available-row lower-available"><div><b>${esc(h.shortName)} x ${esc(a.shortName)}</b><small>${esc(m.competition||'Competição')}</small></div><div class="lower-add-actions"><button data-lower-add="match|${esc(m.id)}|home">＋ Jogo</button><button data-lower-add="lineup|${esc(m.id)}|home">＋ ${esc(h.shortName)}</button><button data-lower-add="lineup|${esc(m.id)}|away">＋ ${esc(a.shortName)}</button></div></article>`}).join('')||'<div class="sidebar-empty compact">Nenhuma partida cadastrada.</div>';
  $('sidebarLowerInterval').value=String(state.intervalSeconds||10);
  const saveItems=items=>saveSidebarLowerState({items,intervalSeconds:Number($('sidebarLowerInterval').value)||10});
  box.querySelectorAll('[data-lower-active]').forEach(el=>el.onchange=()=>{const items=getSidebarLowerState().items.map(i=>i.id===el.dataset.lowerActive?{...i,active:el.checked}:i);saveItems(items)});
  const move=(id,delta)=>{const items=[...getSidebarLowerState().items],i=items.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];saveItems(items);renderSidebarLowerQueue();};
  box.querySelectorAll('[data-lower-up]').forEach(b=>b.onclick=()=>move(b.dataset.lowerUp,-1));box.querySelectorAll('[data-lower-down]').forEach(b=>b.onclick=()=>move(b.dataset.lowerDown,1));
  box.querySelectorAll('[data-lower-remove]').forEach(b=>b.onclick=()=>{saveItems(getSidebarLowerState().items.filter(i=>i.id!==b.dataset.lowerRemove));renderSidebarLowerQueue();});
  available.querySelectorAll('[data-lower-add]').forEach(b=>b.onclick=()=>{const [type,matchId,side]=b.dataset.lowerAdd.split('|');const items=[...getSidebarLowerState().items,{id:uid('side-lower'),type,matchId,side,active:true}];saveItems(items);renderSidebarLowerQueue();});
}

function migrateSidebarQueueBeta152(){
  const migrationKey='rodrigol-sidebar-knockout-explicit-v152';
  if(localStorage.getItem(migrationKey))return;
  const current=getSidebarSequenceState();
  saveSidebarSequenceState({
    ...current,
    items:(current.items||[]).filter(item=>item.type!=='knockout')
  });
  localStorage.setItem(migrationKey,'1');
}
function renderSidebarQueue(){
  const box=$('sidebarQueue'),availableBox=$('sidebarAvailable');if(!box||!availableBox)return;
  const queueState=getSidebarSequenceState(),available=sidebarCandidates(),availableMap=new Map(available.map(item=>[sidebarItemKey(item),item]));
  const queued=queueState.items.map(item=>availableMap.get(sidebarItemKey(item))).filter(Boolean);
  const queuedKeys=new Set(queued.map(sidebarItemKey));
  const remaining=available.filter(item=>!queuedKeys.has(sidebarItemKey(item)));
  const configured=new Map(queueState.items.map(item=>[sidebarItemKey(item),item]));
  box.innerHTML=queued.map((item,index)=>{const cfg=configured.get(sidebarItemKey(item))||{},roundOptions=item.type==='matches'?['<option value="">Todos os jogos</option>',...getRounds({competitionId:item.competitionId}).map(r=>`<option value="${esc(r.id)}" ${cfg.roundId===r.id?'selected':''}>${esc(r.name)}</option>`)].join(''):'';return `<article class="sidebar-queue-row"><input type="checkbox" data-side-active="${esc(sidebarItemKey(item))}" ${cfg.active===false?'':'checked'} title="Ativar ou desativar este painel"><b>${esc(item.label)}</b>${item.type==='matches'?`<select data-side-round="${esc(sidebarItemKey(item))}">${roundOptions}</select>`:''}<button data-side-up="${esc(sidebarItemKey(item))}" ${index===0?'disabled':''}>▲</button><button data-side-down="${esc(sidebarItemKey(item))}" ${index===queued.length-1?'disabled':''}>▼</button><button class="sidebar-remove" data-side-remove="${esc(sidebarItemKey(item))}" title="Remover da sequência">×</button></article>`}).join('')||'<div class="sidebar-empty">Nenhum painel adicionado à sequência.</div>';
  availableBox.innerHTML=remaining.map(item=>`<article class="sidebar-available-row"><div><b>${esc(item.label)}</b><small>${item.type==='knockout'?'Mata-mata disponível para publicação':item.type==='standings'?'Classificação disponível':'Jogos disponíveis'}</small></div><button class="btn" data-side-add="${esc(sidebarItemKey(item))}">＋ Adicionar</button></article>`).join('')||'<div class="sidebar-empty compact">Todos os painéis disponíveis já estão na sequência.</div>';
  $('sidebarInterval').value=String(queueState.intervalSeconds||12);
  const readRows=()=>[...box.querySelectorAll('.sidebar-queue-row')].map(row=>{const input=row.querySelector('[data-side-active]'),[type,competitionId,phaseId='']=input.dataset.sideActive.split(':');return {id:configured.get(input.dataset.sideActive)?.id||uid('side'),type,competitionId,phaseId,roundId:row.querySelector('[data-side-round]')?.value||'',active:input.checked};});
  const save=()=>saveSidebarSequenceState({items:readRows(),intervalSeconds:Number($('sidebarInterval').value)||12});
  box.querySelectorAll('[data-side-active],[data-side-round]').forEach(el=>el.onchange=save);
  function move(k,delta){const rows=[...box.querySelectorAll('.sidebar-queue-row')],i=rows.findIndex(r=>r.querySelector('[data-side-active]').dataset.sideActive===k),j=i+delta;if(i<0||j<0||j>=rows.length)return;rows[i].parentNode.insertBefore(rows[i],delta<0?rows[j]:rows[j].nextSibling);save();renderSidebarQueue();}
  box.querySelectorAll('[data-side-up]').forEach(b=>b.onclick=()=>move(b.dataset.sideUp,-1));
  box.querySelectorAll('[data-side-down]').forEach(b=>b.onclick=()=>move(b.dataset.sideDown,1));
  box.querySelectorAll('[data-side-remove]').forEach(b=>b.onclick=()=>{const key=b.dataset.sideRemove;saveSidebarSequenceState({items:readRows().filter(item=>sidebarItemKey(item)!==key),intervalSeconds:Number($('sidebarInterval').value)||12});renderSidebarQueue();});
  availableBox.querySelectorAll('[data-side-add]').forEach(b=>b.onclick=()=>{const key=b.dataset.sideAdd,[type,competitionId,phaseId='']=key.split(':');const items=readRows();items.push({id:uid('side'),type,competitionId,phaseId,active:true});saveSidebarSequenceState({items,intervalSeconds:Number($('sidebarInterval').value)||12});renderSidebarQueue();});
}
async function publishSidebarOrder(){
  saveSidebarSequenceState({...getSidebarSequenceState(),intervalSeconds:Number($('sidebarInterval').value)||12});
  const payload=sidebarPayload();if(!payload.panels.length){showFailure('Selecione ao menos um painel válido para publicar.');return;}
  try{await command({type:'show',region:'studio-sidebar',payload});showSuccess(`${payload.panels.length} PAINEL(IS) NA LATERAL`);}catch(error){showFailure(error.message||'Falha ao publicar a lateral.');}
}

function render(){renderCollections();renderEditor();renderPreview();renderSummary();renderMainHighlightEditor();renderSidebarQueue();renderSidebarLowerQueue();}
function createCollection(){const name=`Scoreboard ${state.collections.length+1}`;const item={id:uid('scoreboard'),name,sport:'Futebol',matchIds:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.collections.push(item);selectedCollectionId=item.id;persist();$('collectionName').focus();$('collectionName').select();}
function saveCurrent(){const current=collection();if(!current)return;current.name=$('collectionName').value.trim()||current.name;current.sport=$('collectionSport').value.trim()||'Futebol';current.updatedAt=new Date().toISOString();persist();}
function duplicateCurrent(){const current=collection();if(!current)return;const copy={...current,id:uid('scoreboard'),name:`${current.name} — cópia`,matchIds:[...current.matchIds],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.collections.push(copy);selectedCollectionId=copy.id;persist();}
function deleteCurrent(){const current=collection();if(!current||!confirm(`Excluir o scoreboard “${current.name}”?`))return;state.collections=state.collections.filter(item=>item.id!==current.id);if(!state.collections.length)state.collections.push({id:uid('scoreboard'),name:'Scoreboard principal',sport:'Futebol',matchIds:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});if(state.activeCollectionId===current.id)state.activeCollectionId=state.collections[0].id;selectedCollectionId=state.collections[0].id;persist();publishScoreboard(false);publishSummary(false);}
function setActive(){const current=collection();if(!current)return;state.activeCollectionId=current.id;if(!current.matchIds.includes(state.activeMainMatchId)&&current.matchIds[0])state.activeMainMatchId=current.matchIds[0];if(state.activeMainMatchId){setActiveMatchId(state.activeMainMatchId);setOnAirMatchId(state.activeMainMatchId);}persist();publishAll();}
async function health(){try{const response=await fetch(bridgeApiUrl('/health'),{cache:'no-store'});if(!response.ok)throw new Error();const data=await response.json();$('bridgeBadge').textContent='BRIDGE ONLINE';$('bridgeBadge').classList.add('ok');$('bridgeStatus').textContent=`Online · ${data.connections??0} overlay(s)`;$('bridgeDot').classList.add('ok');}catch{$('bridgeBadge').textContent='BRIDGE OFFLINE';$('bridgeBadge').classList.remove('ok');$('bridgeStatus').textContent='Sem conexão';$('bridgeDot').classList.remove('ok');}}
function updateClock(){const now=new Date();$('now').textContent=now.toLocaleTimeString('pt-BR');$('today').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});}

if($('matchListFilter'))$('matchListFilter').onchange=e=>{matchListFilter=e.target.value||'ALL';renderEditor();};if($('tickerScope'))$('tickerScope').onchange=e=>{state.yellowTickerScope=e.target.value;persist();renderTickerControls();};if($('tickerCompetition'))$('tickerCompetition').onchange=e=>{state.yellowTickerCompetitionId=e.target.value;state.yellowTickerRoundId='';persist();renderTickerControls();};if($('tickerRound'))$('tickerRound').onchange=e=>{state.yellowTickerRoundId=e.target.value;persist();renderTickerControls();};if($('publishSummaryConfig'))$('publishSummaryConfig').onclick=()=>{state.yellowTickerScope=$('tickerScope').value;state.yellowTickerCompetitionId=$('tickerCompetition').value;state.yellowTickerRoundId=$('tickerRound').value;state.yellowTickerIncludeScheduled=$('tickerScheduled').checked;state.yellowTickerIncludeLive=$('tickerLive').checked;state.yellowTickerIncludeFinal=$('tickerFinal').checked;persist();renderTickerControls();publishSummary();};$('newCollection').onclick=createCollection;$('saveCollection').onclick=saveCurrent;$('duplicateCollection').onclick=duplicateCurrent;$('deleteCollection').onclick=deleteCurrent;$('setActive').onclick=setActive;$('publishActive').onclick=()=>publishScoreboard();$('publishMain').onclick=()=>publishMain();$('publishSummary').onclick=()=>publishSummary();$('publishAll').onclick=publishAll;$('tickerMode').onchange=e=>{state.yellowTickerMode=e.target.value==='POP'?'POP':'MARQUEE';persist();renderTickerControls();publishSummary(false);};$('tickerSpeed').onchange=e=>{state.yellowTickerSpeed=Math.min(120,Math.max(15,Number(e.target.value)||60));persist();renderTickerControls();publishSummary(false);};$('refreshPreview').onclick=()=>{state=getOverlayControlState();render();};$('sidebarInterval').onchange=()=>saveSidebarSequenceState({...getSidebarSequenceState(),intervalSeconds:Number($('sidebarInterval').value)||12});$('publishSidebarOrder').onclick=publishSidebarOrder;if($('sidebarLowerInterval'))$('sidebarLowerInterval').onchange=()=>saveSidebarLowerState({...getSidebarLowerState(),intervalSeconds:Number($('sidebarLowerInterval').value)||10});if($('publishSidebarLower'))$('publishSidebarLower').onclick=publishSidebarOrder;window.addEventListener('storage',()=>{state=getOverlayControlState();render();});window.addEventListener('rodrigol:data-changed',()=>{state=getOverlayControlState();render();});
if($('mainHighlightMode'))$('mainHighlightMode').onchange=e=>{state.mainHighlightMode=e.target.value==='MANUAL'?'MANUAL':'AUTO';persist();};if($('mainHighlightInterval'))$('mainHighlightInterval').onchange=e=>{state.mainHighlightInterval=Math.min(30,Math.max(4,Number(e.target.value)||8));persist();};if($('mainHighlightAdd'))$('mainHighlightAdd').onclick=()=>{const text=$('mainHighlightText').value.trim(),title=$('mainHighlightTitle').value.trim();if(!text&&!title)return alert('Digite uma chamada ou texto para o destaque.');const id=$('mainHighlightEditId').value||uid('highlight'),patch={id,side:$('mainHighlightSide').value,title:title||'',text:text||'',active:true};const index=(state.mainHighlightItems||[]).findIndex(item=>item.id===id);if(index>=0)state.mainHighlightItems[index]={...state.mainHighlightItems[index],...patch};else state.mainHighlightItems=[...(state.mainHighlightItems||[]),patch];resetMainHighlightForm();persist();};if($('mainHighlightCancel'))$('mainHighlightCancel').onclick=resetMainHighlightForm;if($('saveMainHighlights'))$('saveMainHighlights').onclick=()=>{state.mainHighlightMode=$('mainHighlightMode').value==='MANUAL'?'MANUAL':'AUTO';state.mainHighlightInterval=Number($('mainHighlightInterval').value)||8;persist();publishMain();};
updateClock();setInterval(updateClock,1000);setInterval(()=>{renderPreview();renderSummary();},1000);setInterval(health,5000);health();migrateSidebarQueueBeta152();render();
