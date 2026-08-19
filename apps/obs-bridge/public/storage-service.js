import { bridgeJson } from './bridge-client.js';
import { getRuntimeConfig } from './runtime-config.js';

export const storageService = {
  get(key, fallback = null) {
    try { const value = localStorage.getItem(key); return value == null ? fallback : JSON.parse(value); } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; },
  remove(key) { localStorage.removeItem(key); },
  async pull(namespace = 'default') {
    if (!getRuntimeConfig().remoteStorageEnabled) return null;
    return bridgeJson(`/api/storage/${encodeURIComponent(namespace)}`);
  },
  async push(namespace = 'default', payload = {}) {
    if (!getRuntimeConfig().remoteStorageEnabled) return { ok: false, skipped: true };
    return bridgeJson(`/api/storage/${encodeURIComponent(namespace)}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  }
};
