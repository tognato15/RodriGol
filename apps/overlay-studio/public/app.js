import { buildClockTickPatch, canonicalMatchPhase, deriveVisualState, formatClockSeconds, getEffectiveElapsedSeconds, mergePresentationState, normalizeCoverage, parseClockSeconds, presentationFromPayload, scheduledDisplay, shouldShowClock } from './match-presentation.js';
const $ = id => document.getElementById(id);
const weekdays=["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];
const months=["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
function updateClock(){const now=new Date();$("currentTime").textContent=now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});$("currentWeekday").textContent=weekdays[now.getDay()];$("currentDate").textContent=`${String(now.getDate()).padStart(2,"0")} DE ${months[now.getMonth()]} DE ${now.getFullYear()}`}
function applyTopbar(p={}){
  if(p.coverageTitle||p.label)$("coverageTitle").textContent=p.coverageTitle||p.label;
  if(p.coverageMessage||p.message||p.text)$("coverageMessage").textContent=p.coverageMessage||p.message||p.text;
  const presenterName=String(p.presenterName||p.hostName||"").trim();
  const presenterHandle=String(p.presenterHandle||p.hostHandle||"").trim();
  const presenterPhoto=String(p.presenterPhoto||p.hostPhoto||"").trim();
  const block=$("presenterBlock");
  if(block){
    block.hidden=!presenterName&&!presenterHandle&&!presenterPhoto;
    $("presenterName").textContent=presenterName;
    $("presenterHandle").textContent=presenterHandle;
    const avatar=$("presenterAvatar");
    if(presenterPhoto){avatar.style.backgroundImage=`url(${JSON.stringify(presenterPhoto)})`;avatar.textContent="";}
    else{avatar.style.backgroundImage="";avatar.textContent=(presenterName||"RT").split(/\s+/).slice(0,2).map(part=>part[0]||"").join("").toUpperCase()||"RT";}
  }
}
function crestData(crest={},fallback="—"){return {image:crest.image||crest.crestDataUrl||"",background:crest.background||crest.primaryColor||"#173344",color:crest.color||crest.secondaryColor||"#fff",text:crest.text||crest.crestText||fallback}}
function renderCrest(el,crest={},fallback="—"){const data=crestData(crest,fallback);el.style.background=data.background;el.style.color=data.color;el.innerHTML=data.image?`<img src="${escapeHtml(data.image)}" alt="">`:`<span>${escapeHtml(data.text)}</span>`}
function crestMarkup(crest={},fallback="—",extra=""){const data=crestData(crest,fallback);return `<span class="tile-crest ${extra}" style="background:${escapeHtml(data.background)};color:${escapeHtml(data.color)}">${data.image?`<img src="${escapeHtml(data.image)}" alt="">`:escapeHtml(data.text)}</span>`}
function normalizeScorers(value){if(Array.isArray(value))return value.map(item=>`⚽ ${escapeHtml(item.minute||"")} ${escapeHtml(item.player||item.name||"")}`.trim()).join(" · ");const text=String(value||"—");return text==="—"?text:text.split(/\s*·\s*/).map(item=>item.trim().startsWith("⚽")?item:`⚽ ${item}`).join(" · ")}
function eventMinute(event={}){const value=String(event.minute??event.time??"").trim();return value&&!value.endsWith("'")&&/^\d/.test(value)?`${value}'`:value}
function eventLabel(event={}){return String(event.label||event.action||event.type||"INFORMAÇÃO").trim().toUpperCase()}
function eventIconCompact(event={}){const label=eventLabel(event);if(label.includes("GOL"))return"⚽";if(label.includes("VERMELHO"))return"🟥";if(label.includes("AMARELO"))return"🟨";if(label.includes("SUBSTIT"))return"↔";if(label.includes("VAR"))return"VAR";if(label.includes("INTERVALO"))return"Ⅱ";if(label.includes("FINAL"))return"⚑";if(label.includes("INÍCIO")||label.includes("COMEÇ"))return"▶";return"•"}
function renderMainSummary(state={}){const list=$("mainSummaryList");if(!list)return;const events=Array.isArray(state.chronology)?state.chronology:[];if(!events.length){list.innerHTML='<p>Nenhum evento registrado.</p>';return}list.innerHTML=events.slice(0,8).map(event=>{const label=eventLabel(event),substitution=label.includes("SUBSTIT"),lifecycle=["EM ANDAMENTO","INÍCIO DE JOGO","INÍCIO DO 2º TEMPO","INTERVALO","FIM DE JOGO"].some(value=>label.includes(value)),primary=substitution?(event.substitutionIn?`ENTRA ${event.substitutionIn}`:(event.player||"SUBSTITUIÇÃO")):(event.player||event.author||event.title||label),teamName=String(event.teamName||"").trim(),secondary=substitution?(event.substitutionOut?`SAI ${event.substitutionOut}`:(event.details||"")):(lifecycle?"":(teamName||event.details||""));return `<article><time>${escapeHtml(eventMinute(event))}</time><i>${escapeHtml(eventIconCompact(event))}</i><div><strong>${escapeHtml(primary)}</strong>${secondary?`<small>${escapeHtml(secondary)}</small>`:""}</div></article>`}).join("")}
function scorerItems(value){if(Array.isArray(value))return value.map(item=>({minute:item.minute||"",player:item.player||item.name||""}));return String(value||"").split(/\s*·\s*/).map(item=>item.replace(/^⚽\s*/,"").trim()).filter(Boolean).map(item=>{const m=item.match(/^(\S+)\s+(.*)$/);return{minute:m?.[1]||"",player:m?.[2]||item}})}
let mainHighlightTimer=null,mainHighlightIndex=0,mainHighlightItems=[],mainHighlightFingerprint="";
function paintMainHighlight(){
  const root=$("mainHighlights");
  if(!root)return;
  if(!mainHighlightItems.length){
    root.innerHTML='<article class="bp-highlight-card bp-highlight-card--empty"><strong>EM DESTAQUE</strong><span>Os principais lances aparecerão aqui.</span></article>';
    return;
  }
  const index=((mainHighlightIndex%mainHighlightItems.length)+mainHighlightItems.length)%mainHighlightItems.length;
  const item=mainHighlightItems[index];
  const dots=mainHighlightItems.map((_,dotIndex)=>`<i class="${dotIndex===index?"is-active":""}"></i>`).join("");
  root.innerHTML=`<article class="bp-highlight-card bp-highlight-card--story">
    <div class="bp-highlight-card__progress"><i></i></div>
    <div class="bp-highlight-card__media">${crestMarkup(item.crest,item.team,"bp-highlight-card__crest")}</div>
    <div class="bp-highlight-card__copy">
      <strong>${escapeHtml(item.team)}</strong>
      <span>${escapeHtml(`${item.minute} ${item.player}`.trim())}</span>
    </div>
    <div class="bp-highlight-card__footer"><small>${index+1}/${mainHighlightItems.length}</small><span class="bp-highlight-dots">${dots}</span></div>
  </article>`;
}
function scheduleMainHighlights(){
  if(mainHighlightTimer){clearInterval(mainHighlightTimer);mainHighlightTimer=null}
  if(mainHighlightItems.length>1){
    mainHighlightTimer=setInterval(()=>{
      mainHighlightIndex=(mainHighlightIndex+1)%mainHighlightItems.length;
      paintMainHighlight();
    },8000);
  }
}
function renderMainHighlights(state={}){
  const root=$("mainHighlights");if(!root)return;
  const config=state.highlightConfig||{};
  const manual=config.mode==="MANUAL"&&Array.isArray(config.items);
  const items=manual?config.items.filter(item=>item&&item.active!==false).map(item=>{
    const side=item.side==="HOME"?"HOME":item.side==="AWAY"?"AWAY":"NEUTRAL";
    return {minute:"",player:item.text||"",team:item.title||(side==="HOME"?(state.homeShort||state.homeName||"MANDANTE"):side==="AWAY"?(state.awayShort||state.awayName||"VISITANTE"):"DESTAQUE"),crest:side==="HOME"?state.homeCrest:side==="AWAY"?state.awayCrest:{text:"★",background:"#ff5b00",color:"#071018"}};
  }):[
    ...scorerItems(state.homeScorers).map(x=>({...x,team:state.homeShort||state.homeName||"MANDANTE",crest:state.homeCrest})),
    ...scorerItems(state.awayScorers).map(x=>({...x,team:state.awayShort||state.awayName||"VISITANTE",crest:state.awayCrest}))
  ].reverse();
  const interval=Math.max(4,Number(config.intervalSeconds)||8);
  const fingerprint=JSON.stringify({interval,manual,items:items.map(item=>[item.minute,item.player,item.team,crestData(item.crest,item.team).image,crestData(item.crest,item.team).text])});
  if(fingerprint!==mainHighlightFingerprint){mainHighlightFingerprint=fingerprint;mainHighlightItems=items;mainHighlightIndex=0;if(mainHighlightTimer){clearInterval(mainHighlightTimer);mainHighlightTimer=null}if(mainHighlightItems.length>1)mainHighlightTimer=setInterval(()=>{mainHighlightIndex=(mainHighlightIndex+1)%mainHighlightItems.length;paintMainHighlight()},interval*1000);}
  paintMainHighlight();
}
function renderLineups(state={}){const lineups=state.lineups||{};const home=lineups.home||{},away=lineups.away||{};const clean=arr=>Array.isArray(arr)?arr.filter(Boolean):[];const renderPlayers=(id,arr)=>{const el=$(id);if(!el)return;const players=clean(arr).slice(0,11);el.innerHTML="";if(!players.length){el.textContent="Escalação ainda não informada.";el.classList.add("is-empty");return}el.classList.remove("is-empty");const rows=[players.slice(0,5),players.slice(5,11)];rows.forEach((rowPlayers,rowIndex)=>{if(!rowPlayers.length)return;const row=document.createElement("span");row.className="bp-lineup-row";row.dataset.row=String(rowIndex+1);rowPlayers.forEach((player,index)=>{const item=document.createElement("span");item.className="bp-lineup-player";item.dataset.index=String(rowIndex===0?index+1:index+6);const text=String(player).trim();const match=text.match(/^(\d{1,3})\s+(.+)$/);if(match){const number=document.createElement("b");number.className="bp-lineup-number";number.textContent=match[1];const name=document.createElement("span");name.className="bp-lineup-name";name.textContent=match[2];item.append(number,document.createTextNode(" "),name)}else{const name=document.createElement("span");name.className="bp-lineup-name";name.textContent=text;item.appendChild(name)}row.appendChild(item)});el.appendChild(row)})};$("lineupHomeTitle").textContent=state.homeName||state.homeShort||"MANDANTE";$("lineupAwayTitle").textContent=state.awayName||state.awayShort||"VISITANTE";renderPlayers("lineupHomePlayers",Array.isArray(home.onField)&&home.onField.length?home.onField:home.starters);renderPlayers("lineupAwayPlayers",Array.isArray(away.onField)&&away.onField.length?away.onField:away.starters);renderCrest($("lineupHomeCrest"),state.homeCrest,state.homeShort||"MAN");renderCrest($("lineupAwayCrest"),state.awayCrest,state.awayShort||"VIS");}
function normalizedMatchStatus(value=""){const status=String(value||"").trim().toUpperCase();if(status.includes("PROGRAM")||status.includes("AGEND")||status==="SCHEDULED")return"PROGRAMADO";if(status.includes("PRÉ")||status.includes("PRE_GAME")||status.includes("PRE-GAME"))return"PRÉ-JOGO";if(status.includes("FINAL")||status.includes("ENCERR"))return"FINAL";return status||"COBERTURA"}function visualMatchStatus(p={}){const period=String(p.period||"").trim().toUpperCase(),status=normalizedMatchStatus(p.status);if(period.includes("2º")||period.includes("2°")||period.includes("SEGUNDO"))return"2º TEMPO";if(period.includes("1º")||period.includes("1°")||period.includes("PRIMEIRO"))return"1º TEMPO";if(period.includes("INTERVALO"))return"INTERVALO";if(period.includes("PRORROG"))return"PRORROGAÇÃO";if(period.includes("PÊNALT"))return"PÊNALTIS";if(period.includes("FINAL")||period.includes("ENCERR"))return"FINAL";return normalizedMatchStatus(period||status)}function isScheduledStatus(value){return normalizedMatchStatus(value)==="PROGRAMADO"}function isPreGameStatus(value){return normalizedMatchStatus(value)==="PRÉ-JOGO"}function isFinalStatus(value){return normalizedMatchStatus(value)==="FINAL"}function isClocklessLive(p={}){const period=String(p.period||"").trim().toUpperCase(),clock=String(p.clock||"").trim();return p.clockVisible===false||period.includes("EM ANDAMENTO")||period.includes("SEM RELÓGIO")||clock==="--:--"}function isClockHiddenState(p={},status=""){const visual=deriveVisualState(null,{phase:p.phase});if(visual.beforeKickoff)return false;if(p.clockVisible===false)return true;return !shouldShowClock(visual)}function visibleMatchClock(p={},status=""){if(isClockHiddenState(p,status))return"";return String(p.clock||"").trim()}function clockCanRun(status="",period=""){const visual=deriveVisualState(null,{phase:period||status});return shouldShowClock(visual)}let mainMatchState={},mainClockAnchorSeconds=null,mainClockAnchorAt=0,mainClockRunning=false,mainClockPhase="",mainClockTimer=null,lastMainClockPaint="";
function stopMainClockTimer(){if(mainClockTimer){clearInterval(mainClockTimer);mainClockTimer=null}}
function currentMainClockSeconds(now=Date.now()){
  if(mainClockAnchorSeconds===null)return null;
  return Math.max(0,mainClockAnchorSeconds+(mainClockRunning?Math.max(0,Math.floor((now-mainClockAnchorAt)/1000)):0));
}
function paintMainClock(){
  const el=$("mainClock");if(!el)return;
  const visual=deriveVisualState(null,{phase:mainMatchState.phase}),beforeKickoff=visual.beforeKickoff||mainMatchState.beforeKickoff===true;
  let value="";
  if(beforeKickoff)value=scheduledDisplay(mainMatchState);
  else if(isClockHiddenState(mainMatchState,visual.period))value="";
  else{
    const elapsed=currentMainClockSeconds();
    if(elapsed!==null&&shouldShowClock(visual))value=formatClockSeconds(elapsed);
    else value=visibleMatchClock(mainMatchState,visual.period);
  }
  el.hidden=!value;el.style.display=value?"":"none";
  if(value!==lastMainClockPaint){el.textContent=value;lastMainClockPaint=value}
}
function syncMainClock(payload={}){
  const now=Date.now();
  const visual=deriveVisualState(null,{phase:mainMatchState.phase});
  const phase=canonicalMatchPhase(mainMatchState.phase||mainMatchState.period||mainMatchState.status);
  if(isClockHiddenState(mainMatchState,visual.period)){
    mainClockAnchorSeconds=null;mainClockRunning=false;mainClockPhase=phase;
    stopMainClockTimer();paintMainClock();return;
  }

  const elapsedField=Number(payload.elapsedSeconds);
  const parsedClock=parseClockSeconds(payload.clock??mainMatchState.clock);
  const incoming=Number.isFinite(elapsedField)?Math.max(0,elapsedField):(parsedClock!==null?Math.max(0,parsedClock):null);
  const running=Boolean(("clockRunning" in payload)?payload.clockRunning:mainMatchState.clockRunning);

  let next=incoming;
  if(mainClockAnchorSeconds!==null&&mainClockPhase===phase){
    const localNow=currentMainClockSeconds(now);
    if(localNow!==null)next=next===null?localNow:Math.max(next,localNow);
  }

  if(next!==null){
    mainClockAnchorSeconds=next;
    mainClockAnchorAt=now;
  }
  mainClockPhase=phase;
  mainClockRunning=running&&shouldShowClock(visual);

  if(mainClockRunning&&mainClockAnchorSeconds!==null){
    if(!mainClockTimer)mainClockTimer=setInterval(paintMainClock,250);
  }else stopMainClockTimer();

  paintMainClock();
}
function penaltyScoreText(item={},scheduled=false){const home=Number(item.homeScore)||0,away=Number(item.awayScore)||0,pHome=Number(item.penaltiesHome)||0,pAway=Number(item.penaltiesAway)||0,has=pHome>0||pAway>0||canonicalMatchPhase(item.phase||item.period||item.status)==='PENALTIES';if(scheduled)return scheduledDisplay(item);return has?`(${pHome}) ${home} × ${away} (${pAway})`:`${home} × ${away}`;}
function paintMainPenalties(state={},beforeKickoff=false){const home=$("homePenalty"),away=$("awayPenalty");if(!home||!away)return;const pHome=Number(state.penaltiesHome)||0,pAway=Number(state.penaltiesAway)||0,has=!beforeKickoff&&(pHome>0||pAway>0||canonicalMatchPhase(state.phase||state.period||state.status)==='PENALTIES');home.hidden=!has;away.hidden=!has;if(has){home.textContent=`(${pHome})`;away.textContent=`(${pAway})`;}}
function applyMainMatch(p={}){if(!p||typeof p!=="object")return;mainMatchState=mergePresentationState(mainMatchState,p);const state=mainMatchState,visual=deriveVisualState(null,{phase:state.phase}),status=state.period||visual.period,beforeKickoff=state.beforeKickoff===true||visual.beforeKickoff;if("competition" in p)$("mainCompetition").textContent=state.competition||"COMPETIÇÃO NÃO INFORMADA";if("status" in p||"period" in p||"phase" in p){$("mainStatus").textContent=status;$("mainPeriod").textContent=status;$("mainFactPhase").textContent=status||"—"}if("homeName" in p||"homeShort" in p)$("homeName").textContent=state.homeName||state.homeShort||"MANDANTE";if("awayName" in p||"awayShort" in p)$("awayName").textContent=state.awayName||state.awayShort||"VISITANTE";if("homeScore" in p||"status" in p||"period" in p||"phase" in p)$("homeScore").textContent=beforeKickoff?"":(Number.isFinite(Number(state.homeScore))?Number(state.homeScore):0);if("awayScore" in p||"status" in p||"period" in p||"phase" in p)$("awayScore").textContent=beforeKickoff?"":(Number.isFinite(Number(state.awayScore))?Number(state.awayScore):0);if("homeScorers" in p||"status" in p||"period" in p||"phase" in p)$("homeScorers").textContent=beforeKickoff?"":normalizeScorers(state.homeScorers);if("awayScorers" in p||"status" in p||"period" in p||"phase" in p)$("awayScorers").textContent=beforeKickoff?"":normalizeScorers(state.awayScorers);if("venue" in p||"location" in p)$("mainVenue").textContent=state.venue||state.location||"LOCAL NÃO INFORMADO";if("message" in p||"status" in p||"period" in p||"phase" in p)$("mainMatchMessage").textContent=status||state.message||"COBERTURA RODRIGOL";if("homeCrest" in p||"homeShort" in p)renderCrest($("homeCrest"),state.homeCrest,state.homeShort||"MAN");if("awayCrest" in p||"awayShort" in p)renderCrest($("awayCrest"),state.awayCrest,state.awayShort||"VIS");$("mainFactDate").textContent=state.date||"—";$("mainAttendance").textContent=state.attendance||"—";$("mainReferee").textContent=state.referee||"—";$("mainWeather").textContent=state.weather||"—";renderMainSummary(state);renderMainHighlights(state);renderLineups(state);paintMainPenalties(state,beforeKickoff);syncMainClock(p)}

const auxiliaryClockStates=new Map();
let auxiliaryClockTimer=null;
function syncAuxiliaryClock(item={}){
  const key=String(item.matchId||'').trim();
  if(!key)return;
  const now=Date.now();
  const phase=canonicalMatchPhase(item.phase||item.period||item.status);
  const visual=deriveVisualState(null,{phase});
  const running=Boolean(item.clockRunning)&&shouldShowClock(visual)&&item.clockVisible!==false;
  const rawIncoming=Number.isFinite(Number(item.elapsedSeconds))?Number(item.elapsedSeconds):parseClockSeconds(item.clock);
  // elapsedSeconds/clock já chegam do Bridge como o tempo EFETIVO no instante da publicação.
  // Somar novamente clockStartedAt aqui duplicava o tempo ao abrir a Central ou trocar
  // de Cabine/Multicabine. A partir daqui o overlay apenas ancora localmente esse valor.
  const previous=auxiliaryClockStates.get(key);
  let elapsed=Math.max(0,Number(rawIncoming??0)||0);
  if(previous&&previous.phase===phase){
    const previousNow=previous.elapsedSeconds+(previous.clockRunning?Math.max(0,Math.floor((now-previous.syncedAt)/1000)):0);
    // Publicações estruturais podem repetir um elapsed antigo. Nunca faça o relógio
    // voltar nem reinicie sua âncora local quando a partida e a fase são as mesmas.
    elapsed=Math.max(elapsed,previousNow);
  }
  auxiliaryClockStates.set(key,{phase,elapsedSeconds:elapsed,clockRunning:running,syncedAt:now,clockVisible:item.clockVisible!==false});
  ensureAuxiliaryClockTimer();
}
function auxiliaryClockText(key){
  const state=auxiliaryClockStates.get(String(key));
  if(!state)return'';
  const visual=deriveVisualState(null,{phase:state.phase});
  if(!state.clockVisible||!shouldShowClock(visual))return'';
  const elapsed=state.elapsedSeconds+(state.clockRunning?Math.max(0,Math.floor((Date.now()-state.syncedAt)/1000)):0);
  return formatClockSeconds(elapsed);
}
function paintAuxiliaryClocks(){
  document.querySelectorAll('[data-live-clock]').forEach(el=>{const value=auxiliaryClockText(el.dataset.liveClock);el.textContent=value;el.hidden=!value;el.style.display=value?'':'none'});
  document.querySelectorAll('[data-match-timing]').forEach(el=>{
    const state=auxiliaryClockStates.get(String(el.dataset.matchTiming));
    if(!state)return;
    const visual=deriveVisualState(null,{phase:state.phase});
    const clock=auxiliaryClockText(el.dataset.matchTiming);
    if(clock){
      el.textContent=visual.phase==='FIRST_HALF'?`1ºT ${clock}`:visual.phase==='SECOND_HALF'?`2ºT ${clock}`:visual.phase==='EXTRA_TIME'?`PRORR. ${clock}`:clock;
      return;
    }
    if(visual.phase==='HALFTIME')el.textContent='INTERVALO';
    else if(visual.phase==='PENALTIES')el.textContent='PÊNALTIS';
    else if(!visual.beforeKickoff)el.textContent='EM ANDAMENTO';
  });
  document.querySelectorAll('[data-side-lower-status]').forEach(el=>{
    const state=auxiliaryClockStates.get(String(el.dataset.sideLowerStatus));if(!state)return;const visual=deriveVisualState(null,{phase:state.phase}),clock=auxiliaryClockText(el.dataset.sideLowerStatus);
    if(clock)el.textContent=visual.phase==='FIRST_HALF'?`1ºT ${clock}`:visual.phase==='SECOND_HALF'?`2ºT ${clock}`:visual.phase==='EXTRA_TIME'?`PRORR. ${clock}`:clock;
    else if(visual.phase==='FINAL')el.textContent='FINAL';
    else if(visual.phase==='HALFTIME')el.textContent='INTERVALO';else if(visual.phase==='PENALTIES')el.textContent='PÊNALTIS';else if(!visual.beforeKickoff)el.textContent='EM ANDAMENTO';
  });
}
function ensureAuxiliaryClockTimer(){if(!auxiliaryClockTimer)auxiliaryClockTimer=setInterval(paintAuxiliaryClocks,250)}

let roundAnimation=null,roundResizeTimer,lastRoundFingerprint="";
function roundProgress(){if(!roundAnimation)return 0;const duration=Number(roundAnimation.effect?.getTiming()?.duration)||0;return duration>0?((Number(roundAnimation.currentTime)||0)%duration)/duration:0}
function stopRoundAnimation(reset=false){if(roundAnimation){roundAnimation.cancel();roundAnimation=null}const track=$("roundMatches");if(track&&reset)track.style.transform="translate3d(0,0,0)"}
function roundTimingLabel(m,status,beforeKickoff){
  if(beforeKickoff)return scheduledDisplay(m);
  const phase=canonicalMatchPhase(m.phase||m.period||m.status);
  const clock=auxiliaryClockText(m.matchId);
  if(clock){
    if(phase==="FIRST_HALF")return `1ºT ${clock}`;
    if(phase==="SECOND_HALF")return `2ºT ${clock}`;
    if(phase==="EXTRA_TIME")return `PRORR. ${clock}`;
    return clock;
  }
  if(phase==="HALFTIME"||status.includes("INTERVALO"))return "INTERVALO";
  if(phase==="PENALTIES")return "PÊNALTIS";
  if(phase==="SUSPENDED")return "SUSPENSA";
  return "EM ANDAMENTO";
}
function roundTileHtml(m){const status=normalizedMatchStatus(m.period||m.status||"AO VIVO"),scheduled=isScheduledStatus(status),preGame=isPreGameStatus(status),beforeKickoff=scheduled||preGame;const score=beforeKickoff?scheduledDisplay(m):penaltyScoreText(m,false);const timing=roundTimingLabel(m,status,beforeKickoff);const homeLabel=displayTeamName(m.homeName,m.homeShort);const awayLabel=displayTeamName(m.awayName,m.awayShort);const stateClass=beforeKickoff?"is-scheduled":(isFinalStatus(status)?"is-final":(status.includes("INTERVALO")||canonicalMatchPhase(m.phase||m.period||m.status)==="HALFTIME"?"is-halftime":"is-live"));return `<article class="match-tile ${stateClass}" aria-label="${escapeHtml(homeLabel)} contra ${escapeHtml(awayLabel)}"><div class="tile-main"><div class="tile-side" title="${escapeHtml(homeLabel)}">${crestMarkup(m.homeCrest,m.homeShort||"MAN")}</div><div class="tile-scorebox"><small class="tile-timing" data-match-timing="${escapeHtml(m.matchId||'')}">${escapeHtml(timing)}</small><strong>${escapeHtml(score)}</strong><small class="tile-last-action">${escapeHtml(m.latestScoreboardAction||"")}</small></div><div class="tile-side away" title="${escapeHtml(awayLabel)}">${crestMarkup(m.awayCrest,m.awayShort||"VIS")}</div></div></article>`}
function startRoundMarquee(progress=0){const track=$("roundMatches");if(!track||track.dataset.mode!=="MARQUEE")return;stopRoundAnimation(false);requestAnimationFrame(()=>{const count=Number(track.dataset.originalCount)||0;const duplicateStart=count>0?track.children[count]:null;const distance=duplicateStart?duplicateStart.offsetLeft:track.scrollWidth/2;if(!Number.isFinite(distance)||distance<=0)return;const duration=Math.max(12000,distance/36*1000);roundAnimation=track.animate([{transform:"translate3d(0,0,0)"},{transform:`translate3d(-${distance}px,0,0)`}],{duration,iterations:Infinity,easing:"linear"});roundAnimation.currentTime=Math.max(0,Math.min(.999999,Number(progress)||0))*duration})}
function renderRoundMatches(payload=[]){const matches=Array.isArray(payload)?payload:(payload.matches||payload.items||[]);matches.forEach(syncAuxiliaryClock);const fingerprint=JSON.stringify(matches.map(m=>[m.matchId,m.phase,m.period,m.status,m.homeScore,m.awayScore,m.scorers,m.message,m.latestScoreboardAction]));const previousProgress=roundProgress();const changed=fingerprint!==lastRoundFingerprint;lastRoundFingerprint=fingerprint;stopRoundAnimation(false);const track=$("roundMatches");if(!matches.length){track.dataset.mode="STATIC";track.className="match-tiles is-empty";track.innerHTML='<div class="round-empty">NENHUM JOGO EM ANDAMENTO</div>';paintAuxiliaryClocks();return}const scrolling=matches.length>6;track.dataset.mode=scrolling?"MARQUEE":"STATIC";track.dataset.originalCount=String(matches.length);track.className=`match-tiles ${scrolling?'is-marquee':'is-static'}`;const html=matches.map(roundTileHtml).join("");track.innerHTML=scrolling?html+html:html;paintAuxiliaryClocks();if(scrolling)startRoundMarquee(changed?0:previousProgress)}

const actionIcon=action=>{const text=String(action||"").toUpperCase();if(text.includes("GOL"))return"⚽";if(text.includes("AMARE"))return"🟨";if(text.includes("VERM"))return"🟥";if(text.includes("SUB"))return"🔄";if(text.includes("INTERVAL"))return"⏸";if(text.includes("FINAL")||text.includes("FIM"))return"🏁";if(text.includes("INÍC")||text.includes("INICIO"))return"▶";if(text.includes("VAR"))return"📺";return"ℹ️"};
const teamNames={PAL:"Palmeiras",FLA:"Flamengo",COR:"Corinthians",SAO:"São Paulo",SPFC:"São Paulo",BOT:"Botafogo",FLU:"Fluminense",CAM:"Atlético Mineiro",CRU:"Cruzeiro",LIV:"Liverpool",ARS:"Arsenal",RMA:"Real Madrid",BAR:"Barcelona",BAY:"Bayern de Munique",BVB:"Borussia Dortmund",GRE:"Grêmio",INT:"Internacional",CFC:"Coritiba"};
const compactTeamNames={"Internacional":"Inter","Sport Club Internacional":"Inter","Red Bull Bragantino":"Bragantino","RB Bragantino":"Bragantino","Atlético Mineiro":"Atlético-MG","Clube Atlético Mineiro":"Atlético-MG","Athletico Paranaense":"Athletico-PR","Bayern de Munique":"Bayern","Borussia Dortmund":"Dortmund","Paris Saint-Germain":"PSG","Manchester United":"Man. United","Manchester City":"Man. City","Nottingham Forest":"Nott'm Forest"};function displayTeamName(name,shortName){const full=String(name||shortName||"Clube").trim();if(compactTeamNames[full])return compactTeamNames[full];if(full.length<=15)return full;const short=String(shortName||"").trim();return short&&short.length>=3&&short.length<=12?short:full.slice(0,14).trim()+"…";}
function fullEventResult(e={}){if(e.homeName&&e.awayName){const separator=String(e.status||"").toUpperCase().includes("PROGRAM")?"x":`${e.homeScore??0} x ${e.awayScore??0}`;return `${e.homeName} ${separator} ${e.awayName}`;}const raw=String(e.result||e.score||e.match||"—");return raw.replace(/\b[A-ZÀ-Ü]{2,5}\b/g,code=>teamNames[code]||code).replace(/×/g,"x");}
function displayEventAction(value=""){const raw=String(value||"INFORMAÇÃO").trim();const key=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();const labels={"COMEÇOU":"INÍCIO DE JOGO","COMECOU":"INÍCIO DE JOGO","INICIO":"INÍCIO DE JOGO","INÍCIO":"INÍCIO DE JOGO","MATCH_START_UNKNOWN":"EM ANDAMENTO","PARTIDA EM ANDAMENTO SEM RELÓGIO CONFIRMADO":"EM ANDAMENTO","PARTIDA EM ANDAMENTO SEM RELOGIO CONFIRMADO":"EM ANDAMENTO","RECOMEÇOU":"INÍCIO DO 2º TEMPO","RECOMECOU":"INÍCIO DO 2º TEMPO","SEGUNDO TEMPO":"INÍCIO DO 2º TEMPO","INÍCIO DO 2º TEMPO":"INÍCIO DO 2º TEMPO","INICIO DO 2º TEMPO":"INÍCIO DO 2º TEMPO","FIM":"FIM DE JOGO","FIM DE JOGO":"FIM DE JOGO","INTERVALO":"INTERVALO","GOL":"GOL","EM ANDAMENTO":"EM ANDAMENTO","VAR":"VAR","PÊNALTI":"GOL","PENALTI":"GOL"};return labels[key]||raw.toUpperCase()}
function eventDisplayMinute(e={},action=""){const key=String(action).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();if(["INICIO DE JOGO","INICIO DO 2º TEMPO","INTERVALO","FIM DE JOGO","EM ANDAMENTO"].includes(key))return "";const value=e.minute||e.time||"";return value==="0'"||value==="0"?"":value}
function eventResultHtml(e={}){const home=String(e.homeName||"").toUpperCase(),away=String(e.awayName||"").toUpperCase(),score=`${Number(e.homeScore)||0} X ${Number(e.awayScore)||0}`;if(home&&away)return `${escapeHtml(home)} ${score} ${escapeHtml(away)}`;return escapeHtml(fullEventResult(e).toUpperCase())}
function eventAuthorHtml(e={}){const author=String(e.author||e.player||"").trim();if(!author||author==="—")return "";const details=String(e.details||"").trim();const penalty=/P[ÊE]NALTI|PENALTY/i.test(details);return `${escapeHtml(author.toUpperCase())}${penalty?` <span class="event-note">(PÊNALTI)</span>`:""}`}
let lastValidEvents=[];function renderEvents(payload=[]){const incoming=(Array.isArray(payload)?payload:(payload.events||payload.items||[]));if(incoming.length)lastValidEvents=incoming.slice(0,8);else if(payload&&typeof payload==="object"&&payload.clear===true)lastValidEvents=[];const events=lastValidEvents.filter(e=>!["YELLOW_CARD","RED_CARD"].includes(String(e.eventType||"").toUpperCase()));$("eventsList").innerHTML=events.map(e=>{const action=displayEventAction(e.action||e.label||e.type||"INFORMAÇÃO");const goal=String(e.eventType||"").toUpperCase()==="GOAL"||action==="GOL";return `<div class="event-row"><b>${escapeHtml(e.competitionShort||e.competition||"")}</b><strong class="event-result">${eventResultHtml(e)}</strong><span class="event-action">${escapeHtml(action)}</span><span>${escapeHtml(eventDisplayMinute(e,action))}</span><span class="event-author">${eventAuthorHtml(e)}</span></div>`}).join("")}
function summaryText(item={}){const competition=item.competition||item.name||"COMPETIÇÃO";const home=item.homeName||item.homeShort||"Mandante";const away=item.awayName||item.awayShort||"Visitante";const status=String(item.status||"").toUpperCase();const scheduled=status.includes("PROGRAM")||status.includes("AGEND")||status.includes("PRÉ");const scoreText=penaltyScoreText(item,false);const result=scheduled?`${home} x ${away} - ${item.time||item.startTime||"horário a definir"}`:`${home} ${scoreText} ${away}`;const goals=Array.isArray(item.goals)?item.goals:(Array.isArray(item.scorers)?item.scorers:[]);const goalText=goals.map(g=>`⚽ ${g.minute||""} ${g.player||g.name||""}`.trim()).join(" · ");return {competition,result,goalText}}
let summaryPopTimer,summaryPopIndex=0,lastSummaryFingerprint="",lastSummarySpeed=60,summaryAnimation=null,summaryResizeTimer;function summaryItemHtml(item){const text=summaryText(item);return `<span class="summary-item"><strong>${escapeHtml(text.competition)} - ${escapeHtml(text.result)}</strong>${text.goalText?`<span class="summary-goals">${escapeHtml(text.goalText)}</span>`:""}</span><span class="summary-divider">•</span>`}function summaryPixelsPerSecond(speedSetting){return Math.max(24,Math.min(100,2475/Math.max(15,Number(speedSetting)||60)))}function summaryProgress(){if(!summaryAnimation)return 0;const duration=Number(summaryAnimation.effect?.getTiming()?.duration)||0;return duration>0?((Number(summaryAnimation.currentTime)||0)%duration)/duration:0}function stopSummaryAnimation(reset=false){if(summaryAnimation){summaryAnimation.cancel();summaryAnimation=null}const track=$("summaryTrack");if(track){track.style.animation="none";if(reset)track.style.transform="translate3d(0,0,0)"}}function startSummaryMarquee(progress=0){const track=$("summaryTrack");if(!track||track.dataset.mode!=="MARQUEE")return;stopSummaryAnimation(false);requestAnimationFrame(()=>{const distance=track.scrollWidth/2;if(!Number.isFinite(distance)||distance<=0)return;const duration=Math.max(1000,distance/summaryPixelsPerSecond(lastSummarySpeed)*1000);summaryAnimation=track.animate([{transform:"translate3d(0,0,0)"},{transform:`translate3d(-${distance}px,0,0)`}],{duration,iterations:Infinity,easing:"linear"});summaryAnimation.currentTime=Math.max(0,Math.min(.999999,Number(progress)||0))*duration})}function renderSummary(payload=[]){let items=Array.isArray(payload)?payload:(payload.items||payload.matches||[]);if(items.some(item=>Array.isArray(item.matches)))items=items.flatMap(group=>(group.matches||[]).map(match=>({...match,competition:group.name||group.competition||match.competition,status:match.status||group.status})));const mode=items[0]?.mode==="POP"?"POP":"MARQUEE";const incomingSpeed=Number(items[0]?.speedSeconds),speed=Number.isFinite(incomingSpeed)?Math.min(120,Math.max(15,incomingSpeed)):lastSummarySpeed;const fingerprint=JSON.stringify({mode,items:items.map(item=>summaryText(item))});const contentChanged=fingerprint!==lastSummaryFingerprint,speedChanged=speed!==lastSummarySpeed;if(!contentChanged&&!speedChanged)return;const previousProgress=!contentChanged&&mode==="MARQUEE"?summaryProgress():0;lastSummaryFingerprint=fingerprint;lastSummarySpeed=speed;clearInterval(summaryPopTimer);stopSummaryAnimation(contentChanged);$("summaryTrack").dataset.mode=mode;if(!items.length){$("summaryTrack").innerHTML='<span class="summary-item"><strong>NENHUMA PARTIDA DISPONÍVEL</strong></span>';return}if(mode==="POP"){summaryPopIndex=0;const show=()=>{$("summaryTrack").innerHTML=summaryItemHtml(items[summaryPopIndex%items.length]);summaryPopIndex=(summaryPopIndex+1)%items.length};show();summaryPopTimer=setInterval(show,Math.max(4000,Math.round(speed*1000/10)));return}if(contentChanged){const html=items.map(summaryItemHtml).join("");$("summaryTrack").innerHTML=html+html}startSummaryMarquee(previousProgress)}
let highlightTimer,highlightIndex=0,lastHighlightFingerprint="",highlightMeasureTimer;
function renderEditorialMarquee(text=''){
  const windowEl=$("highlightWindow"),track=$("highlightText");
  if(!windowEl||!track)return;
  const value=String(text||'').trim();

  track.classList.remove("is-scrolling");
  track.style.removeProperty("--highlight-distance");
  track.style.removeProperty("--highlight-duration");
  track.style.removeProperty("--highlight-gap");
  track.innerHTML=`<span class="rg-highlight-copy">${escapeHtml(value)}</span>`;

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const first=track.querySelector(".rg-highlight-copy");
    if(!first)return;
    const visible=Math.floor(windowEl.clientWidth);
    const textWidth=Math.ceil(first.getBoundingClientRect().width);
    if(textWidth<=visible-4)return;

    const gap=Math.max(64,Math.round(visible*.08));
    const clone=first.cloneNode(true);
    clone.setAttribute("aria-hidden","true");
    track.appendChild(clone);
    track.style.setProperty("--highlight-distance",`${textWidth+gap}px`);
    track.style.setProperty("--highlight-gap",`${gap}px`);
    track.style.setProperty("--highlight-duration",`${Math.max(18,Math.min(60,(textWidth+gap)/42))}s`);
    void track.offsetWidth;
    track.classList.add("is-scrolling");
  }));
}
function updateEditorialHighlightMotion(){
  const track=$("highlightText");
  if(!track)return;
  renderEditorialMarquee(track.dataset.headline||track.textContent||"");
}

function normalizeHighlightItems(payload={}){const raw=Array.isArray(payload.headlines)?payload.headlines:[];const items=raw.map(item=>typeof item==="string"?{text:item,category:payload.category||payload.label||"DESTAQUE"}:{text:item.text||item.headline||item.message||"",category:item.category||item.editorialCategory||item.label||payload.category||payload.label||"DESTAQUE"}).filter(item=>item.text);if(!items.length){const text=payload.text||payload.message||payload.headline||payload.summary;if(text)items.push({text,category:payload.category||payload.editorialCategory||payload.label||"DESTAQUE"})}return items}
function applyHighlight(p={}){const payload=typeof p==="string"?{text:p}:p;const items=normalizeHighlightItems(payload);if(!items.length)return;const mode=payload.mode==="FIXED"?"FIXED":"ROTATE";const interval=Math.max(4,Number(payload.intervalSeconds)||10);const fingerprint=JSON.stringify({items,mode,interval});if(fingerprint===lastHighlightFingerprint)return;clearInterval(highlightTimer);lastHighlightFingerprint=fingerprint;highlightIndex=0;const show=()=>{const item=items[highlightIndex%items.length];$("highlightCategory").textContent=String(item.category||"DESTAQUE").toUpperCase();$("highlightText").dataset.headline=item.text;renderEditorialMarquee(item.text);highlightIndex=(highlightIndex+1)%items.length};show();if(mode==="ROTATE"&&items.length>1)highlightTimer=setInterval(show,interval*1000)}
const defaultSidebar={panels:[],intervalSeconds:12};
let sidebar=defaultSidebar,sideIndex=0,sideTimer,standingsPanels=[],sideLower={cards:[],intervalSeconds:10},sideLowerIndex=0,sideLowerTimer;
function renderSidebarPanel(){const sideContentEl=$('sideContent');sideContentEl?.classList.remove('standings-compact');const panels=Array.isArray(sidebar.panels)?sidebar.panels:[];if(!panels.length){$("sideTitle").textContent="PAINEL LATERAL";$("sideCounter").textContent="0/0";$("sideContent").innerHTML=`<div class="side-list"><article class="side-item"><b>Nenhum painel publicado</b><small>Configure a sequência na Central do Overlay.</small></article></div>`;document.querySelectorAll('.side-dot').forEach(dot=>dot.classList.remove('active'));return}const panel=panels[sideIndex%panels.length];$("sideTitle").textContent=panel.title||"PAINEL LATERAL";$("sideCounter").textContent=`${sideIndex%panels.length+1}/${panels.length}`;if(panel.type==="standings"){const standingItems=panel.items||[];if(standingItems.length<=6)sideContentEl?.classList.add("standings-compact");$("sideContent").innerHTML=standingItems.map(item=>`<div class="standing-row"><b>${escapeHtml(item.position)}</b><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.points)}</strong></div>`).join("");}else if(panel.type==="news")$("sideContent").innerHTML=(panel.items||[]).map(item=>`<article class="news-card"><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.meta||"")}</small></article>`).join("");else if(panel.type==="grouped-matches")$("sideContent").innerHTML=`<div class="side-groups">${(panel.groups||[]).map(group=>`<section class="side-group"><h3>${escapeHtml(group.name)}</h3>${(group.items||[]).map(item=>{const phase=canonicalMatchPhase(item.phase||item.period||item.status);const visual=deriveVisualState(null,{phase});const beforeKickoff=visual.beforeKickoff;const liveClock=item.clockVisible!==false&&shouldShowClock(visual);const running=liveClock&&(item.clockRunning===true||Number(item.clockStartedAt)>0);syncAuxiliaryClock({...item,phase:visual.phase,clockVisible:liveClock,clockRunning:running});const timing=beforeKickoff?scheduledDisplay(item):(liveClock?auxiliaryClockText(item.matchId):"");const stateLabel=beforeKickoff?timing:(visual.phase==="FINAL"?"FINAL":visual.period||item.status||"COBERTURA");return `<article class="side-match ${beforeKickoff?"before-kickoff":""}"><div><b>${escapeHtml(stateLabel)}</b>${liveClock?`<span data-live-clock="${escapeHtml(item.matchId||'')}" ${timing?'':'hidden'}>${escapeHtml(timing)}</span>`:""}</div><strong>${escapeHtml(item.title||"")}</strong>${!beforeKickoff&&item.latestAction?`<small>${escapeHtml(item.latestAction)}</small>`:""}</article>`}).join("")}</section>`).join("")}</div>`;else if(panel.type==="knockout")$("sideContent").innerHTML=`<div class="knockout-panel">${panel.subtitle?`<div class="knockout-phase">${escapeHtml(panel.subtitle)}</div>`:""}${(panel.items||[]).map(item=>`<article class="knockout-tie"><div class="knockout-status">${escapeHtml(item.status||"PROGRAMADO")}</div><div class="knockout-match"><span>${escapeHtml(item.home||"A definir")}</span><b>${escapeHtml(item.homeScore)} x ${escapeHtml(item.awayScore)}</b><span>${escapeHtml(item.away||"A definir")}</span></div>${item.firstLeg?`<small>IDA · ${escapeHtml(item.firstLeg)}</small>`:""}${item.secondLeg?`<small>VOLTA · ${escapeHtml(item.secondLeg)}</small>`:""}${item.aggregate?`<small>AGREGADO · ${escapeHtml(item.aggregate)}</small>`:""}${item.penalties?`<small>PÊNALTIS · ${escapeHtml(item.penalties)}</small>`:""}${item.winner?`<strong class="knockout-winner">CLASSIFICADO · ${escapeHtml(item.winner)}</strong>`:""}${item.notes?`<em>${escapeHtml(item.notes)}</em>`:""}</article>`).join("")}</div>`;else $("sideContent").innerHTML=`<div class="side-list">${(panel.items||[]).map(item=>`<article class="side-item"><b>${escapeHtml(item.title||item.match||"")}</b><small>${escapeHtml(item.meta||item.status||"")}</small></article>`).join("")}</div>`;document.querySelectorAll('.side-dot').forEach((dot,index)=>dot.classList.toggle('active',index===sideIndex%Math.min(3,panels.length)))}

function lowerMatchStatus(card={}){const visual=deriveVisualState(null,{phase:card.phase||card.period||card.status});if(card.isFinal===true||visual.isFinal||visual.phase==='FINAL'||isFinalStatus(card.status)||isFinalStatus(card.period))return'FINAL';if(visual.beforeKickoff)return scheduledDisplay(card);if(visual.phase==='HALFTIME')return'INTERVALO';if(visual.phase==='PENALTIES')return'PÊNALTIS';if(card.clockVisible!==false&&shouldShowClock(visual)){syncAuxiliaryClock(card);const value=auxiliaryClockText(card.matchId);if(value){if(visual.phase==='FIRST_HALF')return`1ºT ${value}`;if(visual.phase==='SECOND_HALF')return`2ºT ${value}`;if(visual.phase==='EXTRA_TIME')return`PRORR. ${value}`;return value;}}return'EM ANDAMENTO';}
function renderSideLower(){const cards=Array.isArray(sideLower.cards)?sideLower.cards:[],content=$('sideLowerContent');if(!content)return;if(!cards.length){$('sideLowerTitle').textContent='DESTAQUES';$('sideLowerCounter').textContent='0/0';content.innerHTML='<div class="side-lower-empty">Nenhum card selecionado</div>';document.querySelectorAll('.side-lower-dot').forEach(d=>d.classList.remove('active'));return;}const card=cards[sideLowerIndex%cards.length];$('sideLowerCounter').textContent=`${sideLowerIndex%cards.length+1}/${cards.length}`;if(card.type==='lineup'){$('sideLowerTitle').textContent=`ESCALAÇÃO · ${card.teamName||'EQUIPE'}`;const starters=(Array.isArray(card.starters)?card.starters:[]).slice(0,11);content.innerHTML=`<article class="side-lineup-card"><div class="side-lineup-team">${crestMarkup(card.crest,card.teamShort||'') }<strong>${escapeHtml(card.teamName||'EQUIPE')}</strong></div><ol>${starters.length?starters.map(player=>{const text=String(player||'').trim();const converted=text.replace(/^(\d{1,3})[.\s-]+(.+?)(?:\s+\((\d{1,3})[.\s-]+(.+)\))?$/,(_,number,name,outNumber,outName)=>outNumber?`${number} - ${name} (${outNumber} - ${outName})`:`${number} - ${name}`);return `<li>${escapeHtml(converted)}</li>`}).join(''):'<li>Escalação não informada</li>'}</ol>${card.coach?`<small>TÉC. ${escapeHtml(card.coach)}</small>`:''}</article>`;}else{$('sideLowerTitle').textContent=card.competition||'JOGO';syncAuxiliaryClock(card);const status=lowerMatchStatus(card),homeGoals=Array.isArray(card.homeGoals)?card.homeGoals:[],awayGoals=Array.isArray(card.awayGoals)?card.awayGoals:[],hasGoals=homeGoals.length||awayGoals.length,goalsHtml=hasGoals?`<div class="side-score-goals"><div>${homeGoals.map(goal=>`<span><b>${escapeHtml(goal.minute||'')}</b> ${escapeHtml(goal.player||'Gol')}</span>`).join('')}</div><div>${awayGoals.map(goal=>`<span><b>${escapeHtml(goal.minute||'')}</b> ${escapeHtml(goal.player||'Gol')}</span>`).join('')}</div></div>`:'';content.innerHTML=`<article class="side-score-card ${hasGoals?'has-goals':''}"><div class="side-score-status" data-side-lower-status="${escapeHtml(card.matchId||'')}">${escapeHtml(status)}</div><div class="side-score-main"><div>${crestMarkup(card.homeCrest,'MAN')}<span>${escapeHtml(card.homeName||'Mandante')}</span></div><strong>${card.beforeKickoff?'×':penaltyScoreText(card,false)}</strong><div>${crestMarkup(card.awayCrest,'VIS')}<span>${escapeHtml(card.awayName||'Visitante')}</span></div></div>${goalsHtml}</article>`;}document.querySelectorAll('.side-lower-dot').forEach((dot,index)=>dot.classList.toggle('active',index===sideLowerIndex%Math.min(3,cards.length)));}
function scheduleSideLower(){clearInterval(sideLowerTimer);renderSideLower();sideLowerTimer=setInterval(()=>{sideLowerIndex=(sideLowerIndex+1)%(sideLower.cards?.length||1);renderSideLower()},Math.max(5,Number(sideLower.intervalSeconds)||10)*1000)}
function applySideLower(payload={}){sideLower={cards:Array.isArray(payload.cards)?payload.cards:[],intervalSeconds:Math.max(5,Number(payload.intervalSeconds)||10)};sideLowerIndex=0;scheduleSideLower()}

function scheduleSidebar(){clearInterval(sideTimer);renderSidebarPanel();sideTimer=setInterval(()=>{sideIndex=(sideIndex+1)%(sidebar.panels?.length||1);renderSidebarPanel()},Math.max(5,Number(sidebar.intervalSeconds)||10)*1000)}
function applySidebar(p={}){const panels=Array.isArray(p.panels)?p.panels:[];if(p.lower)applySideLower(p.lower);if(!panels.length&&Array.isArray(sidebar.panels)&&sidebar.panels.length&&!p.clear)return;sidebar={...defaultSidebar,...p,panels};sideIndex=0;scheduleSidebar()}
function applyStandings(p={}){standingsPanels=Array.isArray(p.panels)?p.panels:[];if(!Array.isArray(sidebar.panels)||!sidebar.panels.length)applySidebar({intervalSeconds:sidebar.intervalSeconds||12,panels:standingsPanels})}
const regionElements={"studio-lower-third":"studioLowerThird","studio-headline":"studioHeadline","studio-fullscreen":"studioFullscreen","editorial-highlight":null};
const regionTimers=new Map();function setRegionVisible(region,visible){const id=regionElements[region];if(id){const el=$(id);if(el)el.hidden=!visible}if(region==="editorial-highlight"){const el=document.querySelector(".editorial-highlight");if(el)el.hidden=!visible}}function clearRegionTimer(region){const timer=regionTimers.get(region);if(timer)clearTimeout(timer);regionTimers.delete(region)}function scheduleRegionHide(region,payload={}){clearRegionTimer(region);const duration=Number(payload.durationMs)||0;if(duration>0)regionTimers.set(region,setTimeout(()=>setRegionVisible(region,false),duration))}function applyLowerThird(p={}){$("lowerThirdEyebrow").textContent=p.eyebrow||p.label||"";$("lowerThirdHeadline").textContent=p.headline||p.text||"";$("lowerThirdSummary").textContent=p.summary||"";setRegionVisible("studio-lower-third",true);scheduleRegionHide("studio-lower-third",p)}function applyHeadline(p={}){$("headlineLabel").textContent=p.label||"URGENTE";$("headlineText").textContent=p.headline||p.text||"";setRegionVisible("studio-headline",true);scheduleRegionHide("studio-headline",p)}function applyFullscreen(p={}){$("fullscreenLabel").textContent=p.label||"RODRIGOL STUDIO";$("fullscreenHeadline").textContent=p.headline||p.text||"";$("fullscreenSummary").textContent=p.summary||"";setRegionVisible("studio-fullscreen",true);scheduleRegionHide("studio-fullscreen",p)}const studioHandlers={"studio-topbar":applyTopbar,scoreboard:applyMainMatch,"round-scoreboard":renderRoundMatches,"live-events":renderEvents,"round-summary":renderSummary,"editorial-highlight":applyHighlight,"studio-sidebar":applySidebar,"studio-standings":applyStandings,"studio-lower-third":applyLowerThird,"studio-headline":applyHeadline,"studio-fullscreen":applyFullscreen};function clearAllCommandRegions(){for(const region of Object.keys(regionElements)){clearRegionTimer(region);setRegionVisible(region,false)}}function receiveBridgeCommand(c){if(!c||typeof c!=="object")return;if(c.type==="clear-all"){clearAllCommandRegions();return}if(!c.region)return;if(c.type==="hide"||c.type==="clear"){clearRegionTimer(c.region);setRegionVisible(c.region,false);return}if(!["show","update"].includes(c.type))return;studioHandlers[c.region]?.(c.payload||{});if(c.type==="show")setRegionVisible(c.region,true)}
window.addEventListener("resize",()=>{clearTimeout(roundResizeTimer);roundResizeTimer=setTimeout(()=>{if($("roundMatches")?.dataset.mode!=="MARQUEE")return;const progress=roundProgress();startRoundMarquee(progress)},160)});window.addEventListener("resize",()=>{clearTimeout(summaryResizeTimer);summaryResizeTimer=setTimeout(()=>{if($("summaryTrack")?.dataset.mode!=="MARQUEE")return;const progress=summaryProgress();startSummaryMarquee(progress)},160)});document.addEventListener("visibilitychange",()=>{for(const animation of [summaryAnimation,roundAnimation]){if(!animation)continue;if(document.hidden)animation.pause();else animation.play()}});
let socket,reconnectTimer,reconnectAttempt=0;function configuredBridgeWs(){const query=new URLSearchParams(location.search).get("bridge");if(query){const protocol=location.protocol==="https:"?"wss:":"ws:";return `${protocol}//${query}/ws`;}try{const cfg=JSON.parse(localStorage.getItem("rodrigol-runtime-config-v2")||"{}");if(cfg.bridgeWs)return cfg.bridgeWs;}catch{}const protocol=location.protocol==="https:"?"wss:":"ws:";return `${protocol}//${location.host}/ws`;}function connectBridge(){clearTimeout(reconnectTimer);try{socket=new WebSocket(configuredBridgeWs());socket.addEventListener("open",()=>{reconnectAttempt=0;$("connection").classList.add("connected")});socket.addEventListener("message",event=>{try{const message=JSON.parse(event.data);if(message.type==="command")receiveBridgeCommand(message.command);if(message.type==="welcome")Object.entries(message.regions||{}).forEach(([region,value])=>receiveBridgeCommand({region,type:value?.visible===false?"hide":"update",payload:value?.payload||{}}))}catch{}});socket.addEventListener("close",()=>{$("connection").classList.remove("connected");reconnectAttempt+=1;reconnectTimer=setTimeout(connectBridge,Math.min(15000,1000*2**Math.min(reconnectAttempt,4)))});socket.addEventListener("error",()=>socket.close())}catch{reconnectAttempt+=1;reconnectTimer=setTimeout(connectBridge,Math.min(15000,1000*2**Math.min(reconnectAttempt,4)))}}
const crest=(text,background)=>({text,background,color:"#fff"});
const demoMatches=[{competitionShort:"BR1",status:"AO VIVO",clock:"67'",homeName:"Botafogo",awayName:"Fluminense",homeShort:"BOT",awayShort:"FLU",homeScore:1,awayScore:0,homeCrest:crest("BOT","#111"),awayCrest:crest("FLU","#7b1735"),scorers:"⚽ 41' Savarino"},{competitionShort:"BR1",status:"INTERVALO",clock:"INTERVALO",homeName:"Corinthians",awayName:"São Paulo",homeShort:"COR",awayShort:"SAO",homeScore:0,awayScore:0,homeCrest:crest("COR","#111"),awayCrest:crest("SAO","#d71920")},{competitionShort:"BR1",status:"AO VIVO",clock:"72'",homeName:"Atlético-MG",awayName:"Cruzeiro",homeShort:"CAM",awayShort:"CRU",homeScore:2,awayScore:2,homeCrest:crest("CAM","#111"),awayCrest:crest("CRU","#1760ad"),scorers:"Jogo eletrizante"},{competitionShort:"ING",status:"FINAL",clock:"FINAL",homeName:"Liverpool",awayName:"Arsenal",homeShort:"LIV",awayShort:"ARS",homeScore:2,awayScore:1,homeCrest:crest("LIV","#b20e22"),awayCrest:crest("ARS","#c8102e")},{competitionShort:"ESP",status:"PROGRAMADO",clock:"17:00",homeName:"Real Madrid",awayName:"Barcelona",homeShort:"RMA",awayShort:"BAR",time:"17:00",homeCrest:crest("RMA","#fff"),awayCrest:crest("BAR","#193f8f")},{competitionShort:"ALE",status:"AO VIVO",clock:"54'",homeName:"Bayern",awayName:"Dortmund",homeShort:"BAY",awayShort:"BVB",homeScore:3,awayScore:1,homeCrest:crest("BAY","#d71920"),awayCrest:crest("BVB","#f2d200")}];
const demoEvents=[{competitionShort:"BR1",action:"GOL",homeName:"Palmeiras",awayName:"Flamengo",homeScore:2,awayScore:1,minute:"62'",author:"Flaco López"},{competitionShort:"BR1",action:"CARTÃO AMARELO",homeName:"Corinthians",awayName:"São Paulo",homeScore:0,awayScore:0,minute:"57'",author:"Raniele"},{competitionShort:"ING",action:"FINAL",homeName:"Liverpool",awayName:"Arsenal",homeScore:2,awayScore:1,minute:"90+6'",author:"—"},{competitionShort:"ESP",action:"INÍCIO",homeName:"Real Madrid",awayName:"Barcelona",minute:"00'",author:"—"},{competitionShort:"BR1",action:"GOL",homeName:"Atlético Mineiro",awayName:"Cruzeiro",homeScore:2,awayScore:2,minute:"78'",author:"Matheus Pereira"},{competitionShort:"ALE",action:"GOL",homeName:"Bayern de Munique",awayName:"Borussia Dortmund",homeScore:3,awayScore:1,minute:"54'",author:"Kane"},{competitionShort:"BR1",action:"CARTÃO VERMELHO",homeName:"Botafogo",awayName:"Fluminense",homeScore:1,awayScore:0,minute:"45+3'",author:"Samuel Xavier"},{competitionShort:"BR1",action:"SUBSTITUIÇÃO",homeName:"Palmeiras",awayName:"Flamengo",homeScore:2,awayScore:1,minute:"80'",author:"Palmeiras"}];
const demoSummary=[{competition:"Campeonato Brasileiro Série A",status:"AO VIVO",homeName:"Coritiba",awayName:"Cruzeiro",homeScore:0,awayScore:1,goals:[{minute:"66'",player:"Matheus Pereira"}]},{competition:"Campeonato Brasileiro Série A",status:"AO VIVO",homeName:"Palmeiras",awayName:"Flamengo",homeScore:2,awayScore:1,goals:[{minute:"12'",player:"Raphael Veiga"},{minute:"58'",player:"Flaco López"},{minute:"37'",player:"Pedro"}]},{competition:"Premier League",status:"FINAL",homeName:"Liverpool",awayName:"Arsenal",homeScore:2,awayScore:1,goals:[{minute:"18'",player:"Salah"},{minute:"76'",player:"Núñez"},{minute:"54'",player:"Saka"}]},{competition:"La Liga",status:"PROGRAMADO",homeName:"Real Madrid",awayName:"Barcelona",time:"17:00"}];
const queryParams=new URLSearchParams(location.search);if(queryParams.get("background")==="test")document.body.classList.add("background-test");if(queryParams.get("mode")==="overlay")document.body.classList.add("overlay-transparent");updateClock();setInterval(updateClock,1000);scheduleSidebar();connectBridge();

