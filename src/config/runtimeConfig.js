/**
 * Runtime API configuration.
 * - Base URL may come from build-time env OR from localStorage override.
 * - Override is user-chosen, clearly labeled, and NEVER contains secrets.
 * - Persisted under a single key so it can be cleared atomically.
 */

const STORAGE_KEY = 'rayan_guardian_api_config_v1';
const MODE_KEY = 'rayan_guardian_api_mode_v1';

export const API_MODES = Object.freeze({
  AUTO: 'auto',
  MANUAL: 'manual',
});

function safeParse(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  if (typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '');
}

export function isValidApiUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    // Disallow URL credentials or fragments — those hint at misuse.
    if (u.username || u.password) return false;
    if (u.hash) return false;
    return true;
  } catch {
    return false;
  }
}

/** Read saved manual override (or null if none). */
export function readSavedConfig() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  if (!parsed || !isValidApiUrl(parsed.apiBaseUrl)) return null;
  return {
    apiBaseUrl: normalizeUrl(parsed.apiBaseUrl),
    savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
  };
}

/** Read current mode: 'manual' only if both mode and valid config exist. */
export function readMode() {
  if (typeof window === 'undefined') return API_MODES.AUTO;
  const mode = window.localStorage.getItem(MODE_KEY);
  if (mode === API_MODES.MANUAL && readSavedConfig()) return API_MODES.MANUAL;
  return API_MODES.AUTO;
}

/** Persist manual config + switch to manual mode. */
export function saveManualConfig(apiBaseUrl) {
  if (!isValidApiUrl(apiBaseUrl)) {
    throw new Error('URL API tidak valid.');
  }
  const normalized = normalizeUrl(apiBaseUrl);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ apiBaseUrl: normalized, savedAt: new Date().toISOString() })
    );
    window.localStorage.setItem(MODE_KEY, API_MODES.MANUAL);
  }
  return { apiBaseUrl: normalized, savedAt: new Date().toISOString() };
}

/** Switch back to auto (env). Keeps saved manual value for future reactivation. */
export function revertToAuto() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MODE_KEY, API_MODES.AUTO);
  }
}

/** Clear manual config entirely. */
export function clearManualConfig() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(MODE_KEY);
  }
}
