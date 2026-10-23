import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

/**
 * Uses Contact Picker API if available. Falls back to manual import.
 * Contact Picker: https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API
 */
export default function ContactsPanel() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(false);

  const pickerSupported =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof navigator.contacts.select === 'function';

  async function pickContacts() {
    setError(null);
    setPicking(true);
    try {
      const result = await navigator.contacts.select(['name', 'tel'], {
        multiple: true,
      });
      if (Array.isArray(result)) {
        const normalized = result
          .map((c) => ({
            name: (c.name && c.name[0]) || '(tanpa nama)',
            tel: (c.tel && c.tel[0]) || '',
          }))
          .filter((c) => c.name || c.tel);
        setContacts((prev) => [...prev, ...normalized]);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError('Gagal memilih kontak: ' + (err?.message || 'unknown'));
      }
    } finally {
      setPicking(false);
    }
  }

  async function importFile(e) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      let parsed = [];
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        if (Array.isArray(json)) parsed = json;
      } else {
        // naive CSV: name,phone
        parsed = text
          .split(/\r?\n/)
          .map((line) => line.split(','))
          .filter((parts) => parts.length >= 1 && parts[0].trim())
          .map((parts) => ({ name: parts[0].trim(), tel: (parts[1] || '').trim() }));
      }
      setContacts((prev) => [...prev, ...parsed]);
    } catch (err) {
      setError('Gagal membaca file kontak: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <Card
      title="Kontak"
      subtitle="Impor kontak via Contact Picker (jika didukung) atau file manual (CSV/JSON)."
    >
      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="feature-actions">
        <Button
          variant="primary"
          onClick={pickContacts}
          disabled={!pickerSupported}
          loading={picking}
          title={!pickerSupported ? 'Contact Picker tidak didukung browser ini' : undefined}
        >
          Pilih kontak
        </Button>
        <label
          htmlFor="contacts-file"
          className="btn ghost sm"
          style={{ cursor: 'pointer', display: 'inline-flex' }}
        >
          Impor file
        </label>
        <input
          id="contacts-file"
          type="file"
          accept=".csv,.json"
          onChange={importFile}
          style={{ display: 'none' }}
        />
      </div>

      {!pickerSupported && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
          Contact Picker tidak tersedia di browser ini. Gunakan impor file.
        </p>
      )}

      {contacts.length > 0 && (
        <div className="file-list">
          {contacts.map((c, idx) => (
            <div key={`${c.name}-${idx}`} className="file-item">
              <span className="file-item-name">
                {c.name} {c.tel && <span style={{ color: 'var(--text-2)' }}>— {c.tel}</span>}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setContacts((prev) => prev.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
