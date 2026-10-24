import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getEffectiveConfig } from '../config/env.js';
import {
  readSavedConfig,
  readMode,
  saveManualConfig,
  revertToAuto,
  isValidApiUrl,
  API_MODES,
} from '../config/runtimeConfig.js';
import { apiRequest } from '../services/apiClient.js';
import { formatDateTime } from '../utils/format.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Icon from '../components/common/Icon.jsx';

export default function ApiConfigPage() {
  const navigate = useNavigate();
  const cfg = getEffectiveConfig();
  const saved = readSavedConfig();
  const mode = readMode();
  const [input, setInput] = useState(saved?.apiBaseUrl || '');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [saving, setSaving] = useState(false);

  // Test connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  function handleSave(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = input.trim();
    if (!isValidApiUrl(trimmed)) {
      setError('URL tidak valid. Gunakan http:// atau https:// tanpa credentials dan tanpa fragment.');
      return;
    }
    setSaving(true);
    try {
      saveManualConfig(trimmed);
      setInfo('Konfigurasi disimpan. Reload halaman akan menggunakan URL baru.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setError(null);
    setTestResult(null);
    const url = input.trim() || cfg.apiBaseUrl;
    if (!isValidApiUrl(url)) {
      setError('URL tidak valid untuk dites.');
      return;
    }
    setTesting(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${url.replace(/\/+$/, '')}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        credentials: 'omit',
      });
      clearTimeout(timer);
      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      if (!res.ok) {
        setTestResult({
          ok: false,
          message: `Server merespons HTTP ${res.status}.`,
          detail: body ? JSON.stringify(body) : null,
        });
      } else {
        setTestResult({
          ok: true,
          message: 'Koneksi berhasil. Endpoint /api/health merespons normal.',
          detail: body ? JSON.stringify(body, null, 2) : null,
        });
      }
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err?.name === 'AbortError';
      setTestResult({
        ok: false,
        message: isAbort
          ? 'Tes koneksi timeout (>8 detik).'
          : 'Tidak dapat terhubung. Periksa URL, jaringan, dan CORS backend.',
        detail: err?.message || null,
      });
    } finally {
      setTesting(false);
    }
  }

  function handleRevertAuto() {
    revertToAuto();
    setInfo('Mode dikembalikan ke otomatis (env build-time).');
    setTestResult(null);
  }

  function handleReload() {
    window.location.reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Konfigurasi API Backend</h1>
        <p>URL backend yang digunakan aplikasi. Konfigurasi manual disimpan di browser ini saja.</p>
      </div>

      <Card title="Status Saat Ini">
        <dl className="kv-grid">
          <dt>URL aktif</dt>
          <dd className="mono" style={{ wordBreak: 'break-all' }}>{cfg.apiBaseUrl || '(belum dikonfigurasi)'}</dd>
          <dt>Sumber</dt>
          <dd>
            {mode === API_MODES.MANUAL
              ? 'Manual (disimpan di browser)'
              : 'Otomatis (env build-time)'}
          </dd>
          <dt>Build-time URL</dt>
          <dd className="mono" style={{ wordBreak: 'break-all' }}>{cfg.buildTimeUrl || '(kosong)'}</dd>
          {saved?.savedAt && (
            <>
              <dt>Disimpan</dt>
              <dd>{formatDateTime(saved.savedAt)}</dd>
            </>
          )}
        </dl>
      </Card>

      <Card title="Ubah Konfigurasi" subtitle="URL publik, bukan secret. Jangan isi token atau kredensial.">
        <form onSubmit={handleSave} noValidate>
          <div className="form-row">
            <label htmlFor="api-url">URL dasar API</label>
            <input
              id="api-url"
              className="input"
              type="url"
              placeholder="https://rayan-guardian-backend-production.up.railway.app"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={saving}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="hint">Tanpa slash di akhir. Tidak boleh mengandung /api.</span>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          {info && <div className="alert success" role="status">{info}</div>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="submit" variant="primary" loading={saving}>
              Simpan
            </Button>
            <Button type="button" variant="ghost" onClick={handleTest} loading={testing}>
              Tes Koneksi
            </Button>
            <Button type="button" variant="ghost" onClick={handleRevertAuto}>
              Kembali ke Otomatis
            </Button>
            <Button type="button" variant="ghost" onClick={handleReload}>
              <Icon name="refresh" size={14} /> Reload
            </Button>
          </div>
        </form>

        {testResult && (
          <div
            className={`alert ${testResult.ok ? 'success' : 'error'}`}
            role="status"
            style={{ marginTop: 12 }}
          >
            <div style={{ fontWeight: 600 }}>{testResult.message}</div>
            {testResult.detail && (
              <pre
                style={{
                  marginTop: 8,
                  fontSize: 11.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: 'var(--text-2)',
                }}
              >
                {testResult.detail}
              </pre>
            )}
          </div>
        )}
      </Card>

      <Card title="Catatan">
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-1)', fontSize: 13 }}>
          <li>Perubahan URL memerlukan reload halaman agar berlaku di semua service.</li>
          <li>Konfigurasi manual menimpa env build-time; gunakan tombol Kembali ke Otomatis untuk kembali.</li>
          <li>Pastikan CORS backend mengizinkan origin Vercel Anda sebelum tes koneksi.</li>
          <li>Jangan masukkan token, password, atau kredensial apa pun ke kolom URL.</li>
        </ul>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Kembali
        </Button>
      </div>
    </div>
  );
}
