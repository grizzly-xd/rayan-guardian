/**
 * Centralized environment access + validation.
 * Read-only, no side effects beyond reading import.meta.env.
 */

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

export const apiBaseUrl = stripTrailingSlash(readString(import.meta.env.VITE_API_BASE_URL));

export const socketUrl = stripTrailingSlash(
  readString(import.meta.env.VITE_SOCKET_URL) || apiBaseUrl
);

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

/**
 * Config warnings surfaced in UI — no silent fallback.
 */
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
        'Backend belum dikonfigurasi. Isi VITE_API_BASE_URL dengan URL backend Railway Anda.',
    });
  }
  return issues;
}
