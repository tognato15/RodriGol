import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const bridgeRoot=fileURLToPath(new URL("./public/",import.meta.url));
const overlayRoot=fileURLToPath(new URL("../overlay/dist/",import.meta.url));
const port=Number(process.env.PORT??4173);
const host=process.env.HOST??"127.0.0.1";
const clients=new Set();
let sequence=0;
let lastCommand=null;
const regionState=new Map();
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml; charset=utf-8"};

function json(response,status,body){response.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});response.end(JSON.stringify(body));}
function redirect(response,location){response.writeHead(308,{Location:location,"Cache-Control":"no-store"});response.end();}
function frameText(text){const payload=Buffer.from(text);if(payload.length<126)return Buffer.concat([Buffer.from([0x81,payload.length]),payload]);if(payload.length<65536){const head=Buffer.alloc(4);head[0]=0x81;head[1]=126;head.writeUInt16BE(payload.length,2);return Buffer.concat([head,payload]);}const head=Buffer.alloc(10);head[0]=0x81;head[1]=127;head.writeBigUInt64BE(BigInt(payload.length),2);return Buffer.concat([head,payload]);}
function framePing(){return Buffer.from([0x89,0x00]);}
function send(socket,message){if(!socket.destroyed)socket.write(frameText(JSON.stringify(message)));}
function applyToState(command){
  if(command.type==="clear-all"){regionState.clear();return;}
  const current=regionState.get(command.region)??{visible:false,payload:{}};
  if(command.type==="clear"){regionState.set(command.region,{visible:false,payload:{}});return;}
  if(command.type==="hide"){regionState.set(command.region,{...current,visible:false});return;}
  const payload={...current.payload,...(command.payload??{})};
  regionState.set(command.region,{visible:command.type==="show"?true:current.visible,payload});
}
function stateSnapshot(){return Object.fromEntries(regionState.entries());}
function broadcast(command,source="api"){applyToState(command);const envelope={type:"command",sequence:++sequence,source,sentAt:new Date().toISOString(),command};lastCommand=envelope;for(const socket of clients)send(socket,envelope);return envelope;}
function validCommand(value){if(!value||typeof value!=="object"||typeof value.type!=="string")return false;if(value.type==="clear-all")return true;return typeof value.region==="string"&&["show","update","hide","clear"].includes(value.type);}
async function readBody(request){const chunks=[];let size=0;for await(const chunk of request){chunks.push(chunk);size+=chunk.length;if(size>1_000_000)throw new Error("Payload muito grande");}return Buffer.concat(chunks).toString("utf8");}
async function serve(root,pathname,response){const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");const target=normalize(join(root,relative));if(!target.startsWith(root)){response.writeHead(403,{"Content-Type":"text/plain; charset=utf-8"});response.end("Forbidden");return;}try{const info=await stat(target);const file=info.isDirectory()?join(target,"index.html"):target;const body=await readFile(file);response.writeHead(200,{"Content-Type":types[extname(file)]??"application/octet-stream","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});response.end(body);}catch{response.writeHead(404,{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"});response.end("Arquivo não encontrado");}}

const server=createServer(async(request,response)=>{
  const url=new URL(request.url??"/",`http://${host}`);const pathname=decodeURIComponent(url.pathname);
  if(request.method==="OPTIONS"){response.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});response.end();return;}
  if(pathname==="/health"){json(response,200,{status:"ok",app:"@rodrigol/obs-bridge",version:"0.4.4",connections:clients.size,sequence});return;}
  if(pathname==="/api/state"){json(response,200,{connections:clients.size,sequence,lastCommand,regions:stateSnapshot()});return;}
  if(pathname==="/api/commands"&&request.method==="POST"){
    try{const command=JSON.parse(await readBody(request));if(!validCommand(command)){json(response,400,{ok:false,error:"Comando de overlay inválido."});return;}const envelope=broadcast(command,"api");json(response,202,{ok:true,envelope});}catch(error){json(response,400,{ok:false,error:error instanceof Error?error.message:"JSON inválido"});}return;
  }
  if(pathname==="/control"){redirect(response,"/control/");return;}
  if(["/control/multicabine","/multicabine","/multicabine.html"].includes(pathname)){redirect(response,"/control/multicabine.html");return;}
  if(pathname==="/control/central"){redirect(response,"/control/central.html");return;}
  if(pathname.startsWith("/control/")){await serve(bridgeRoot,pathname.slice(8),response);return;}
  const overlayPath=pathname==="/favicon.ico"?"/assets/favicon.svg":pathname;await serve(overlayRoot,overlayPath,response);
});

server.on("upgrade",(request,socket)=>{
  const url=new URL(request.url??"/",`http://${host}`);if(url.pathname!=="/ws"){socket.destroy();return;}
  const key=request.headers["sec-websocket-key"];if(typeof key!=="string"){socket.destroy();return;}
  const accept=createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write(["HTTP/1.1 101 Switching Protocols","Upgrade: websocket","Connection: Upgrade",`Sec-WebSocket-Accept: ${accept}`,"\r\n"].join("\r\n"));
  clients.add(socket);send(socket,{type:"welcome",version:"0.4.4",sequence,lastCommand,regions:stateSnapshot()});
  socket.on("close",()=>clients.delete(socket));socket.on("error",()=>clients.delete(socket));
  socket.on("data",buffer=>{if((buffer[0]&0x0f)===0x8){clients.delete(socket);socket.end();}});
});

const heartbeat=setInterval(()=>{for(const socket of clients){if(socket.destroyed)clients.delete(socket);else socket.write(framePing());}},15000);heartbeat.unref();
server.listen(port,host,()=>{console.log("");console.log("RodriGol OBS Bridge iniciado com sucesso.");console.log(`Overlay/OBS: http://${host}:${port}`);console.log(`Controle:    http://${host}:${port}/control/`);console.log(`WebSocket:   ws://${host}:${port}/ws`);console.log(`Diagnóstico: http://${host}:${port}/health`);console.log("Pressione Ctrl+C para encerrar.\n");});
