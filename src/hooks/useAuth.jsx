import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  subscribeAuthState,
  signInAdmin,
  signOutAdmin,
  sendPasswordReset,
  getCurrentIdToken,
} from '../firebase/firebaseClient.js';
import { isFirebaseConfigured } from '../config/env.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'unconfigured');
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('unconfigured');
      return undefined;
    }
    const unsub = subscribeAuthState(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setToken(null);
        setStatus('signed_out');
        return;
      }
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      const t = await getCurrentIdToken();
      setToken(t);
      setStatus('signed_in');
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email, password) => {
    await signInAdmin(email, password);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOutAdmin();
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordReset(email);
  }, []);

  const refreshToken = useCallback(async () => {
    const t = await getCurrentIdToken();
    setToken(t);
    return t;
  }, []);

  /** Called after profile update — re-read current user snapshot. */
  const refreshUser = useCallback(() => {
    // onAuthStateChanged fires on reload(); nothing to do here unless the
    // caller wants an immediate refresh. Firebase auto-refreshes profile
    // after updateProfile, so onAuthStateChanged will re-fire.
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isFirebaseConfigured,
      signIn,
      signOut: signOutUser,
      resetPassword,
      refreshToken,
      refreshUser,
    }),
    [user, token, status, signIn, signOutUser, resetPassword, refreshToken, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}
