import { io } from 'socket.io-client';
import { socketUrl, isApiConfigured } from '../config/env.js';

/**
 * Singleton Socket.IO wrapper.
 * - Prevents duplicate connections.
 * - Uses exponential-ish backoff handled by socket.io-client (reconnectionAttempts unlimited but delay capped).
 * - Exposes subscribe functions that cleanup properly.
 */

let socket = null;
let refCount = 0;

function createSocket(token) {
  return io(socketUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity, // browser will cap practically
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0.5,
    timeout: 10000,
    auth: token ? { token } : {},
  });
}

/**
 * Acquire socket (connects if not connected). Returns existing if already acquired.
 * Each acquire MUST be matched with releaseSocket().
 */
export function acquireSocket({ token } = {}) {
  if (!isApiConfigured) {
    throw new Error('Socket tidak dapat dibuat: backend belum dikonfigurasi.');
  }
  if (socket) {
    // Update token if provided (server will enforce on next event)
    if (token) socket.auth = { token };
    refCount += 1;
    return socket;
  }
  socket = createSocket(token);
  refCount = 1;
  return socket;
}

export function releaseSocket() {
  refCount -= 1;
  if (refCount <= 0) {
    refCount = 0;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  }
}

export function getSocket() {
  return socket;
}
