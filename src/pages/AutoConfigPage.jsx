import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getEffectiveConfig } from '../config/env.js';
import {
  readSavedConfig,
  readMode,
  revertToAuto,
  saveManualConfig,
  isValidApiUrl,
  API_MODES,
} from '../config/runtimeConfig.js';
import { formatDateTime } from '../utils/format.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function AutoConfigPage() {
  const { token } = useAuth();
  const cfg = getEffectiveConfig();
  const saved = readSavedConfig();
  const mode = readMode();

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [manualUrl, setManualUrl] = useState(saved?.apiBaseUrl || '');
  const [manualError, setManualError] = useState(null);

  async function checkNow() {
    setChecking(true);
    setResult(null);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${cfg.apiBaseUrl.replace(/\/+$/, '')}/api/health`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        credentials: 'omit',
      });
      clearTimeout(timer);
      const ok = res.ok;
      const body = await res.json().catch(() => null);
      setResult({
        ok,
        status: res.status,
        at: new Date().toISOString(),
        body,
      });
    } catch (err) {
      clearTimeout(timer);
      setError(
        err?.name === 'AbortError'
          ? 'Timeout saat memeriksa koneksi (>8 detik).'
          : 'Gagal memeriksa koneksi.'
      );
    } finally {
      setChecking(false);
    }
  }

  function activateManual(e) {
    e.preventDefault();
    setManualError(null);
    if (!isValidApiUrl(manualUrl)) {
      setManualError('URL tidak valid.');
      return;
    }
    saveManualConfig(manualUrl);
    window.location.reload();
  }

  function goAuto() {
    revertToAuto();
    window.location.reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Konfigurasi Otomatis</h1>
        <p>Pilih sumber konfigurasi API: otomatis dari build-time, atau manual dari browser.</p>
      </div>

      <Card title="Mode Aktif">
        <p style={{ marginTop: 0 }}>
          <span className={`pill ${mode === API_MODES.MANUAL ? 'pending' : 'online'}`}>
            {mode === API_MODES.MANUAL ? 'Manual' : 'Otomatis'}
          </span>
        </p>
        <dl className="kv-grid">
          <dt>URL aktif</dt>
          <dd className="mono" style={{ wordBreak: 'break-all' }}>{cfg.apiBaseUrl || '(belum dikonfigurasi)'}</dd>
        </dl>
      </Card>

      <Card title="Mode Otomatis" subtitle="Menggunakan VITE_API_BASE_URL dari build-time Vercel.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={checkNow} loading={checking} variant="primary">
            Periksa Sekarang
          </Button>
          {mode === API_MODES.MANUAL && (
            <Button variant="ghost" onClick={goAuto}>Aktifkan Mode Otomatis</Button>
          )}
        </div>
        {error && <div className="alert error" role="alert" style={{ marginTop: 10 }}>{error}</div>}
        {result && (
          <div
            className={`alert ${result.ok ? 'success' : 'error'}`}
            role="status"
            style={{ marginTop: 10 }}
          >
            <div>
              <strong>{result.ok ? 'Berhasil' : 'Gagal'}</strong> — HTTP {result.status}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Diperiksa: {formatDateTime(result.at)}
            </div>
          </div>
        )}
      </Card>

      <Card title="Mode Manual" subtitle="Simpan URL backend Anda sendiri. Berlaku hanya di browser ini.">
        <form onSubmit={activateManual}>
          <div className="form-row">
            <label htmlFor="manual-url">URL dasar API</label>
            <input
              id="manual-url"
              className="input"
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://rayan-guardian-backend-production.up.railway.app"
              spellCheck={false}
            />
          </div>
          {manualError && <div className="alert error" role="alert">{manualError}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="submit" variant="primary">Aktifkan Manual & Reload</Button>
            {mode === API_MODES.MANUAL && (
              <Button type="button" variant="ghost" onClick={goAuto}>
                Kembali ke Otomatis
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card title="Catatan">
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-1)', fontSize: 13 }}>
          <li>URL disimpan di <code>localStorage</code> browser ini — <strong>bukan secret</strong>, jangan isi kredensial.</li>
          <li>Setelah mengganti URL, halaman akan reload agar konfigurasi berlaku.</li>
          <li>Untuk mengubah default bagi semua pengguna, ubah <code>VITE_API_BASE_URL</code> di Vercel dan redeploy.</li>
          <li>Jika token Anda (Firebase) tidak dikenali backend baru, Anda perlu login ulang.</li>
        </ul>
      </Card>
    </div>
  );
}
