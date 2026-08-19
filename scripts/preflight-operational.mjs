import {spawnSync} from "node:child_process";
const npm=process.platform==="win32"?"npm.cmd":"npm";
const steps=[
  ["Bridge · check",["run","check","-w","@rodrigol/obs-bridge"]],
  ["Bridge · tests",["test","-w","@rodrigol/obs-bridge"]],
  ["Overlay · check",["run","check","-w","@rodrigol/overlay-studio"]],
  ["Overlay · tests",["test","-w","@rodrigol/overlay-studio"]],
  ["Overlay · build",["run","build","-w","@rodrigol/overlay-studio"]]
];
console.log("\nRODRIGOL STUDIO · PREFLIGHT OPERACIONAL\n");
for(const [label,args] of steps){
  console.log(`\n▶ ${label}`);
  const result=spawnSync(npm,args,{stdio:"inherit",shell:process.platform==="win32"});
  if(result.status!==0){
    console.error(`\n✖ PREFLIGHT INTERROMPIDO EM: ${label}`);
    process.exit(result.status||1);
  }
}
console.log("\n✓ PREFLIGHT OPERACIONAL APROVADO\n");

