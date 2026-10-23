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

/**
 * Provider must wrap app. If Firebase not configured, status='unconfigured'
 * and login attempt will throw a clear error.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(
    isFirebaseConfigured ? 'loading' : 'unconfigured'
  );
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
      });
      const t = await getCurrentIdToken();
      setToken(t);
      setStatus('signed_in');
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email, password) => {
    await signInAdmin(email, password);
    // onAuthStateChanged will update state.
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
    }),
    [user, token, status, signIn, signOutUser, resetPassword, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }
  return ctx;
}
