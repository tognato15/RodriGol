import {collectOperationalSnapshot,collectOperationalMissions,summarizeOperationalState} from './operational-missions.js';
const $=id=>document.getElementById(id);
let renderTimer=null;
function render(){
  const snapshot=collectOperationalSnapshot(),missions=collectOperationalMissions(snapshot),summary=summarizeOperationalState(snapshot,missions);
  if($('mcLive')) $('mcLive').textContent=summary.live;
  if($('mcHalftime')) $('mcHalftime').textContent=summary.halftime;
  if($('mcOnAir')) $('mcOnAir').textContent=summary.onAir;
  if($('mcMissions')) $('mcMissions').textContent=summary.missions;
  const top=missions[0],strip=$('mcMissionStrip');if(!strip)return;
  strip.className=`panel mc-mission-strip ${top?.severity||'ok'}`;
  $('mcMissionTitle').textContent=top?.title||'Operação organizada';
  $('mcMissionDetail').textContent=top?.detail||'Nenhuma ação urgente no momento.';
  const action=$('mcMissionAction');action.href=top?.href||'/control/missions.html';action.textContent=top?.actionLabel||'Abrir missões';
}
function scheduleRender(delay=900){clearTimeout(renderTimer);renderTimer=setTimeout(()=>{renderTimer=null;const run=()=>render();if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1200});else run();},delay);}
window.addEventListener('storage',()=>scheduleRender());
window.addEventListener('rodrigol:data-changed',event=>{const key=String(event.detail?.key||'');if(!key||/matches|coverage|on-air|agenda/.test(key))scheduleRender();});
window.addEventListener('rodrigol:remote-hydrated',()=>scheduleRender(50));
setInterval(()=>{if(!document.hidden)scheduleRender(0);},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRender(50);});
scheduleRender(0);
