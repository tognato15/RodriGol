import {collectOperationalMissions,summarizeOperationalState} from './operational-missions.js';
const $=id=>document.getElementById(id);
function render(){
  const summary=summarizeOperationalState();
  const missions=collectOperationalMissions();
  if($('mcLive')) $('mcLive').textContent=summary.live;
  if($('mcHalftime')) $('mcHalftime').textContent=summary.halftime;
  if($('mcOnAir')) $('mcOnAir').textContent=summary.onAir;
  if($('mcMissions')) $('mcMissions').textContent=summary.missions;
  const top=missions[0];
  const strip=$('mcMissionStrip');
  if(!strip)return;
  strip.className=`panel mc-mission-strip ${top?.severity||'ok'}`;
  $('mcMissionTitle').textContent=top?.title||'Operação organizada';
  $('mcMissionDetail').textContent=top?.detail||'Nenhuma ação urgente no momento.';
  const action=$('mcMissionAction');
  action.href=top?.href||'/control/missions.html';
  action.textContent=top?.actionLabel||'Abrir missões';
}
window.addEventListener('storage',render);
window.addEventListener('rodrigol:data-changed',render);
setInterval(render,5000);
render();
