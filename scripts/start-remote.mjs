process.env.HOST=process.env.HOST||"0.0.0.0";
process.env.RODRIGOL_ENV=process.env.RODRIGOL_ENV||"production";
if(!process.env.RODRIGOL_ADMIN_PASSWORD&&!["true","1"].includes(String(process.env.RODRIGOL_ALLOW_INSECURE_REMOTE||"").toLowerCase())){
  console.error("\nRODRIGOL STUDIO · ACESSO REMOTO BLOQUEADO");
  console.error("Defina RODRIGOL_ADMIN_PASSWORD antes de iniciar o servidor remoto.\n");
  process.exit(1);
}
await import("../apps/obs-bridge/server.mjs");
