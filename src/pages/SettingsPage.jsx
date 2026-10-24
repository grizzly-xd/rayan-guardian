import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';

const COMPACT_KEY = 'rayan_guardian_compact_v1';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [compact, setCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COMPACT_KEY) === '1';
  });

  function toggleCompact() {
    setCompact((v) => {
      const next = !v;
      window.localStorage.setItem(COMPACT_KEY, next ? '1' : '0');
      document.documentElement.setAttribute('data-compact', next ? '1' : '0');
      return next;
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <p>Preferensi tampilan dan tautan cepat.</p>
      </div>

      <Card title="Preferensi Tampilan">
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Tema</div>
            <div className="settings-row-sub">Terang atau gelap.</div>
          </div>
          <ThemeToggle />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-title">Mode ringkas</div>
            <div className="settings-row-sub">Kurangi padding pada tabel dan kartu.</div>
          </div>
          <Button variant={compact ? 'primary' : 'ghost'} size="sm" onClick={toggleCompact}>
            {compact ? 'Aktif' : 'Nonaktif'}
          </Button>
        </div>
      </Card>

      <Card title="Tautan Cepat">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/settings/api"><Button variant="ghost" block>Konfigurasi API Backend →</Button></Link>
          <Link to="/settings/auto"><Button variant="ghost" block>Konfigurasi Otomatis →</Button></Link>
          <Link to="/profile"><Button variant="ghost" block>Profil Saya →</Button></Link>
        </div>
      </Card>

      <Card title="Tentang Aplikasi">
        <dl className="kv-grid">
          <dt>Nama</dt><dd>Rayan Guardian</dd>
          <dt>Versi</dt><dd>1.0.0</dd>
        </dl>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Kembali</Button>
      </div>
    </div>
  );
}
