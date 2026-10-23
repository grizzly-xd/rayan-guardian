import { apiRequest } from './apiClient.js';

/**
 * GET /api/activity-logs
 * Optional query: { limit, cursor } — validated caller-side.
 */
export async function listActivityLogs({ token, signal, limit = 50 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const data = await apiRequest(`/api/activity-logs?limit=${safeLimit}`, {
    token,
    signal,
  });
  const arr = Array.isArray(data)
    ? data
    : data && Array.isArray(data.logs)
      ? data.logs
      : null;
  if (!arr) {
    throw new Error('Format respons /api/activity-logs tidak dikenali.');
  }
  return arr
    .filter((l) => l && typeof l === 'object')
    .map((l) => ({
      id: String(l.id || l._id || `${l.timestamp || ''}-${Math.random().toString(36).slice(2, 8)}`),
      type: l.type || l.event || 'unknown',
      message: l.message || l.description || '',
      actor: l.actor || l.actorEmail || null,
      deviceId: l.deviceId || l.device_id || null,
      timestamp: l.timestamp || l.createdAt || l.created_at || null,
      raw: l,
    }));
}
