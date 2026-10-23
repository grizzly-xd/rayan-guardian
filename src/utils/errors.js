/**
 * Uniform error shape for the UI.
 * { code, message, httpStatus? }
 */

export class ApiError extends Error {
  constructor(message, { code = 'api_error', httpStatus = null, cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.httpStatus = httpStatus;
    if (cause) this.cause = cause;
  }
}

export class ApiConfigError extends ApiError {
  constructor(message) {
    super(message, { code: 'api_not_configured' });
    this.name = 'ApiConfigError';
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message = 'Permintaan ke server melebihi waktu tunggu.') {
    super(message, { code: 'timeout' });
    this.name = 'ApiTimeoutError';
  }
}

export class ApiAbortError extends ApiError {
  constructor(message = 'Permintaan dibatalkan.') {
    super(message, { code: 'aborted' });
    this.name = 'ApiAbortError';
  }
}

/**
 * Map HTTP status → user-friendly Indonesian message + code.
 */
export function mapHttpError(status, serverMessage) {
  const fallback = serverMessage || defaultMessageForStatus(status);
  switch (status) {
    case 400:
      return new ApiError(fallback || 'Permintaan tidak valid.', {
        code: 'bad_request',
        httpStatus: 400,
      });
    case 401:
      return new ApiError(
        'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.',
        { code: 'unauthorized', httpStatus: 401 }
      );
    case 403:
      return new ApiError(
        'Akses ditolak. Akun Anda tidak memiliki izin admin.',
        { code: 'forbidden', httpStatus: 403 }
      );
    case 404:
      return new ApiError(fallback || 'Data tidak ditemukan.', {
        code: 'not_found',
        httpStatus: 404,
      });
    case 429:
      return new ApiError(
        'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.',
        { code: 'rate_limited', httpStatus: 429 }
      );
    default:
      if (status >= 500) {
        return new ApiError(
          'Server sedang bermasalah. Coba lagi nanti.',
          { code: 'server_error', httpStatus: status }
        );
      }
      return new ApiError(fallback || 'Terjadi kesalahan pada permintaan.', {
        code: 'unknown',
        httpStatus: status,
      });
  }
}

function defaultMessageForStatus(status) {
  if (status === 400) return 'Permintaan tidak valid.';
  if (status === 404) return 'Data tidak ditemukan.';
  return null;
}

export function toUserMessage(err) {
  if (!err) return 'Terjadi kesalahan tidak diketahui.';
  if (err instanceof ApiError) return err.message;
  if (typeof err.message === 'string' && err.message.length > 0) return err.message;
  return 'Terjadi kesalahan.';
}
