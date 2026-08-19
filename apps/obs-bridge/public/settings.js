import { getRuntimeConfig, resetRuntimeConfig, saveRuntimeConfig } from './runtime-config.js';
import { readBridgeHealth, readNetworkStatus } from './bridge-client.js';
const $=id=>document.getElementById(id);
const fields=['environment','bridgeHttp','bridgeWs','overlayUrl','apiToken','requestTimeoutMs','reconnectMinMs','reconnectMaxMs'];
function fill(value=getRuntimeConfig()){for(const id of fields)$(id).value=value[id]??'';$('remoteStorageEnabled').checked=Boolean(value.remoteStorageEnabled)}
$('form').onsubmit=e=>{e.preventDefault();const value=Object.fromEntries(fields.map(id=>[id,$(id).value.trim()]));value.remoteStorageEnabled=$('remoteStorageEnabled').checked;saveRuntimeConfig(value);fill();$('message').textContent='Configuração salva e aplicada às conexões gerenciadas.'};
$('reset').onclick=()=>{fill(resetRuntimeConfig());$('message').textContent='Configuração local restaurada.'};
$('test').onclick=async()=>{try{saveRuntimeConfig({...getRuntimeConfig(),...Object.fromEntries(fields.map(id=>[id,$(id).value.trim()]))});const [health,network]=await Promise.all([readBridgeHealth(),readNetworkStatus()]);$('message').textContent=`Bridge ${health.version} online · ${health.connections||0} overlay(s) · ambiente ${network.environment||'local'} · ${network.hostname||'host local'}.`;}catch(error){$('message').textContent=error.message||'Não foi possível acessar o Bridge informado.'}};
fill();
