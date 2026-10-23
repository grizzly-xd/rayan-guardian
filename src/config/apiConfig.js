/**
 * Runtime API base URL resolution.
 *
 * Sumber (prioritas tertinggi → terendah):
 *  1. localStorage override (mode manual) — disimpan user via UI
 *  2. Env build-time (VITE_API_BASE_URL) — mode otomatis
 *
 * Konfigurasi TIDAK berisi rahasia. Hanya base URL publik.
 * Semua request API tetap memakai Firebase ID token via Authorization header.
 *
 * Batasan: env build-time di-bake saat `vite build`.
 * Perubahan env memerlukan redeploy Vercel. Runtime override menghindari ini.
 */

import { apiBaseUrl as envApiBaseUrl, socketUrl as envSocketUrl } from './env.js';

const STORAGE_KEY = 'rg.api.override.v1';
const STORAGE_MODE_KEY = 'rg.api.mode.v1';

const MODE_AUTO = 'auto';
const MODE_MANUAL = 'manual';

/**
 * @typedef {{ url: string, savedAt: number, lastCheckAt: number | null, lastCheckOk: boolean | null, lastCheckMessage: string | null }} OverrideConfig
 */

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? v : fallback;
  } catch {
    return fallback;
  }
}

export function getMode() {
  try {
    const m = localStorage.getItem(STORAGE_MODE_KEY);
    return m === MODE_MANUAL ? MODE_MANUAL : MODE_AUTO;
  } catch {
    return MODE_AUTO;
  }
}

export function setMode(mode) {
  try {
    if (mode === MODE_MANUAL) {
      localStorage.setItem(STORAGE_MODE_KEY, MODE_MANUAL);
    } else {
      localStorage.removeItem(STORAGE_MODE_KEY);
    }
  } catch {
    /* localStorage bisa diblok (private mode) — abaikan, fallback ke auto */
  }
}

/** @returns {OverrideConfig | null} */
export function getOverride() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw, null);
    if (!parsed || typeof parsed.url !== 'string') return null;
    return {
      url: parsed.url,
      savedAt: Number(parsed.savedAt) || 0,
      lastCheckAt: parsed.lastCheckAt ? Number(parsed.lastCheckAt) : null,
      lastCheckOk: typeof parsed.lastCheckOk === 'boolean' ? parsed.lastCheckOk : null,
      lastCheckMessage:
        typeof parsed.lastCheckMessage === 'string' ? parsed.lastCheckMessage : null,
    };
  } catch {
    return null;
  }
}

export function setOverride(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    throw new Error(
      'Tidak dapat menyimpan konfigurasi di browser (localStorage mungkin diblok).'
    );
  }
}

export function clearOverride() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_MODE_KEY);
  } catch {
    /* noop */
  }
}

export function updateOverrideCheck({ ok, message, at = Date.now() }) {
  const current = getOverride();
  if (!current) return;
  setOverride({
    ...current,
    lastCheckAt: at,
    lastCheckOk: ok,
    lastCheckMessage: message,
  });
}

/** Validator: url harus http(s), tanpa trailing slash, tanpa kredensial. */
export function validateApiUrl(input) {
  if (typeof input !== 'string' || !input.trim()) {
    return { ok: false, message: 'URL API wajib diisi.' };
  }
  let u;
  try {
    u = new URL(input.trim());
  } catch {
    return { ok: false, message: 'Format URL tidak valid.' };
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { ok: false, message: 'URL harus menggunakan http:// atau https://.' };
  }
  if (u.username || u.password) {
    return { ok: false, message: 'URL tidak boleh mengandung kredensial (user:pass@).' };
  }
  const normalized = `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, '')}`;
  return { ok: true, normalized };
}

/**
 * Resolve base URL effective.
 * @returns {{ url: string, source: 'manual' | 'auto' | 'none' }}
 */
export function resolveApiBaseUrl() {
  const mode = getMode();
  const override = getOverride();
  if (mode === MODE_MANUAL && override && validateApiUrl(override.url).ok) {
    return { url: validateApiUrl(override.url).normalized, source: 'manual' };
  }
  if (envApiBaseUrl) {
    return { url: envApiBaseUrl, source: 'auto' };
  }
  return { url: '', source: 'none' };
}

/** Socket URL: jika manual override aktif, pakai itu. Jika auto, pakai envSocketUrl atau fallback envApiBaseUrl. */
export function resolveSocketUrl() {
  const { url, source } = resolveApiBaseUrl();
  if (source === 'manual') return url;
  return envSocketUrl || envApiBaseUrl;
}

/** Probe /api/health — dipakai oleh tombol "Tes Koneksi". */
export async function testApiConnection(baseUrl, { signal } = {}) {
  const v = validateApiUrl(baseUrl);
  if (!v.ok) {
    return { ok: false, message: v.message, checkedAt: Date.now() };
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${v.normalized}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `Server merespons HTTP ${res.status}.`,
        checkedAt: Date.now(),
      };
    }
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* body kosong tidak fatal */
    }
    const service =
      body && typeof body === 'object' && typeof body.service === 'string'
        ? body.service
        : null;
    return {
      ok: true,
      message: service ? `Terhubung ke ${service}.` : 'Terhubung ke server.',
      checkedAt: Date.now(),
    };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { ok: false, message: 'Permintaan melebihi waktu tunggu (timeout).', checkedAt: Date.now() };
    }
    return {
      ok: false,
      message:
        'Tidak dapat terhubung ke server. Periksa URL, koneksi internet, dan CORS backend.',
      checkedAt: Date.now(),
    };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

export const CONFIG_MODES = { AUTO: MODE_AUTO, MANUAL: MODE_MANUAL };
