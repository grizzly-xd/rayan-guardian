import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { listDevices } from '../services/devicesService.js';
import { toUserMessage } from '../utils/errors.js';
import { formatRelative } from '../utils/format.js';
import { isApiConfigured } from '../config/env.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusPill from '../components/common/StatusPill.jsx';
import Button from '../components/common/Button.jsx';

export default function DevicesPage() {
  if (!isApiConfigured) {
    return (
      <div className="page">
        <div className="page-header"><h1>Client Device</h1></div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL untuk menampilkan daftar perangkat."
        />
      </div>
    );
  }
  return <DevicesContent />;
}

function DevicesContent() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useAbortableFetch(
    (signal) => listDevices({ token, signal }),
    [token]
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Client Device</h1>
        <p>Daftar perangkat yang terdaftar pada backend.</p>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={toUserMessage(error)} onRetry={reload} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="Belum ada perangkat terdaftar"
          message="Buat undangan pada menu Client URL atau Client APK untuk memulai pairing."
          action={<Link to="/client/url"><Button variant="primary">Buat undangan</Button></Link>}
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="list">
          {data.map((device) => (
            <div key={device.id} className="list-item">
              <div className="list-item-main">
                <div className="list-item-title">{device.name}</div>
                <div className="list-item-meta">
                  <span>Tipe: {device.clientType}</span>
                  <span>Last seen: {formatRelative(device.lastSeenAt)}</span>
                </div>
              </div>
              <div className="list-item-actions">
                <StatusPill status={device.status} />
                <Link to={`/devices/${encodeURIComponent(device.id)}`}>
                  <Button variant="ghost" size="sm">Detail</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
