import { apiRequest } from './apiClient.js';

/**
 * GET /api/health — used by connection badge.
 * Does not require auth (typically public health endpoint).
 */
export async function fetchHealth({ signal } = {}) {
  return apiRequest('/api/health', { signal, timeoutMs: 8000 });
}

/**
 * GET /api/admin/dashboard — aggregated stats.
 * Requires admin Firebase ID token.
 */
export async function fetchDashboard({ token, signal } = {}) {
  const data = await apiRequest('/api/admin/dashboard', { token, signal });
  // Defensive normalization — do NOT invent data.
  const src = data && typeof data === 'object' ? data : {};
  return {
    totalDevices: pickNumber(src, ['totalDevices', 'total_devices', 'devicesTotal']),
    onlineDevices: pickNumber(src, ['onlineDevices', 'online_devices', 'devicesOnline']),
    offlineDevices: pickNumber(src, ['offlineDevices', 'offline_devices', 'devicesOffline']),
    pendingInvitations: pickNumber(src, [
      'pendingInvitations',
      'pending_invitations',
      'invitationsPending',
    ]),
    raw: src,
  };
}

function pickNumber(src, keys) {
  for (const k of keys) {
    if (typeof src[k] === 'number' && Number.isFinite(src[k])) return src[k];
    if (typeof src[k] === 'string' && src[k].trim() !== '' && Number.isFinite(Number(src[k]))) {
      return Number(src[k]);
    }
  }
  return null; // Signal "not provided" rather than fake 0
}
