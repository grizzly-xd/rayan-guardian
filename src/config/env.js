import { readMode, readSavedConfig, API_MODES } from './runtimeConfig.js';

function readString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function readNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}

const buildApiBaseUrl = stripTrailingSlash(readString(import.meta.env.VITE_API_BASE_URL));
const buildSocketUrl = stripTrailingSlash(
  readString(import.meta.env.VITE_SOCKET_URL) || buildApiBaseUrl
);

/**
 * Resolve effective config — respects manual override if set.
 * Called at module load for the initial value, and via `getEffectiveConfig()`
 * to read the latest value after user changes it (requires page reload).
 */
function resolveEffective() {
  const mode = readMode();
  if (mode === API_MODES.MANUAL) {
    const saved = readSavedConfig();
    if (saved) {
      return {
        apiBaseUrl: saved.apiBaseUrl,
        socketUrl: saved.apiBaseUrl,
        source: 'manual',
        savedAt: saved.savedAt,
      };
    }
  }
  return {
    apiBaseUrl: buildApiBaseUrl,
    socketUrl: buildSocketUrl,
    source: 'auto',
    savedAt: null,
  };
}

const effective = resolveEffective();

export const apiBaseUrl = effective.apiBaseUrl;
export const socketUrl = effective.socketUrl;
export const apiConfigSource = effective.source;
export const apiConfigSavedAt = effective.savedAt;

export const apiTimeoutMs = readNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000);

export const firebaseConfig = {
  apiKey: readString(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: readString(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: readString(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: readString(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readString(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: readString(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const isApiConfigured = Boolean(apiBaseUrl);

/** For UI display: what URL the app is currently talking to. */
export function getEffectiveConfig() {
  const e = resolveEffective();
  return {
    apiBaseUrl: e.apiBaseUrl,
    socketUrl: e.socketUrl,
    source: e.source,
    savedAt: e.savedAt,
    buildTimeUrl: buildApiBaseUrl,
  };
}

export function getConfigIssues() {
  const issues = [];
  if (!isFirebaseConfigured) {
    issues.push({
      key: 'firebase',
      message:
        'Konfigurasi Firebase belum lengkap. Isi VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, dan VITE_FIREBASE_APP_ID.',
    });
  }
  if (!isApiConfigured) {
    issues.push({
      key: 'api',
      message:
        'Backend belum dikonfigurasi. Isi VITE_API_BASE_URL atau gunakan Konfigurasi API manual.',
    });
  }
  return issues;
}
