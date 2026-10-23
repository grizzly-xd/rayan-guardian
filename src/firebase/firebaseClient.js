import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../config/env.js';

let appInstance = null;
let authInstance = null;

/**
 * Lazily initialize Firebase. Returns null if config is incomplete —
 * callers MUST handle this gracefully (no fake login).
 */
export function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null;
  if (authInstance) return authInstance;

  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  authInstance = getAuth(appInstance);
  return authInstance;
}

/**
 * Login with email/password. Throws on failure or config missing.
 */
export async function signInAdmin(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Konfigurasi Firebase belum tersedia. Tidak dapat login.'
    );
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutAdmin() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export async function sendPasswordReset(email) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum tersedia.');
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to Firebase auth state. Returns unsubscribe fn.
 * If Firebase not configured, calls callback(null) once and returns a no-op.
 */
export function subscribeAuthState(callback) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current ID token (auto-refresh). Returns null if not logged in / not configured.
 */
export async function getCurrentIdToken() {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (err) {
    // Token refresh can fail e.g. if user was disabled.
    console.warn('Gagal mengambil ID token:', err?.code || err?.message);
    return null;
  }
}
