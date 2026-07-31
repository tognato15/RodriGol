import { getMatches, getClub, readCoverage, saveCoverage, setActiveMatchId, getOnAirMatchId, setOnAirMatchId, uid } from './data-store.js';

const $ = id => document.getElementById(id);
const PHASES = { PRE_GAME:'PRÉ-JOGO', FIRST_HALF:'1º TEMPO', HALFTIME:'INTERVALO', SECOND_HALF:'2º TEMPO', EXTRA_TIME:'PRORROGAÇÃO', PENALTIES:'PÊNALTIS', FINAL:'FINALIZADA' };
const EVENT_META = {
  GOAL:{label:'GOL',icon:'⚽',color:'#28a64f'}, YELLOW_CARD:{label:'CARTÃO AMARELO',icon:'🟨',color:'#d1ab00'}, RED_CARD:{label:'CARTÃO VERMELHO',icon:'🟥',color:'#d7333b'},
  SUBSTITUTION:{label:'SUBSTITUIÇÃO',icon:'🔁',color:'#2d94d2'}, VAR:{label:'VAR',icon:'VAR',color:'#9650bd'}, INFORMATION:{label:'INFORMAÇÃO',icon:'ⓘ',color:'#2d9bc5'}
};
const fallback = { homeScore:0, awayScore:0, homeScorers:[], awayScorers:[], phase:'PRE_GAME', elapsedSeconds:0, clockRunning:false, clockStartedAt:null, events:[] };
let lastPublishedSignature = '';
let lastStudioSignature = '';
let publishingOnAir = false;
let openEditor = null;

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function elapsed(s){const base=Number(s.elapsedSeconds)||0;return (!s.clockRunning||!s.clockStartedAt)?base:base+Math.max(0,Math.floor((Date.now()-Number(s.clockStartedAt))/1000));}
function fmt(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function stateFor(match){return {...fallback,phase:match.status||'PRE_GAME',...readCoverage(match.id,fallback)};}
function clubFor(id,side){return getClub(id)||{shortName:side,abbreviation:side.slice(0,3).toUpperCase(),primaryColor:'#18394a',secondaryColor:'#fff',crestText:side[0],crestDataUrl:''};}
function crest(club){return club.crestDataUrl?`<span class="crest" style="background:${esc(club.primaryColor)}"><img src="${esc(club.crestDataUrl)}" alt="${esc(club.shortName)}"></span>`:`<span class="crest" style="background:${esc(club.primaryColor)};color:${esc(club.secondaryColor)}">${esc(club.crestText||club.abbreviation||'?')}</span>`;}
function phaseMeta(value){const live=['FIRST_HALF','SECOND_HALF','EXTRA_TIME'].includes(value);return {status:live?'AO VIVO':PHASES[value]||value,period:PHASES[value]||value};}
function scoreboardPayload(match,state){const home=clubFor(match.homeClubId,'Mandante'),away=clubFor(match.awayClubId,'Visitante'),meta=phaseMeta(state.phase);return {matchId:match.id,competition:[match.competition,match.round].filter(Boolean).join(' · ').toUpperCase(),homeName:home.shortName.toUpperCase(),awayName:away.shortName.toUpperCase(),homeShort:home.abbreviation,awayShort:away.abbreviation,homeCrest:{text:home.crestText||home.abbreviation,image:home.crestDataUrl||'',background:home.primaryColor,color:home.secondaryColor},awayCrest:{text:away.crestText||away.abbreviation,image:away.crestDataUrl||'',background:away.primaryColor,color:away.secondaryColor},homeScore:Number(state.homeScore)||0,awayScore:Number(state.awayScore)||0,homeScorers:state.homeScorers?.join(' · ')||'—',awayScorers:state.awayScorers?.join(' · ')||'—',clock:fmt(elapsed(state)),period:meta.period,status:meta.status,chronology:Array.isArray(state.events)?state.events.slice(0,6):[]};}

function crestPayload(club){return {text:club.crestText||club.abbreviation,image:club.crestDataUrl||'',background:club.primaryColor,color:club.secondaryColor};}
function competitionShort(name=''){const value=String(name).toUpperCase();if(value.includes('SÉRIE A')||value.includes('SERIE A'))return 'BR1';if(value.includes('SÉRIE B')||value.includes('SERIE B'))return 'BR2';if(value.includes('LIBERTADORES'))return 'LIB';if(value.includes('PREMIER'))return 'ING';if(value.includes('LA LIGA'))return 'ESP';if(value.includes('BUNDESLIGA'))return 'ALE';return value.replace(/[^A-Z0-9]/g,'').slice(0,4)||'FUT';}
function studioMatchPayload(match){const state=stateFor(match),home=clubFor(match.homeClubId,'Mandante'),away=clubFor(match.awayClubId,'Visitante'),meta=phaseMeta(state.phase);return {matchId:match.id,competition:match.competition||'Competição',competitionShort:competitionShort(match.competition),status:meta.status,period:meta.period,clock:fmt(elapsed(state)),time:match.time||'',homeName:home.shortName,awayName:away.shortName,homeShort:home.abbreviation,awayShort:away.abbreviation,homeCrest:crestPayload(home),awayCrest:crestPayload(away),homeScore:Number(state.homeScore)||0,awayScore:Number(state.awayScore)||0,scorers:[...(state.homeScorers||[]),...(state.awayScorers||[])].join(' · '),goals:[...(state.homeScorers||[]).map(text=>({minute:String(text).split(' ')[0],player:String(text).split(' ').slice(1).join(' ')})),...(state.awayScorers||[]).map(text=>({minute:String(text).split(' ')[0],player:String(text).split(' ').slice(1).join(' ')}))]};}
function studioEventsPayload(){return getMatches().flatMap(match=>{const state=stateFor(match),home=clubFor(match.homeClubId,'Mandante'),away=clubFor(match.awayClubId,'Visitante');return (state.events||[]).map(event=>({competitionShort:competitionShort(match.competition),action:event.label||event.type||'INFORMAÇÃO',result:`${home.abbreviation} ${state.homeScore} × ${state.awayScore} ${away.abbreviation}`,minute:`${event.minute??0}'`,author:event.player||event.title||'',createdAt:event.createdAt||''}))}).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,8);}
function studioSidebarPayload(matches){const items=matches.slice(0,6).map(m=>({title:`${m.homeName} ${m.homeScore} x ${m.awayScore} ${m.awayName}`,meta:`${m.status} · ${m.period||m.clock}`}));return {intervalSeconds:10,panels:[{title:'JOGOS DA RODADA',type:'matches',items},{title:'CLASSIFICAÇÃO',type:'standings',items:[{position:1,name:'Palmeiras',points:39},{position:2,name:'Flamengo',points:37},{position:3,name:'Cruzeiro',points:35},{position:4,name:'Bahia',points:31},{position:5,name:'Botafogo',points:30}]},{title:'ÚLTIMAS NOTÍCIAS',type:'news',items:[{title:'Central editorial pronta para publicar destaques',meta:'RodriGol Studio'},{title:'Acompanhe os jogos selecionados para o scoreboard',meta:'Atualização ao vivo'},{title:'Mais informações serão conectadas no Alpha 0.5',meta:'Próxima etapa'}]}]};}
async function publishStudioRegions(force=false){const matches=getMatches().map(studioMatchPayload);const payload={round:matches.slice(0,6),events:studioEventsPayload(),summary:matches,sidebar:studioSidebarPayload(matches)};const signature=JSON.stringify(payload);if(!force&&signature===lastStudioSignature)return;await Promise.all([command({type:'update',region:'round-scoreboard',payload:payload.round}),command({type:'update',region:'live-events',payload:payload.events}),command({type:'update',region:'round-summary',payload:payload.summary}),command({type:'update',region:'studio-sidebar',payload:payload.sidebar})]);lastStudioSignature=signature;}
async function command(body){const r=await fetch('/api/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Falha ao atualizar o overlay.');return r.json();}
async function publishOnAir(force=false){if(publishingOnAir)return;const id=getOnAirMatchId(),match=getMatches().find(m=>m.id===id);if(!match)return;const payload=scoreboardPayload(match,stateFor(match)),signature=JSON.stringify(payload);if(!force&&signature === lastPublishedSignature)return;publishingOnAir=true;try{await command({type:'show',region: 'scoreboard',payload});await publishStudioRegions(force);lastPublishedSignature=signature;}catch(e){console.error(e);}finally{publishingOnAir=false;}}
function persist(match,state){saveCoverage(match.id,state);if(!openEditor) render();publishStudioRegions(true).catch(console.error);if(match.id===getOnAirMatchId())publishOnAir(true);}
function teamName(eventTeam,home,away){return eventTeam==='HOME'?home.shortName:eventTeam==='AWAY'?away.shortName:'Informação geral';}

async function registerEvent(match,type){const state=stateFor(match),meta=EVENT_META[type];if(!meta)return;const form=document.querySelector(`.quick-form[data-form="${CSS.escape(match.id)}"]`);if(!form)return;const team=form.querySelector('[name="team"]').value,player=form.querySelector('[name="player"]').value.trim(),details=form.querySelector('[name="details"]').value.trim(),minute=Math.max(0,Number(form.querySelector('[name="minute"]').value)||Math.floor(elapsed(state)/60));const home=clubFor(match.homeClubId,'Mandante'),away=clubFor(match.awayClubId,'Visitante');
  if(['GOAL','YELLOW_CARD','RED_CARD','SUBSTITUTION'].includes(type)&&!player){form.querySelector('[name="player"]').focus();return;}
  if(type==='GOAL'){if(team==='HOME'){state.homeScore+=1;if(player)state.homeScorers.push(`${minute}' ${player}`);}else if(team==='AWAY'){state.awayScore+=1;if(player)state.awayScorers.push(`${minute}' ${player}`);}}
  const event={id:uid('event'),type,label:meta.label,icon:meta.icon,color:meta.color,minute,team,player,title:player||meta.label,details,score:`${state.homeScore} × ${state.awayScore}`,createdAt:new Date().toISOString(),tickerItem:{competition:match.competition||'Competição',match:`${home.shortName} ${state.homeScore} × ${state.awayScore} ${away.shortName}`,kind:meta.label,responsible:player||details||teamName(team,home,away)}};
  state.events=[event,...(state.events||[])];persist(match,state);openEditor=null;render();
  if(match.id===getOnAirMatchId()){
    const title=type==='GOAL'?`GOL DO ${teamName(team,home,away).toUpperCase()}!`:meta.label;const text=[title,player,details].filter(Boolean).join(' — ');
    await command({type:'show',region:'ticker',payload:{matchId:match.id,label:`${minute}'`,text,queueItem:event.tickerItem}}).catch(console.error);
    await command({type:'show',region:'side-alert',payload:{matchId:match.id,label:meta.label,headline:title,summary:[player,details].filter(Boolean).join(' · ')},durationMs:6500}).catch(console.error);
  }
}

function action(id,type){const match=getMatches().find(m=>m.id===id);if(!match)return;const state=stateFor(match);
  if(type==='open'){setActiveMatchId(id);location.href=`/control/?matchId=${encodeURIComponent(id)}`;return;}
  if(type==='on-air'){setOnAirMatchId(id);lastPublishedSignature='';render();publishOnAir(true);return;}
  if(type.startsWith('event:')){openEditor={id,type:type.split(':')[1]};render();return;}
  if(type==='close-editor'){openEditor=null;render();return;}
  if(type==='start'){if(state.phase==='FINAL'||state.clockRunning)return;if(state.phase==='PRE_GAME')state.phase='FIRST_HALF';else if(state.phase==='HALFTIME')state.phase='SECOND_HALF';state.clockRunning=true;state.clockStartedAt=Date.now();}
  if(type==='pause'){state.elapsedSeconds=elapsed(state);state.clockRunning=false;state.clockStartedAt=null;}
  if(type==='reset'){state.elapsedSeconds=0;state.clockRunning=false;state.clockStartedAt=null;}
  if(type==='home-plus')state.homeScore+=1;if(type==='away-plus')state.awayScore+=1;if(type==='home-minus')state.homeScore=Math.max(0,state.homeScore-1);if(type==='away-minus')state.awayScore=Math.max(0,state.awayScore-1);
  persist(match,state);
}

function render(){const matches=getMatches(),onAirId=getOnAirMatchId();if(!matches.length){$('matchList').innerHTML='<div class="empty">Nenhuma partida cadastrada.</div>';return;}
 $('matchList').innerHTML=matches.map(match=>{const state=stateFor(match),home=clubFor(match.homeClubId,'Mandante'),away=clubFor(match.awayClubId,'Visitante'),onAir=match.id===onAirId,editor=openEditor?.id===match.id?openEditor.type:null;return `<article class="match-row ${onAir?'on-air':''}">
 <div class="summary"><div class="competition"><small>${esc(match.round||'RODADA NÃO INFORMADA')}</small><b>${esc(match.competition||'PARTIDA')}</b><small>${esc(PHASES[state.phase]||state.phase)}</small></div>
 <div class="teams"><div class="team">${crest(home)}<strong>${esc(home.shortName)}</strong></div><button data-id="${esc(match.id)}" data-action="home-minus">−</button><div class="score">${state.homeScore} × ${state.awayScore}</div><button data-id="${esc(match.id)}" data-action="away-plus">＋</button><div class="team away"><strong>${esc(away.shortName)}</strong>${crest(away)}</div></div>
 <div class="clock-box"><b>${fmt(elapsed(state))}</b><small>${state.clockRunning?'RELÓGIO EM ANDAMENTO':'RELÓGIO PAUSADO'}</small></div>
 <div class="air-box"><div class="air-label">${onAir?'● SAÍDA PRINCIPAL DO OBS':'○ FORA DO AR'}</div><button data-id="${esc(match.id)}" data-action="on-air">${onAir?'NO AR':'COLOCAR NO AR'}</button></div></div>
 <div class="row-actions"><button data-id="${esc(match.id)}" data-action="start">▶ Iniciar</button><button data-id="${esc(match.id)}" data-action="pause">Ⅱ Pausar</button><button data-id="${esc(match.id)}" data-action="reset">↺ Zerar</button><button class="event goal" data-id="${esc(match.id)}" data-action="event:GOAL">⚽ Gol</button><button class="event yellow" data-id="${esc(match.id)}" data-action="event:YELLOW_CARD">🟨 Amarelo</button><button class="event red" data-id="${esc(match.id)}" data-action="event:RED_CARD">🟥 Vermelho</button><button class="event" data-id="${esc(match.id)}" data-action="event:SUBSTITUTION">🔁 Substituição</button><button class="event purple" data-id="${esc(match.id)}" data-action="event:VAR">VAR</button><button class="event info" data-id="${esc(match.id)}" data-action="event:INFORMATION">ⓘ Informação</button><button class="primary" data-id="${esc(match.id)}" data-action="open">Abrir cabine</button></div>
 <div class="quick-form ${editor?'open':''}" data-form="${esc(match.id)}"><label>Minuto<input name="minute" type="number" min="0" value="${Math.floor(elapsed(state)/60)}"></label><label>Equipe<select name="team"><option value="HOME">${esc(home.shortName)}</option><option value="AWAY">${esc(away.shortName)}</option><option value="NEUTRAL">Neutro</option></select></label><label>Jogador / título<input name="player" placeholder="Nome do jogador ou título"></label><label>Detalhes<input name="details" placeholder="Descreva o acontecimento"></label><button data-register="${esc(match.id)}" data-type="${esc(editor||'INFORMATION')}">⚡ REGISTRAR ${esc(EVENT_META[editor]?.label||'EVENTO')}</button></div></article>`;}).join('');
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.id,b.dataset.action)));
 document.querySelectorAll('[data-register]').forEach(b=>b.addEventListener('click',()=>registerEvent(getMatches().find(m=>m.id===b.dataset.register),b.dataset.type)));
}
async function health(){try{const r=await fetch('/health',{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();$('bridgeStatus').textContent=`Bridge online · ${Number(d.connections)||0} overlay(s)`;$('bridgeStatus').style.color='#3dde78';}catch{$('bridgeStatus').textContent='Bridge indisponível';$('bridgeStatus').style.color='#ff5d5d';}}
$('refresh').addEventListener('click',()=>{render();publishOnAir(true);});window.addEventListener('storage',()=>{render();publishOnAir(true);});window.addEventListener('rodrigol:data-changed',()=>{render();publishOnAir(true);});setInterval(() => { $('now').textContent = new Date().toLocaleTimeString('pt-BR'); }, 1000);
// Compatibilidade de teste anterior: setInterval(() => { render(); publishOnAir(); }, 1000)
setInterval(() => {
  if (!openEditor && !document.querySelector('.quick-form input:focus, .quick-form select:focus')) render();
  else document.querySelectorAll('.match-row').forEach(row => {
    const id = row.querySelector('[data-id]')?.dataset.id;
    const match = getMatches().find(item => item.id === id);
    const clock = row.querySelector('.clock-box b');
    if (match && clock) clock.textContent = fmt(elapsed(stateFor(match)));
  });
  publishOnAir();
}, 1000);
setInterval(health, 2500);
render();
health();
publishStudioRegions(true).catch(console.error);
publishOnAir(true);
