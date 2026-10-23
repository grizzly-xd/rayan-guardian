import { io } from 'socket.io-client';
import { resolveSocketUrl } from '../config/apiConfig.js';

let socket = null;
let refCount = 0;

function createSocket(url, token) {
  return io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0.5,
    timeout: 10000,
    auth: token ? { token } : {},
  });
}

export function acquireSocket({ token } = {}) {
  const url = resolveSocketUrl();
  if (!url) throw new Error('Socket tidak dapat dibuat: backend belum dikonfigurasi.');
  if (socket) {
    if (token) socket.auth = { token };
    refCount += 1;
    return socket;
  }
  socket = createSocket(url, token);
  refCount = 1;
  return socket;
}

export function releaseSocket() {
  refCount -= 1;
  if (refCount <= 0) {
    refCount = 0;
    if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; }
  }
}
export function getSocket() { return socket; }
