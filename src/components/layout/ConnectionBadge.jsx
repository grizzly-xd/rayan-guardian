import { useAuth } from '../../hooks/useAuth.jsx';
import { useSocketStatus } from '../../hooks/useSocketStatus.js';
import { isApiConfigured } from '../../config/env.js';

const LABEL = {
  connected: 'Socket terhubung',
  connecting: 'Menghubungkan…',
  reconnecting: 'Menyambung ulang…',
  disconnected: 'Socket terputus',
  unavailable: 'Backend belum dikonfigurasi',
};

export default function ConnectionBadge() {
  const { token } = useAuth();
  const { status } = useSocketStatus(token);
  const label = LABEL[status] || (isApiConfigured ? 'Tidak diketahui' : 'Belum dikonfigurasi');
  return (
    <span
      className={`conn-badge ${status}`}
      title={label}
      role="status"
      aria-live="polite"
    >
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  );
}
