import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { fetchDashboard } from '../services/dashboardService.js';
import { toUserMessage } from '../utils/errors.js';
import { isApiConfigured, getEffectiveConfig } from '../config/env.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Card from '../components/common/Card.jsx';
import Icon from '../components/common/Icon.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

export default function DashboardPage() {
  const cfg = getEffectiveConfig();
  if (!isApiConfigured && !cfg.apiBaseUrl) {
    return (
      <div className="page">
        <div className="page-header"><h1>Dashboard</h1></div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL di Vercel, atau buka Konfigurasi API untuk mengisi URL backend secara manual."
          action={
            <Link to="/settings/api"><Button variant="primary">Buka Konfigurasi API</Button></Link>
          }
        />
      </div>
    );
  }
  return <DashboardContent />;
}

function DashboardContent() {
  const { token } = useAuth();
  const cfg = getEffectiveConfig();
  const { data, error, loading, reload } = useAbortableFetch(
    `dashboard:${token ?? 'anon'}:${cfg.apiBaseUrl}`,
    (signal) => fetchDashboard({ token, signal })
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Ringkasan status perangkat Anda.</p>
      </div>

      {loading && (
        <div className="stats-grid">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      )}
      {error && <ErrorState message={toUserMessage(error)} onRetry={reload} />}
      {!loading && !error && data && (
        <>
          <div className="stats-grid">
            <Stat label="Total Perangkat" value={data.totalDevices} icon="devices" />
            <Stat label="Online" value={data.onlineDevices} accent="online" icon="wifi" />
            <Stat label="Offline" value={data.offlineDevices} accent="offline" icon="wifi" />
            <Stat label="Undangan Pending" value={data.pendingInvitations} accent="pending" icon="link" />
          </div>

          <Card title="Status Sistem">
            <dl className="kv-grid">
              <dt>API aktif</dt>
              <dd className="mono" style={{ wordBreak: 'break-all' }}>{cfg.apiBaseUrl}</dd>
              <dt>Sumber</dt>
              <dd>{cfg.source === 'manual' ? 'Manual (browser)' : 'Otomatis (env)'}</dd>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent, icon }) {
  if (value == null) {
    return (
      <div className="stat-card">
        <div className="stat-label"><Icon name={icon} size={14} /> {label}</div>
        <div className="stat-value muted">Belum tersedia</div>
      </div>
    );
  }
  const color =
    accent === 'online' ? '#6ee7b7' : accent === 'offline' ? '#fca5a5' : accent === 'pending' ? '#fcd34d' : undefined;
  return (
    <div className="stat-card">
      <div className="stat-label"><Icon name={icon} size={14} /> {label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}
