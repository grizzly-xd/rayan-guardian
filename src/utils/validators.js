/** Basic, reusable validators — pure functions (testable). */

export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  // Simple RFC-ish check, suitable for client-side hint only.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmptyString(value, { min = 1, max = 2048 } = {}) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v.length >= min && v.length <= max;
}

export function isValidId(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v.length > 0 && v.length <= 128 && /^[A-Za-z0-9_\-:.]+$/.test(v);
}

export function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate login form values. Returns an object of field→error message.
 * Empty object = valid.
 */
export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isNonEmptyString(email)) {
    errors.email = 'Email wajib diisi.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Format email tidak valid.';
  }
  if (typeof password !== 'string' || password.length < 1) {
    errors.password = 'Password wajib diisi.';
  } else if (password.length < 6) {
    errors.password = 'Password minimal 6 karakter.';
  }
  return errors;
}

export function validateResetForm({ email }) {
  const errors = {};
  if (!isNonEmptyString(email)) {
    errors.email = 'Email wajib diisi.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Format email tidak valid.';
  }
  return errors;
}

/**
 * Validate label/notes for invitation creation.
 */
export function validateInvitationForm({ label, clientType }) {
  const errors = {};
  if (!['url', 'apk'].includes(clientType)) {
    errors.clientType = 'Tipe client tidak valid.';
  }
  if (label != null && label.length > 120) {
    errors.label = 'Label maksimal 120 karakter.';
  }
  return errors;
}
