import { apiTimeoutMs, getEffectiveConfig, isApiConfigured } from '../config/env.js';
import {
  ApiConfigError,
  ApiError,
  ApiAbortError,
  ApiTimeoutError,
  mapHttpError,
} from '../utils/errors.js';

export async function apiRequest(path, options = {}) {
  const cfg = getEffectiveConfig();
  if (!isApiConfigured && !cfg.apiBaseUrl) {
    throw new ApiConfigError('Backend belum dikonfigurasi. Isi VITE_API_BASE_URL atau gunakan Konfigurasi API.');
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

  const url = `${cfg.apiBaseUrl}${path}`;
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
    }
  }

  if (!res.ok) {
    const serverMessage =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) || null;
    throw mapHttpError(res.status, serverMessage);
  }
  return payload;
}
