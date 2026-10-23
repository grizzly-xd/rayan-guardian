import { useEffect, useRef, useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export default function ScreenPanel() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  const supported =
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function';

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // Auto-stop when user stops sharing via browser UI
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          stop();
        });
      });
      setActive(true);
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setError('Berbagi layar dibatalkan atau ditolak.');
      } else {
        setError('Gagal memulai screen sharing: ' + (err?.message || 'unknown'));
      }
    } finally {
      setStarting(false);
    }
  }

  function stop() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  return (
    <Card
      title={
        <span>
          Screen Monitoring{' '}
          {active && <span style={{ color: '#6ee7b7', fontSize: 11, marginLeft: 6 }}>● AKTIF</span>}
        </span>
      }
      subtitle="Menggunakan getDisplayMedia. Anda mengontrol apa yang dibagikan."
    >
      {!supported ? (
        <div className="alert warn">Browser ini tidak mendukung getDisplayMedia.</div>
      ) : (
        <>
          <video ref={videoRef} className="feature-preview" muted playsInline />
          {error && <div className="alert error" role="alert">{error}</div>}
          <div className="feature-actions">
            {!active ? (
              <Button variant="primary" onClick={start} loading={starting}>Mulai berbagi layar</Button>
            ) : (
              <Button variant="danger" onClick={stop}>Hentikan</Button>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10, marginBottom: 0 }}>
            Browser akan menampilkan dialog pemilihan layar. Tidak ada rekaman yang disimpan otomatis.
          </p>
        </>
      )}
    </Card>
  );
}
