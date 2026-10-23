import { apiBaseUrl, apiTimeoutMs, isApiConfigured } from '../config/env.js';
import {
  ApiConfigError,
  ApiError,
  ApiAbortError,
  ApiTimeoutError,
  mapHttpError,
} from '../utils/errors.js';

/**
 * Centralized fetch wrapper:
 *  - Injects Authorization header (Firebase ID token) if provided.
 *  - Uses AbortController with timeout.
 *  - Parses JSON safely.
 *  - Normalizes HTTP errors.
 *
 * Signature:
 *   request(path, { method, body, token, signal, timeoutMs, retryable })
 *
 * Return: parsed body (object/array) OR null for 204.
 */
export async function apiRequest(path, options = {}) {
  if (!isApiConfigured) {
    throw new ApiConfigError(
      'Backend belum dikonfigurasi. Isi VITE_API_BASE_URL.'
    );
  }
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new ApiError('Path API tidak valid.', { code: 'bad_path' });
  }

  const {
    method = 'GET',
    body,
    token,
    signal,
    timeoutMs = apiTimeoutMs,
    headers: extraHeaders,
    ...rest
  } = options;

  const url = `${apiBaseUrl}${path}`;
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => {
    if (!controller.signal.aborted) controller.abort(new DOMException('timeout', 'TimeoutError'));
  }, timeoutMs);

  const headers = {
    Accept: 'application/json',
    ...(extraHeaders || {}),
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: 'omit',
      mode: 'cors',
      ...rest,
    });
  } catch (err) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      // Distinguish user-abort vs timeout
      if (signal?.aborted) throw new ApiAbortError();
      throw new ApiTimeoutError();
    }
    throw new ApiError('Tidak dapat terhubung ke server.', {
      code: 'network_error',
      cause: err,
    });
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onExternalAbort);
  }

  // Parse body
  let payload = null;
  const contentType = res.headers.get('content-type') || '';
  if (res.status !== 204) {
    try {
      if (contentType.includes('application/json')) {
        payload = await res.json();
      } else {
        const text = await res.text();
        payload = text ? { raw: text } : null;
      }
    } catch (parseErr) {
      if (res.ok) {
        throw new ApiError('Respons server tidak dapat dibaca.', {
          code: 'parse_error',
          httpStatus: res.status,
          cause: parseErr,
        });
      }
      // Non-2xx with unparseable body → fall through to status mapping
    }
  }

  if (!res.ok) {
    const serverMessage =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) || null;
    throw mapHttpError(res.status, serverMessage);
  }

  return payload;
}
