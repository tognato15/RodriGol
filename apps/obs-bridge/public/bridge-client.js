import { bridgeApiUrl, bridgeWebSocketUrl, getRuntimeConfig, runtimeHeaders } from './runtime-config.js';

export class BridgeRequestError extends Error {
  constructor(message, status = 0, cause = null) { super(message); this.name = 'BridgeRequestError'; this.status = status; this.cause = cause; }
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
  return bridgeJson('/api/commands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export function publishCommands(commands = []) {
  const items = Array.isArray(commands) ? commands.filter(Boolean) : [];
  if (!items.length) return Promise.resolve({ ok: true, envelopes: [] });
  if (items.length === 1) return publishCommand(items[0]).then(result => ({ ...result, envelopes: result?.envelope ? [result.envelope] : [] }));
  return bridgeJson('/api/commands/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands: items }) });
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
      socket.addEventListener('open', event => { attempt = 0; lastMessageAt = Date.now(); status('connected'); onOpen?.(event, socket); });
      socket.addEventListener('message', event => { lastMessageAt = Date.now(); status('connected'); onMessage?.(event, socket); });
      socket.addEventListener('close', event => {
        onClose?.(event);
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
  const stop = () => { stopped = true; clearTimeout(timer); try { socket?.close(); } catch {} };
  addEventListener('rodrigol:runtime-config-changed', restart);
  connect();
  return { stop, restart, get socket(){ return socket; } };
}
