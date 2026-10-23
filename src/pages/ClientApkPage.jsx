import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { apiRequest } from '../services/apiClient.js';
import { toUserMessage, ApiError } from '../utils/errors.js';
import { isValidHttpUrl } from '../utils/validators.js';
import { isApiConfigured } from '../config/env.js';
import Card from '../components/common/Card.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

/**
 * The APK endpoint is not listed in the mandatory API list.
 * We assume GET /api/devices/apk (or /api/apk/info) may be provided by backend.
 * If your backend exposes a different path, adjust `APK_ENDPOINT` below.
 * If unavailable, the UI clearly states APK belum tersedia — no fake links.
 */
const APK_ENDPOINT = '/api/devices/apk';

export default function ClientApkPage() {
  if (!isApiConfigured) {
    return (
      <div className="page">
        <div className="page-header"><h1>Client APK</h1></div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL untuk menampilkan paket APK."
        />
      </div>
    );
  }
  return <ClientApkContent />;
}

function ClientApkContent() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useAbortableFetch(
    (signal) => apiRequest(APK_ENDPOINT, { token, signal }),
    [token]
  );

  if (loading) return <div className="page"><LoadingState /></div>;

  // Distinguish "not provided by backend" (404) from real errors.
  const isNotAvailable =
    error instanceof ApiError && (error.httpStatus === 404 || error.code === 'not_found');

  if (error && !isNotAvailable) {
    return (
      <div className="page">
        <ErrorState message={toUserMessage(error)} onRetry={reload} />
      </div>
    );
  }

  const apk = normalizeApk(data);
  const downloadUrl = apk?.url && isValidHttpUrl(apk.url) ? apk.url : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Client APK</h1>
        <p>Unduh paket aplikasi Android untuk melakukan pairing.</p>
      </div>

      {(!apk || !downloadUrl) && (
        <EmptyState
          title="APK belum tersedia"
          message="Backend saat ini tidak menyediakan paket APK. Hubungi administrator backend untuk mengunggah build APK resmi."
        />
      )}

      {apk && downloadUrl && (
        <Card title="Paket tersedia">
          <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 12px', margin: 0, fontSize: 13 }}>
            <dt style={{ color: 'var(--text-2)' }}>Versi</dt>
            <dd style={{ margin: 0 }}>{apk.version || '—'}</dd>
            <dt style={{ color: 'var(--text-2)' }}>Ukuran</dt>
            <dd style={{ margin: 0 }}>{apk.size || '—'}</dd>
            <dt style={{ color: 'var(--text-2)' }}>Diperbarui</dt>
            <dd style={{ margin: 0 }}>{apk.updatedAt || '—'}</dd>
          </dl>
          <div className="divider" />
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ textDecoration: 'none' }}>
            Unduh APK
          </a>
        </Card>
      )}
    </div>
  );
}

function normalizeApk(data) {
  if (!data || typeof data !== 'object') return null;
  const src = data.apk && typeof data.apk === 'object' ? data.apk : data;
  if (!src.url && !src.downloadUrl && !src.download_url) return null;
  return {
    url: src.url || src.downloadUrl || src.download_url,
    version: src.version || null,
    size: src.size || null,
    updatedAt: src.updatedAt || src.updated_at || null,
  };
}
