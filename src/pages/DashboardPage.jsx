import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { fetchDashboard } from '../services/dashboardService.js';
import { toUserMessage } from '../utils/errors.js';
import { isApiConfigured } from '../config/env.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Card from '../components/common/Card.jsx';

export default function DashboardPage() {
  const { token } = useAuth();

  if (!isApiConfigured) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL pada environment untuk menghubungkan dashboard ke backend Railway."
        />
      </div>
    );
  }

  return <DashboardContent token={token} />;
}

function DashboardContent({ token }) {
  const { data, error, loading, reload } = useAbortableFetch(
    (signal) => fetchDashboard({ token, signal }),
    [token]
  );

  if (loading) return <div className="page"><LoadingState /></div>;
  if (error) {
    return (
      <div className="page">
        <ErrorState message={toUserMessage(error)} onRetry={reload} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="page">
        <EmptyState title="Data belum tersedia" message="Backend tidak mengembalikan data dashboard." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Ringkasan status perangkat Anda.</p>
      </div>

      <div className="stats-grid">
        <Stat label="Total Perangkat" value={data.totalDevices} />
        <Stat label="Online" value={data.onlineDevices} accent="online" />
        <Stat label="Offline" value={data.offlineDevices} accent="offline" />
        <Stat label="Undangan Pending" value={data.pendingInvitations} accent="pending" />
      </div>

      <Card title="Catatan">
        <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13 }}>
          Angka ditampilkan hanya jika backend mengembalikannya. Nilai kosong menandakan field
          tidak tersedia pada respons.
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }) {
  if (value == null) {
    return (
      <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value muted">Belum tersedia</div>
      </div>
    );
  }
  const color =
    accent === 'online' ? '#6ee7b7' : accent === 'offline' ? '#fca5a5' : accent === 'pending' ? '#fcd34d' : undefined;
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
