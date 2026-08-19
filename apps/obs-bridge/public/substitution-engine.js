function clean(value=''){return String(value||'').trim();}
function playerList(value){
  const source=Array.isArray(value)?value:[value];
  return source.flatMap(item=>{
    if(item&&typeof item==='object')return [clean(item.name||item.player||item.label||item.fullName||'')];
    return String(item||'').split(/\r?\n|;\s*|,\s*(?=\d{1,3}(?:[.\s]|$)|[A-ZÀ-Ý])/).map(clean);
  }).filter(Boolean);
}
function ensureSide(lineup={}){
  const starters=playerList(lineup.starters??lineup.startingXI??lineup.startingPlayers??lineup.lineup??[]);
  const bench=playerList(lineup.bench??lineup.reserves??lineup.substitutes??lineup.subs??[]);
  const substitutions=Array.isArray(lineup.substitutions)?lineup.substitutions.map(item=>({...item})):[];
  const parsedOnField=playerList(lineup.onField);const onField=parsedOnField.length?parsedOnField:starters.slice();
  return {...lineup,starters,bench,onField,substitutions};
}
export function normalizeOperationalLineups(lineups={}){
  return {home:ensureSide(lineups.home||{}),away:ensureSide(lineups.away||{})};
}
export function substitutionOptions(lineups={},team='HOME'){
  const normalized=normalizeOperationalLineups(lineups);
  const side=team==='AWAY'?normalized.away:normalized.home;
  const entered=new Set(side.substitutions.map(item=>clean(item.in)).filter(Boolean));
  const out=new Set(side.substitutions.map(item=>clean(item.out)).filter(Boolean));
  return {
    outPlayers:side.onField.slice(),
    inPlayers:side.bench.filter(player=>!entered.has(player)&&!side.onField.includes(player)),
    enteredPlayers:[...entered],
    substitutedOut:[...out]
  };
}
export function applySubstitution(lineups={},team='HOME',outPlayer='',inPlayer='',meta={}){
  const normalized=normalizeOperationalLineups(lineups);
  const key=team==='AWAY'?'away':'home',side={...normalized[key]};
  const outgoing=clean(outPlayer),incoming=clean(inPlayer);
  if(!outgoing||!incoming)throw new Error('Selecione quem sai e quem entra.');
  if(outgoing===incoming)throw new Error('O jogador que entra deve ser diferente do jogador que sai.');
  const outIndex=side.onField.indexOf(outgoing);
  if(outIndex<0)throw new Error(`${outgoing} não está marcado como jogador em campo.`);
  const options=substitutionOptions(normalized,team);
  if(!options.inPlayers.includes(incoming))throw new Error(`${incoming} não está disponível no banco para entrar.`);
  side.onField=side.onField.slice();
  side.onField[outIndex]=incoming;
  side.substitutions=[
    {id:meta.id||'',minute:Number(meta.minute)||0,out:outgoing,in:incoming,createdAt:meta.createdAt||new Date().toISOString()},
    ...side.substitutions
  ];
  return {...normalized,[key]:side};
}
export function rebuildOperationalLineups(lineups={},events=[]){
  const base=normalizeOperationalLineups({
    home:{...(lineups.home||{}),onField:(lineups.home?.starters||[]).slice(),substitutions:[]},
    away:{...(lineups.away||{}),onField:(lineups.away?.starters||[]).slice(),substitutions:[]}
  });
  let result=base;
  const substitutions=(Array.isArray(events)?events:[])
    .filter(event=>String(event.type||'').toUpperCase()==='SUBSTITUTION'&&event.substitutionOut&&event.substitutionIn)
    .slice().reverse();
  for(const event of substitutions){
    try{
      result=applySubstitution(result,event.team,event.substitutionOut,event.substitutionIn,event);
    }catch{}
  }
  return result;
}
export function substitutionText(event={}){
  const incoming=clean(event.substitutionIn),outgoing=clean(event.substitutionOut);
  return [incoming?`ENTRA ${incoming}`:'',outgoing?`SAI ${outgoing}`:''].filter(Boolean).join(' · ');
}
