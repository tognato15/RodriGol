import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const appRoot=path.resolve(here,'..');
const publicDir=path.join(appRoot,'public');
let failed=false;

for(const file of ['server.mjs', ...(await readdir(publicDir)).filter(name=>name.endsWith('.js')).map(name=>`public/${name}`)]){
  const result=spawnSync(process.execPath,['--check',path.join(appRoot,file)],{encoding:'utf8'});
  if(result.status!==0){failed=true;console.error(`\n[syntax] ${file}\n${result.stderr||result.stdout}`)}
}

const htmlFiles=(await readdir(publicDir)).filter(name=>name.endsWith('.html'));
for(const file of htmlFiles){
  const html=await readFile(path.join(publicDir,file),'utf8');
  const missing=[];
  if(!html.includes('global-nav.css')) missing.push('global-nav.css');
  if(!html.includes('global-nav.js')) missing.push('global-nav.js');
  if(!html.includes('design-system.css')) missing.push('design-system.css');
  if(!html.includes('admin-consolidation.css')) missing.push('admin-consolidation.css');
  if(missing.length){failed=true;console.error(`[admin-shell] ${file}: faltando ${missing.join(', ')}`)}
}

if(failed) process.exit(1);
console.log(`OK: sintaxe de todos os JS públicos + shell visual de ${htmlFiles.length} telas administrativas.`);
