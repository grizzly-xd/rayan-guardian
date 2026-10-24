import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../config/env.js';

let appInstance = null;
let authInstance = null;

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null;
  if (authInstance) return authInstance;
  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  authInstance = getAuth(appInstance);
  return authInstance;
}

export async function signInAdmin(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Konfigurasi Firebase belum tersedia. Tidak dapat login.');
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
  if (!auth) throw new Error('Konfigurasi Firebase belum tersedia.');
  await sendPasswordResetEmail(auth, email);
}

export function subscribeAuthState(callback) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentIdToken() {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (err) {
    console.warn('Gagal mengambil ID token:', err?.code || err?.message);
    return null;
  }
}

export async function updateDisplayName(name) {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) throw new Error('Tidak ada user aktif.');
  await updateProfile(auth.currentUser, { displayName: name });
  // Force refresh so onAuthStateChanged gets the new profile.
  await auth.currentUser.reload();
  // Notify listeners by returning the refreshed profile.
  return auth.currentUser;
}

export async function updateEmailIfChanged(newEmail) {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) throw new Error('Tidak ada user aktif.');
  if (auth.currentUser.email === newEmail) return auth.currentUser;
  await updateEmail(auth.currentUser, newEmail);
  return auth.currentUser;
}
