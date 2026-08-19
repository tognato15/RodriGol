const NAV_GROUPS=[
 ['OPERAÇÃO',[
  ['/control/production.html','▦ Central de Produção'],
  ['/control/round-center.html','◉ Central da Rodada'],
  ['/control/missions.html','⚑ Missões Operacionais'],
  ['/control/','◉ Cabine de Cobertura'],
  ['/control/multicabine.html','▦ Multicabine'],
  ['/control/overlay-control.html','▰ Central do Overlay'],
  ['/control/central.html','▣ Central de Coberturas']]],
 ['COMPETIÇÕES',[
  ['/control/matches.html','▣ Partidas'],
  ['/control/rounds.html','◫ Rodadas'],
  ['/control/standings.html','▤ Classificações'],
  ['/control/knockout.html','⌘ Mata-mata'],
  ['/control/agenda.html','◫ Agenda Esportiva'],
  ['/control/competitions.html','🏆 Competições'],
  ['/control/clubs.html','⚽ Clubes']]],
 ['EDITORIAL',[
  ['/control/news.html','▤ Notícias'],
  ['/control/ticker.html','★ Destaques'],
  ['/control/editorial.html','☷ Mesa Editorial']]],
 ['CONTROLE',[
  ['/control/archive.html','▣ Arquivo Operacional'],
  ['/control/history.html','◷ Histórico'],
  ['/control/diagnostics.html','⚙ Diagnóstico'],
  ['/control/network.html','⌁ Rede e Conexões'],
  ['/control/settings.html','⚙ Configurações'],
  ['/control/storage.html','▣ Armazenamento e Backup']]]
];
function normalizedPath(){const p=location.pathname.replace(/\/+$/,'');return p==='/control' ? '/control/' : p;}
function isActive(href){const current=normalizedPath();const target=href.replace(/\/+$/,'')||'/';if(href==='/control/')return current==='/control/'||current==='/control/index.html';return current===target;}
function masterMarkup(){return `<nav class="rg-master-nav">${NAV_GROUPS.map(([title,links])=>`<div class="rg-nav-group">${title}</div>${links.map(([href,label])=>`<a href="${href}" class="${isActive(href)?'active':''}">${label}</a>`).join('')}`).join('')}</nav>`}
function install(){
 let sidebar=document.querySelector('aside.sidebar');
 if(!sidebar){
   const main=document.querySelector('main'); if(!main)return;
   sidebar=document.createElement('aside'); sidebar.className='sidebar';
   const shell=document.createElement('div'); shell.className='rg-page-shell';
   main.parentNode.insertBefore(shell,main); shell.append(sidebar,main);
 }
 const preserved=[...sidebar.querySelectorAll('button, a[target="_blank"], a[href^="/?"]')];
 sidebar.innerHTML=masterMarkup();
 if(preserved.length){const title=document.createElement('div');title.className='rg-local-title';title.textContent='NESTA PÁGINA';const tools=document.createElement('div');tools.className='rg-local-tools';preserved.forEach(el=>tools.appendChild(el));sidebar.append(title,tools)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();

function installStorageGuard(){
 const show=detail=>{
  let banner=document.getElementById('rg-storage-alert');
  if(!banner){banner=document.createElement('div');banner.id='rg-storage-alert';banner.style.cssText='position:fixed;z-index:99999;left:16px;right:16px;top:12px;padding:13px 16px;border:2px solid #ff5a36;border-radius:8px;background:#3a1010;color:#fff;font:800 14px Inter,Segoe UI,sans-serif;box-shadow:0 10px 30px #0009';document.body.appendChild(banner)}
  banner.innerHTML=`⚠ <b>Falha ao salvar dados.</b> ${detail?.message||'O armazenamento pode estar cheio.'} <a href="/control/storage.html" style="color:#ffd166;margin-left:10px">Abrir armazenamento e backup</a>`;
 };
 window.addEventListener('rodrigol:storage-error',event=>show(event.detail));
 try{const saved=JSON.parse(sessionStorage.getItem('rodrigol-storage-error-v1')||'null');if(saved)show(saved)}catch{}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installStorageGuard);else installStorageGuard();
