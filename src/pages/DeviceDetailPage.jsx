import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAbortableFetch } from '../hooks/useAbortableFetch.js';
import { getDevice, revokeDevice, deleteDevice } from '../services/devicesService.js';
import { toUserMessage } from '../utils/errors.js';
import { formatDateTime, formatRelative } from '../utils/format.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import StatusPill from '../components/common/StatusPill.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import CameraPanel from '../components/features/CameraPanel.jsx';
import ScreenPanel from '../components/features/ScreenPanel.jsx';
import GalleryPanel from '../components/features/GalleryPanel.jsx';
import NotificationPanel from '../components/features/NotificationPanel.jsx';
import SmsPanel from '../components/features/SmsPanel.jsx';
import ContactsPanel from '../components/features/ContactsPanel.jsx';

export default function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const { data, error, loading, reload } = useAbortableFetch(
    (signal) => getDevice(id, { token, signal }),
    [id, token]
  );

  const [confirm, setConfirm] = useState(null); // 'revoke' | 'delete'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  async function runAction() {
    if (!confirm) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      if (confirm === 'revoke') {
        await revokeDevice(id, { token });
        setActionSuccess('Akses perangkat berhasil dicabut.');
      } else {
        await deleteDevice(id, { token });
        navigate('/devices', { replace: true });
        return;
      }
      setConfirm(null);
      reload();
    } catch (err) {
      setActionError(toUserMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

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
        <ErrorState title="Perangkat tidak ditemukan" message="Perangkat tidak tersedia." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/devices" className="btn ghost sm" style={{ marginBottom: 12 }}>
          ← Kembali
        </Link>
        <h1 style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {data.name} <StatusPill status={data.status} />
        </h1>
        <p>{data.id}</p>
      </div>

      {actionSuccess && <div className="alert success" role="status">{actionSuccess}</div>}
      {actionError && <div className="alert error" role="alert">{actionError}</div>}

      <Card title="Info Perangkat">
        <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 12px', margin: 0, fontSize: 13 }}>
          <dt style={{ color: 'var(--text-2)' }}>Tipe client</dt><dd style={{ margin: 0 }}>{data.clientType}</dd>
          <dt style={{ color: 'var(--text-2)' }}>Status</dt><dd style={{ margin: 0 }}>{data.status}</dd>
          <dt style={{ color: 'var(--text-2)' }}>Last seen</dt><dd style={{ margin: 0 }}>{formatDateTime(data.lastSeenAt)} ({formatRelative(data.lastSeenAt)})</dd>
          <dt style={{ color: 'var(--text-2)' }}>Paired</dt><dd style={{ margin: 0 }}>{formatDateTime(data.pairedAt)}</dd>
          <dt style={{ color: 'var(--text-2)' }}>Dibuat</dt><dd style={{ margin: 0 }}>{formatDateTime(data.createdAt)}</dd>
        </dl>
        <div className="divider" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="danger" onClick={() => setConfirm('revoke')}>Cabut akses</Button>
          <Button variant="danger" onClick={() => setConfirm('delete')}>Hapus perangkat</Button>
        </div>
      </Card>

      <h2 style={{ marginTop: 24, marginBottom: 12, fontSize: 16 }}>Fitur Monitoring</h2>
      <div className="feature-grid">
        <CameraPanel />
        <ScreenPanel />
        <GalleryPanel />
        <NotificationPanel />
        <SmsPanel />
        <ContactsPanel />
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'revoke' ? 'Cabut akses perangkat?' : 'Hapus perangkat?'}
        message={
          confirm === 'revoke'
            ? 'Setelah dicabut, perangkat tidak dapat lagi mengakses layanan. Tindakan ini tidak dapat dibatalkan.'
            : 'Perangkat akan dihapus permanen dari sistem. Lanjutkan?'
        }
        confirmLabel={confirm === 'revoke' ? 'Cabut akses' : 'Hapus'}
        onCancel={() => {
          if (!actionLoading) setConfirm(null);
        }}
        onConfirm={runAction}
        loading={actionLoading}
      />
    </div>
  );
}
