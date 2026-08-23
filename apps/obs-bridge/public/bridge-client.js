import { bridgeApiUrl, bridgeWebSocketUrl, getRuntimeConfig, runtimeHeaders } from './runtime-config.js';

export class BridgeRequestError extends Error {
  constructor(message, status = 0, cause = null) { super(message); this.name = 'BridgeRequestError'; this.status = status; this.cause = cause; }
}

// Go-Live 1.6.4: o caminho operacional reutiliza um WebSocket já aberto pela página.
// Gol, fase e placar não precisam criar uma nova conexão HTTP/2 para cada clique.
const managedSockets = new Set();
const commandAckWaiters = new Map();
let commandRequestSequence = 0;

function socketTransport(){
  for (const socket of managedSockets) if (socket?.readyState === WebSocket.OPEN) return socket;
  return null;
}
function settleCommandAck(message = {}){
  if (message?.type !== 'command-ack' || !message.requestId) return false;
  const waiter = commandAckWaiters.get(message.requestId);
  if (!waiter) return true;
  commandAckWaiters.delete(message.requestId);
  clearTimeout(waiter.timer);
  if (message.ok === false) waiter.reject(new BridgeRequestError(message.error || 'Bridge rejeitou o comando.', Number(message.status)||0));
  else waiter.resolve(message);
  return true;
}
function observeSocketMessage(event){
  if (typeof event?.data !== 'string') return false;
  try { return settleCommandAck(JSON.parse(event.data)); } catch { return false; }
}
function publishViaSocket(type, payload){
  const socket = socketTransport();
  if (!socket) return null;
  const requestId = `op-${Date.now()}-${++commandRequestSequence}`;
  // A confirmação é observada em segundo plano. Para a interface, o envio para a
  // conexão persistente já é suficiente: nenhuma ação de operador espera RTT.
  try { socket.send(JSON.stringify({ type, requestId, ...payload })); }
  catch { return null; }
  const ack = new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{commandAckWaiters.delete(requestId);resolve({ok:true,transport:'websocket',requestId,ackTimeout:true});},2500);
    commandAckWaiters.set(requestId,{resolve,reject,timer});
  });
  ack.catch(()=>{});
  return Promise.resolve({ok:true,transport:'websocket',requestId,queued:true});
}

export async function bridgeFetch(path, options = {}) {
  const cfg = getRuntimeConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs) || cfg.requestTimeoutMs);
  try {
    const response = await fetch(bridgeApiUrl(path), {
      ...options,
      headers: runtimeHeaders(options.headers || {}),
      signal: options.signal || controller.signal,
      cache: options.cache || 'no-store',
      credentials: options.credentials || 'include'
    });
    return response;
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Tempo limite de conexão com o Bridge excedido.' : 'Não foi possível conectar ao Bridge.';
    throw new BridgeRequestError(message, 0, error);
  } finally { clearTimeout(timeout); }
}

export async function bridgeJson(path, options = {}) {
  const response = await bridgeFetch(path, options);
  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new BridgeRequestError(data?.error || `Bridge respondeu HTTP ${response.status}.`, response.status);
  return data;
}

export function publishCommand(body) {
  const socketResult = publishViaSocket('publish-command', { command: body });
  if (socketResult) return socketResult;
  return bridgeJson('/api/commands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

let batchInFlight = false;
let pendingBatch = null;
let batchCircuitUntil = 0;

function batchKey(command = {}, index = 0) {
  const region = String(command?.region || '').trim();
  return region ? `region:${region}` : `item:${index}:${String(command?.type || '')}`;
}

function mergeBatch(target, commands = []) {
  for (const [index, command] of commands.entries()) {
    if (!command) continue;
    target.set(batchKey(command, index), command);
  }
}

async function publishSequentially(commands = []) {
  const envelopes = [];
  for (const command of commands) {
    const result = await publishCommand(command);
    if (result?.envelope) envelopes.push(result.envelope);
  }
  return { ok: true, count: commands.length, envelopes, transport: 'sequential-fallback' };
}

async function sendBatchResilient(commands = []) {
  const socketResult = publishViaSocket('publish-commands', { commands });
  if (socketResult) return socketResult;
  if (Date.now() < batchCircuitUntil) return {ok:false,transport:'http-circuit-open',queued:false};
  try {
    return await bridgeJson('/api/commands/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
      timeoutMs: 5000
    });
  } catch (error) {
    // Sem WebSocket, uma falha de transporte abre o circuito. Não criamos uma
    // tempestade batch -> commands -> commands: o próximo estado substituirá o antigo.
    if (error instanceof BridgeRequestError && error.status === 0) {
      batchCircuitUntil = Date.now() + 30000;
      return {ok:false,transport:'http-failed',queued:false,error:error.message};
    }
    throw error;
  }
}

async function drainBatchQueue() {
  if (batchInFlight || !pendingBatch) return;
  const current = pendingBatch;
  pendingBatch = null;
  batchInFlight = true;
  try {
    const commands = [...current.commands.values()];
    const result = commands.length === 1
      ? await publishCommand(commands[0]).then(value => ({ ...value, count: 1, envelopes: value?.envelope ? [value.envelope] : [] }))
      : await sendBatchResilient(commands);
    current.waiters.forEach(({ resolve }) => resolve(result));
  } catch (error) {
    current.waiters.forEach(({ reject }) => reject(error));
  } finally {
    batchInFlight = false;
    if (pendingBatch) queueMicrotask(drainBatchQueue);
  }
}

export function publishCommands(commands = []) {
  const items = Array.isArray(commands) ? commands.filter(Boolean) : [];
  if (!items.length) return Promise.resolve({ ok: true, envelopes: [] });
  return new Promise((resolve, reject) => {
    if (!pendingBatch) pendingBatch = { commands: new Map(), waiters: [] };
    mergeBatch(pendingBatch.commands, items);
    pendingBatch.waiters.push({ resolve, reject });
    queueMicrotask(drainBatchQueue);
  });
}

export function readBridgeHealth() { return bridgeJson('/health'); }
export function readBridgeState() { return bridgeJson('/api/state'); }
export function readNetworkStatus() { return bridgeJson('/api/network'); }

export function createManagedSocket({ onOpen, onMessage, onClose, onStatus } = {}) {
  let socket = null, timer = null, stopped = false, attempt = 0, lastMessageAt = 0;
  const status = (state, detail = {}) => onStatus?.({ state, attempt, lastMessageAt, ...detail });
  const connect = () => {
    if (stopped) return;
    clearTimeout(timer);
    const cfg = getRuntimeConfig();
    status('connecting', { url: bridgeWebSocketUrl() });
    try {
      socket = new WebSocket(bridgeWebSocketUrl());
      socket.addEventListener('open', event => { managedSockets.add(socket); attempt = 0; lastMessageAt = Date.now(); status('connected'); onOpen?.(event, socket); });
      socket.addEventListener('message', event => { lastMessageAt = Date.now(); status('connected'); if (!observeSocketMessage(event)) onMessage?.(event, socket); });
      socket.addEventListener('close', event => {
        managedSockets.delete(socket); onClose?.(event);
        if (stopped) return;
        attempt += 1;
        const delay = Math.min(cfg.reconnectMaxMs, cfg.reconnectMinMs * (2 ** Math.min(attempt - 1, 5)));
        status('reconnecting', { delay });
        timer = setTimeout(connect, delay);
      });
      socket.addEventListener('error', () => socket?.close());
    } catch (error) {
      attempt += 1;
      const delay = Math.min(cfg.reconnectMaxMs, cfg.reconnectMinMs * (2 ** Math.min(attempt - 1, 5)));
      status('reconnecting', { delay, error });
      timer = setTimeout(connect, delay);
    }
  };
  const restart = () => { try { socket?.close(); } catch {} clearTimeout(timer); attempt = 0; stopped = false; connect(); };
  const stop = () => { stopped = true; clearTimeout(timer); managedSockets.delete(socket); try { socket?.close(); } catch {} };
  addEventListener('rodrigol:runtime-config-changed', restart);
  connect();
  return { stop, restart, get socket(){ return socket; } };
}
