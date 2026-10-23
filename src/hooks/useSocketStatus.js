import { useEffect, useRef, useState } from 'react';
import { acquireSocket, releaseSocket } from '../services/socketService.js';
import { isApiConfigured } from '../config/env.js';

/**
 * Manages a single socket lifecycle for a component tree.
 * Returns connection state and event subscription helper.
 */
export function useSocketStatus(token) {
  const [status, setStatus] = useState(
    isApiConfigured ? 'connecting' : 'unavailable'
  );
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isApiConfigured) {
      setStatus('unavailable');
      return undefined;
    }
    let s;
    try {
      s = acquireSocket({ token });
    } catch (err) {
      setStatus('unavailable');
      setError(err);
      return undefined;
    }
    socketRef.current = s;

    const onConnect = () => {
      setStatus('connected');
      setError(null);
    };
    const onDisconnect = (reason) => {
      setStatus(reason === 'io client disconnect' ? 'disconnected' : 'reconnecting');
    };
    const onReconnectAttempt = () => setStatus('reconnecting');
    const onReconnectFailed = () => setStatus('disconnected');
    const onConnectError = (err) => {
      setError(err);
      setStatus('reconnecting');
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.io.on('reconnect_attempt', onReconnectAttempt);
    s.io.on('reconnect_failed', onReconnectFailed);
    s.on('connect_error', onConnectError);

    // If already connected when we acquired:
    if (s.connected) {
      setStatus('connected');
    } else {
      setStatus('connecting');
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.io.off('reconnect_attempt', onReconnectAttempt);
      s.io.off('reconnect_failed', onReconnectFailed);
      s.off('connect_error', onConnectError);
      releaseSocket();
      socketRef.current = null;
    };
  }, [token]);

  return { status, error, socket: socketRef };
}
