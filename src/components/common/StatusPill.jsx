const LABELS = {
  online: 'Online',
  offline: 'Offline',
  pending: 'Pending',
  unknown: 'Tidak diketahui',
};

export default function StatusPill({ status = 'unknown' }) {
  const s = (status || 'unknown').toLowerCase();
  const cls = ['online', 'offline', 'pending'].includes(s) ? s : 'unknown';
  return (
    <span className={`pill ${cls}`}>
      <span className="dot" aria-hidden="true" />
      {LABELS[cls] || LABELS.unknown}
    </span>
  );
}
