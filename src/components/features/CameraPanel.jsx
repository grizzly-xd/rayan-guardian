import { useEffect, useRef, useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export default function CameraPanel() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  const supported =
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  useEffect(() => {
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setActive(true);
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Berikan izin pada browser untuk menggunakan fitur ini.'
          : err?.name === 'NotFoundError'
            ? 'Tidak ada kamera yang terdeteksi pada perangkat ini.'
            : 'Gagal mengakses kamera: ' + (err?.message || 'unknown')
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <Card
      title={
        <span>
          Kamera {active && <span style={{ color: '#6ee7b7', fontSize: 11, marginLeft: 6 }}>● AKTIF</span>}
        </span>
      }
      subtitle="Menggunakan API kamera browser pada perangkat Anda sendiri."
    >
      {!supported ? (
        <div className="alert warn">
          Browser ini tidak mendukung akses kamera (mediaDevices.getUserMedia).
        </div>
      ) : (
        <>
          <video ref={videoRef} className="feature-preview" muted playsInline />
          {error && <div className="alert error" role="alert">{error}</div>}
          <div className="feature-actions">
            {!active ? (
              <Button variant="primary" onClick={start} loading={starting}>Aktifkan kamera</Button>
            ) : (
              <Button variant="danger" onClick={stopStream}>Matikan</Button>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10, marginBottom: 0 }}>
            Kamera hanya aktif setelah Anda memberikan izin browser. Tidak ada perekaman atau pengiriman otomatis.
          </p>
        </>
      )}
    </Card>
  );
}
