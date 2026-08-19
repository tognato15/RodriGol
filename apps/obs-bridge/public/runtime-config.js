const STORAGE_KEY = 'rodrigol-runtime-config-v2';
const LEGACY_KEY = 'rodrigol-runtime-config-v1';

function inferredDefaults() {
  const secure = location.protocol === 'https:';
  const origin = location.origin;
  const localHost=['localhost','127.0.0.1','::1'].includes(location.hostname);
  return {
    environment: localHost ? 'local' : 'production',
    mode: localHost ? 'local' : 'remote',
    bridgeHttp: origin,
    bridgeWs: `${secure ? 'wss:' : 'ws:'}//${location.host}/ws`,
    overlayUrl: `${origin}/studio/`,
    apiToken: '',
    requestTimeoutMs: 8000,
    reconnectMinMs: 1000,
    reconnectMaxMs: 15000,
    heartbeatTimeoutMs: 35000,
    remoteStorageEnabled: !localHost
  };
}

function safeJson(value) {
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}

function cleanUrl(value, fallback, ws = false) {
  const raw = String(value || fallback || '').trim();
  try {
    const url = new URL(raw, location.origin);
    if (ws && !['ws:', 'wss:'].includes(url.protocol)) url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (!ws && !['http:', 'https:'].includes(url.protocol)) url.protocol = location.protocol;
    return url.href.replace(/\/$/, '');
  } catch { return String(fallback || '').replace(/\/$/, ''); }
}

export function normalizeRuntimeConfig(input = {}) {
  const defaults = inferredDefaults();
  const environment = ['local','development','staging','production'].includes(input.environment) ? input.environment : (input.mode === 'remote' ? 'production' : defaults.environment);
  const bridgeHttp = cleanUrl(input.bridgeHttp, defaults.bridgeHttp);
  const bridgeWs = cleanUrl(input.bridgeWs, `${bridgeHttp.replace(/^http/, 'ws')}/ws`, true);
  return {
    ...defaults,
    ...input,
    environment,
    mode: environment === 'local' ? 'local' : 'remote',
    bridgeHttp,
    bridgeWs: bridgeWs.endsWith('/ws') ? bridgeWs : `${bridgeWs}/ws`,
    overlayUrl: cleanUrl(input.overlayUrl, `${bridgeHttp}/studio/`),
    apiToken: String(input.apiToken || ''),
    requestTimeoutMs: Math.max(1000, Number(input.requestTimeoutMs) || defaults.requestTimeoutMs),
    reconnectMinMs: Math.max(500, Number(input.reconnectMinMs) || defaults.reconnectMinMs),
    reconnectMaxMs: Math.max(2000, Number(input.reconnectMaxMs) || defaults.reconnectMaxMs),
    heartbeatTimeoutMs: Math.max(10000, Number(input.heartbeatTimeoutMs) || defaults.heartbeatTimeoutMs),
    remoteStorageEnabled: input.remoteStorageEnabled === true || input.remoteStorageEnabled === 'true'
  };
}

export function getRuntimeConfig() {
  const defaults = inferredDefaults();
  const legacy = safeJson(localStorage.getItem(LEGACY_KEY));
  const saved = safeJson(localStorage.getItem(STORAGE_KEY));
  const injected = globalThis.RODRIGOL_CONFIG || {};
  return normalizeRuntimeConfig({ ...defaults, ...legacy, ...saved, ...injected });
}

export function saveRuntimeConfig(value) {
  const normalized = normalizeRuntimeConfig(value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  localStorage.removeItem(LEGACY_KEY);
  globalThis.dispatchEvent(new CustomEvent('rodrigol:runtime-config-changed', { detail: normalized }));
  return normalized;
}

export function resetRuntimeConfig() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
  const normalized = normalizeRuntimeConfig();
  globalThis.dispatchEvent(new CustomEvent('rodrigol:runtime-config-changed', { detail: normalized }));
  return normalized;
}

export function bridgeApiUrl(path = '/') {
  const cfg = getRuntimeConfig();
  return new URL(path.replace(/^\//, ''), `${cfg.bridgeHttp}/`).href;
}

export function bridgeWebSocketUrl() {
  const cfg=getRuntimeConfig();
  if(!cfg.apiToken)return cfg.bridgeWs;
  const url=new URL(cfg.bridgeWs);
  url.searchParams.set('token',cfg.apiToken);
  return url.href;
}
export function runtimeHeaders(extra = {}) {
  const token = getRuntimeConfig().apiToken;
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
