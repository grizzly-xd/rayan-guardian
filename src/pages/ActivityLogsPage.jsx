import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { listActivityLogs } from '../services/activityLogsService.js';
import { toUserMessage } from '../utils/errors.js';
import { formatDateTime } from '../utils/format.js';
import { isApiConfigured } from '../config/env.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function ActivityLogsPage() {
  if (!isApiConfigured) {
    return (
      <div className="page">
        <div className="page-header"><h1>Activity Logs</h1></div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL untuk menampilkan log aktivitas."
        />
      </div>
    );
  }
  return <ActivityLogsContent />;
}

function ActivityLogsContent() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useAbortableFetch(
    (signal) => listActivityLogs({ token, signal, limit: 50 }),
    [token]
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Activity Logs</h1>
        <p>Aktivitas terbaru pada backend.</p>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={toUserMessage(error)} onRetry={reload} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState title="Belum ada log" message="Belum ada aktivitas tercatat." />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="list">
          {data.map((log) => (
            <div key={log.id} className="list-item">
              <div className="list-item-main">
                <div className="list-item-title">{log.message || log.type}</div>
                <div className="list-item-meta">
                  <span>{log.type}</span>
                  {log.actor && <span>oleh {log.actor}</span>}
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
