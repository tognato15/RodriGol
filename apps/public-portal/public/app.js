const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let lastSignature='';
function crest(team){return team?.crest?`<img src="${esc(team.crest)}" alt="${esc(team.name)}">`:`<span class="crest-fallback">${esc(team?.abbreviation||String(team?.name||'?').slice(0,3).toUpperCase())}</span>`}
function matchCard(match){
 const scheduled=match.status==='PROGRAMADO',status=match.status||match.phase||'';
 const score=scheduled?'×':`${Number(match.score?.home)||0} × ${Number(match.score?.away)||0}`;
 return `<article class="match-card" data-match-id="${esc(match.id)}"><div class="match-meta"><span>${esc(match.time||status)}</span><span class="${match.live?'live':''}">${esc(status)}</span></div><div class="match-teams"><div class="team">${crest(match.home)}<span>${esc(match.home?.name)}</span></div><div class="score">${esc(score)}</div><div class="team">${crest(match.away)}<span>${esc(match.away?.name)}</span></div></div><div class="match-foot">${esc(match.venue||match.round||'')}</div></article>`;
}
function renderMatches(matches=[]){
 const box=$('matchGroups');if(!matches.length){box.innerHTML='<div class="empty">Nenhuma partida cadastrada para hoje.</div>';return}
 const groups=new Map();for(const match of matches){const key=match.competition||'Futebol';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(match)}
 box.innerHTML=[...groups].map(([competition,items])=>`<section class="competition-block"><div class="competition-title">${esc(competition)}</div><div class="matches">${items.map(matchCard).join('')}</div></section>`).join('');
}
function renderStandings(tables=[]){
 const box=$('standings');if(!tables.length){box.innerHTML='<div class="empty">As classificações publicadas no Studio aparecerão aqui.</div>';return}
 box.innerHTML=tables.map(table=>`<article class="standing-card"><div class="standing-head"><b>${esc(table.competition||table.name)}</b><small>${esc(table.name)}</small></div>${table.rows.slice(0,10).map(row=>`<div class="standing-row"><span class="pos">${row.position}</span><strong>${esc(row.clubName)}</strong><span class="pj">${row.played}J</span><span class="pts">${row.points}</span></div>`).join('')}</article>`).join('');
}
function renderNews(news=[]){
 const box=$('news');if(!news.length){box.innerHTML='<div class="empty">As notícias publicadas no Studio aparecerão aqui.</div>';return}
 box.innerHTML=news.map(item=>`<article class="news-card"><span>${esc(item.category||'RodriGol')}</span><h3>${esc(item.title)}</h3><p>${esc(item.summary||'')}</p></article>`).join('');
}
async function load(force=false){
 try{
   const response=await fetch(`/api/public/home?date=${today()}`,{cache:'no-store'});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const data=await response.json(),signature=JSON.stringify([data.revision,data.matches,data.standings,data.news]);
   if(force||signature!==lastSignature){lastSignature=signature;renderMatches(data.matches);renderStandings(data.standings);renderNews(data.news)}
 }catch(error){
   $('matchGroups').innerHTML=`<div class="empty">Portal aguardando conexão com o RodriGol Studio.</div>`;
   console.error(error);
 }
}
function tick(){const now=new Date();$('clock').textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});$('todayLabel').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
$('refresh').addEventListener('click',()=>load(true));tick();setInterval(tick,1000);load(true);setInterval(load,5000);
