import { apiRequest } from './apiClient.js';

/**
 * GET /api/devices — list devices.
 * Backend may return an array or { devices: [...] }. Handle both.
 */
export async function listDevices({ token, signal } = {}) {
  const data = await apiRequest('/api/devices', { token, signal });
  const arr = Array.isArray(data)
    ? data
    : data && Array.isArray(data.devices)
      ? data.devices
      : null;
  if (!arr) {
    throw new Error('Format respons /api/devices tidak dikenali.');
  }
  return arr.map(normalizeDevice).filter(Boolean);
}

/**
 * GET /api/devices/:id
 */
export async function getDevice(id, { token, signal } = {}) {
  const data = await apiRequest(`/api/devices/${encodeURIComponent(id)}`, {
    token,
    signal,
  });
  const item = data && typeof data === 'object' && data.device ? data.device : data;
  return normalizeDevice(item);
}

/**
 * POST /api/devices/:id/revoke
 */
export async function revokeDevice(id, { token, signal } = {}) {
  return apiRequest(`/api/devices/${encodeURIComponent(id)}/revoke`, {
    method: 'POST',
    token,
    signal,
  });
}

/**
 * DELETE /api/devices/:id
 */
export async function deleteDevice(id, { token, signal } = {}) {
  return apiRequest(`/api/devices/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
    signal,
  });
}

function normalizeDevice(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id || raw.deviceId || raw.device_id;
  if (!id) return null;
  return {
    id: String(id),
    name: raw.name || raw.label || raw.deviceName || 'Tanpa nama',
    clientType: raw.clientType || raw.client_type || raw.type || 'unknown',
    status: (raw.status || (raw.online === true ? 'online' : raw.online === false ? 'offline' : 'unknown')).toLowerCase(),
    lastSeenAt: raw.lastSeenAt || raw.last_seen_at || raw.lastSeen || null,
    pairedAt: raw.pairedAt || raw.paired_at || null,
    createdAt: raw.createdAt || raw.created_at || null,
    raw,
  };
}
