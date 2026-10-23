/** Pure formatting helpers. */

export function formatDateTime(input, locale = 'id-ID') {
  if (!input) return '—';
  const d = toDate(input);
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export function formatRelative(input, now = Date.now()) {
  if (!input) return '—';
  const d = toDate(input);
  if (!d) return '—';
  const diff = d.getTime() - now;
  const abs = Math.abs(diff);
  const sec = Math.round(abs / 1000);
  if (sec < 45) return diff < 0 ? 'baru saja' : 'sebentar lagi';
  const min = Math.round(sec / 60);
  if (min < 60) return diff < 0 ? `${min} menit lalu` : `dalam ${min} menit`;
  const hr = Math.round(min / 60);
  if (hr < 24) return diff < 0 ? `${hr} jam lalu` : `dalam ${hr} jam`;
  const day = Math.round(hr / 24);
  return diff < 0 ? `${day} hari lalu` : `dalam ${day} hari`;
}

function toDate(input) {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number' && Number.isFinite(input)) return new Date(input);
  if (typeof input === 'string') {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function truncate(value, max = 60) {
  const s = String(value ?? '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
