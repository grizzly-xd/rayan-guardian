import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import { usePermission } from '../../hooks/usePermission.js';

export default function NotificationPanel() {
  const perm = usePermission('notifications');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const supported = typeof window !== 'undefined' && 'Notification' in window;

  async function requestAndSend() {
    setError(null);
    setSent(false);
    if (!supported) return;
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        new Notification('Rayan Guardian', {
          body: 'Notifikasi uji dari dashboard.',
        });
        setSent(true);
      } else {
        setError('Izin notifikasi tidak diberikan.');
      }
      perm.refresh();
    } catch (err) {
      setError('Gagal mengirim notifikasi: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <Card
      title="Notifikasi"
      subtitle="Notifikasi browser pada perangkat ini. Website tidak dapat membaca notifikasi HP."
    >
      {!supported ? (
        <div className="alert warn">Browser ini tidak mendukung Web Notifications.</div>
      ) : (
        <>
          <p style={{ fontSize: 13, marginTop: 0 }}>
            Status izin: <strong>{perm.status}</strong>
          </p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {sent && <div className="alert success" role="status">Notifikasi uji terkirim.</div>}
          <div className="feature-actions">
            <Button variant="primary" onClick={requestAndSend}>
              Minta izin & kirim uji
            </Button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10, marginBottom: 0 }}>
            Menggunakan API browser standar. Tidak ada bypass terhadap persetujuan pengguna.
          </p>
        </>
      )}
    </Card>
  );
}
