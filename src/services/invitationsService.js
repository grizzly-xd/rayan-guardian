import { apiRequest } from './apiClient.js';
import { isValidHttpUrl } from '../utils/validators.js';

/**
 * POST /api/devices/invitations
 * Body: { clientType: 'url' | 'apk', label?: string }
 * Response (expected, defensive): { invitation: { id, url, expiresAt, clientType }, ... }
 * We DO NOT fabricate URLs if backend does not return one.
 */
export async function createInvitation({ token, clientType, label, signal } = {}) {
  const body = { clientType };
  if (label && String(label).trim()) body.label = String(label).trim();

  const data = await apiRequest('/api/devices/invitations', {
    method: 'POST',
    body,
    token,
    signal,
  });

  const inv = data && typeof data === 'object' ? data.invitation || data : null;
  if (!inv || typeof inv !== 'object') {
    throw new Error('Respons pembuatan undangan tidak berisi data undangan.');
  }

  const url = inv.url || inv.invitationUrl || inv.invitation_url || null;
  if (!url || !isValidHttpUrl(url)) {
    throw new Error(
      'Backend tidak mengembalikan URL undangan yang valid. Tidak ada tautan yang dapat ditampilkan.'
    );
  }

  return {
    id: inv.id || inv.invitationId || inv.invitation_id || null,
    url,
    clientType: inv.clientType || inv.client_type || clientType,
    expiresAt: inv.expiresAt || inv.expires_at || null,
    label: inv.label || null,
    status: inv.status || 'pending',
    raw: inv,
  };
}
