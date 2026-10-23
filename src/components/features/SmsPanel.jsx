import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

/**
 * Browser tidak memiliki API resmi untuk membaca SMS.
 * Panel ini menyediakan impor manual file teks. TIDAK mengklaim
 * membaca SMS secara otomatis.
 */
export default function SmsPanel() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  async function onFile(e) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      setMessages((prev) => [...prev, { name: file.name, content: text }]);
    } catch (err) {
      setError('Gagal membaca file: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <Card
      title="SMS"
      subtitle="Impor manual ekspor SMS (file teks). Browser tidak dapat membaca kotak masuk SMS secara otomatis."
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <label
        htmlFor="sms-input"
        className="btn ghost sm"
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        Pilih file SMS
      </label>
      <input
        id="sms-input"
        type="file"
        accept=".txt,.csv,.json,text/plain,text/csv,application/json"
        onChange={onFile}
        style={{ display: 'none' }}
      />
      {messages.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
          Belum ada file SMS diimpor.
        </p>
      ) : (
        <div className="file-list">
          {messages.map((m, i) => (
            <div key={`${m.name}-${i}`} className="file-item">
              <span className="file-item-name" title={m.name}>{m.name}</span>
              <Button size="sm" variant="ghost" onClick={() => setMessages((p) => p.filter((_, idx) => idx !== i))}>
                Hapus
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
