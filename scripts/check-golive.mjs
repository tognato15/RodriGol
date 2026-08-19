import {readFile} from "node:fs/promises";

const required=[
  "Dockerfile",
  "railway.json",
  ".env.production.example",
  "apps/obs-bridge/server.mjs"
];

for(const path of required){
  await readFile(new URL(`../${path}`,import.meta.url));
}

const server=await readFile(new URL("../apps/obs-bridge/server.mjs",import.meta.url),"utf8");
if(!server.includes("RODRIGOL_DATA_DIR"))throw new Error("RODRIGOL_DATA_DIR ausente");
if(!server.includes('"/health"'))throw new Error("Healthcheck /health ausente");
if(!server.includes("RODRIGOL_ADMIN_PASSWORD"))throw new Error("Proteção administrativa ausente");

console.log("RodriGol Go-Live 1: configuração de produção aprovada.");
