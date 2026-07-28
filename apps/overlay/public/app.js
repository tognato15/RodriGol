const REGION_IDS={scoreboard:"scoreboard",ticker:"ticker","lower-third":"lower-third","side-alert":"side-alert",headline:"headline",fullscreen:"fullscreen"};
const components=new Map(Object.entries(REGION_IDS).map(([region,id])=>[region,document.getElementById(id)]));
const timers=new Map();
const channel="BroadcastChannel" in window?new BroadcastChannel("rodrigol-overlay"):null;
let socket=null;let reconnectTimer=null;let reconnectAttempt=0;
const aliases={home:"homeShort",away:"awayShort",scoreHome:"homeScore",scoreAway:"awayScore",title:"headline",subtitle:"summary",message:"text"};
const state={ready:false,lastCommand:null,regions:Object.fromEntries([...components.keys()].map(region=>[region,{visible:components.get(region)?.classList.contains("is-visible")??false,payload:{}}]))};

function setConnection(status){const indicator=document.getElementById("connection");indicator?.classList.toggle("connected",status==="connected");indicator?.setAttribute("data-status",status);}
function setData(element,data={}){for(const [raw,value] of Object.entries(data)){const field=aliases[raw]??raw;const target=element.querySelector(`[data-field="${field}"]`);if(target&&value!==undefined&&value!==null)target.textContent=String(value);}if(element.id==="ticker")configureTicker(element);}
function configureTicker(element){const track=element.querySelector(".ticker-track");track.classList.remove("is-scrolling");void track.offsetWidth;if(track.scrollWidth>element.querySelector(".ticker-window").clientWidth)track.classList.add("is-scrolling");}
function clearTimer(region){const timer=timers.get(region);if(timer)clearTimeout(timer);timers.delete(region);}
function show(region,data,durationMs){const element=components.get(region);if(!element)return;setData(element,data);element.classList.add("is-visible");state.regions[region]={visible:true,payload:{...state.regions[region].payload,...data}};clearTimer(region);if(Number.isFinite(durationMs)&&durationMs>0)timers.set(region,setTimeout(()=>hide(region),durationMs));}
function update(region,data){const element=components.get(region);if(!element)return;setData(element,data);state.regions[region]={...state.regions[region],payload:{...state.regions[region].payload,...data}};}
function hide(region){const element=components.get(region);if(element)element.classList.remove("is-visible");if(state.regions[region])state.regions[region].visible=false;clearTimer(region);}
function clear(region){const element=components.get(region);if(!element)return;for(const target of element.querySelectorAll("[data-field]"))target.textContent="";state.regions[region]={visible:false,payload:{}};hide(region);}
function isCommand(value){return Boolean(value&&typeof value==="object"&&typeof value.type==="string");}
export function execute(command){if(!isCommand(command))return false;const {type,region,payload={},durationMs}=command;if(type==="clear-all"){for(const key of components.keys())clear(key);state.lastCommand=command;return true;}if(!components.has(region))return false;if(type==="show")show(region,payload,durationMs);else if(type==="update")update(region,payload);else if(type==="hide")hide(region);else if(type==="clear")clear(region);else return false;state.lastCommand=command;return true;}
function receive(event){const command=event?.data?.rodrigol??event?.data??event?.detail??event;if(execute(command))setConnection("connected");}
function socketUrl(){const protocol=location.protocol==="https:"?"wss:":"ws:";return `${protocol}//${location.host}/ws`;}
function scheduleReconnect(){clearTimeout(reconnectTimer);const delay=Math.min(1000*2**reconnectAttempt,10000);reconnectAttempt+=1;setConnection("standby");reconnectTimer=setTimeout(connectBridge,delay);}
function connectBridge(){if(socket&&(socket.readyState===WebSocket.OPEN||socket.readyState===WebSocket.CONNECTING))return;try{socket=new WebSocket(socketUrl());socket.addEventListener("open",()=>{reconnectAttempt=0;setConnection("connected");});socket.addEventListener("message",event=>{try{const message=JSON.parse(event.data);if(message.type==="command")receive(message.command);else if(message.type==="welcome"&&message.lastCommand?.command)receive(message.lastCommand.command);}catch{}});socket.addEventListener("close",scheduleReconnect);socket.addEventListener("error",()=>socket?.close());}catch{scheduleReconnect();}}
function snapshot(){return structuredClone?structuredClone(state):JSON.parse(JSON.stringify(state));}
function signalReady(){state.ready=true;setConnection("standby");const detail={app:"@rodrigol/browser-overlay",version:"0.2.0",regions:[...components.keys()]};window.dispatchEvent(new CustomEvent("rodrigol:overlay-ready",{detail}));window.parent?.postMessage?.({rodrigolOverlayReady:detail},"*");}

window.addEventListener("message",receive);
window.addEventListener("rodrigol:overlay",receive);
channel?.addEventListener("message",receive);
window.RodriGolOverlay=Object.freeze({
  execute,
  show:(region,payload,durationMs)=>execute({type:"show",region,payload,durationMs}),
  update:(region,payload)=>execute({type:"update",region,payload}),
  hide:(region)=>execute({type:"hide",region}),
  clearAll:()=>execute({type:"clear-all"}),
  snapshot
});

setInterval(()=>{const now=new Date();const target=document.querySelector('#ticker [data-field="time"]');if(target)target.textContent=now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});},1000);
window.addEventListener("resize",()=>configureTicker(document.getElementById("ticker")));

const params=new URLSearchParams(location.search);
if(params.get("background")==="test")document.documentElement.classList.add("test-background");
if(params.get("demo")==="1"){
  setTimeout(()=>show("lower-third",{eyebrow:"CAMPEONATO BRASILEIRO",headline:"Palmeiras x Flamengo",summary:"Cobertura ao vivo no RodriGol TV"}),500);
  setTimeout(()=>show("side-alert",{label:"GOL",headline:"PALMEIRAS 1 × 0",summary:"Vitor Roque, aos 32 minutos"},5000),1800);
}
connectBridge();
signalReady();
