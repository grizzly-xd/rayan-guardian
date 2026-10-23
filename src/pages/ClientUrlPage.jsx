import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { createInvitation } from '../services/invitationsService.js';
import { validateInvitationForm } from '../utils/validators.js';
import { toUserMessage } from '../utils/errors.js';
import { formatDateTime } from '../utils/format.js';
import { isApiConfigured } from '../config/env.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function ClientUrlPage() {
  if (!isApiConfigured) {
    return (
      <div className="page">
        <div className="page-header"><h1>Client URL</h1></div>
        <EmptyState
          title="Backend belum dikonfigurasi"
          message="Isi VITE_API_BASE_URL untuk membuat undangan client URL."
        />
      </div>
    );
  }
  return <ClientUrlContent />;
}

function ClientUrlContent() {
  const { token } = useAuth();
  const [label, setLabel] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setServerError(null);
    setCopied(false);
    const v = validateInvitationForm({ label, clientType: 'url' });
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      const inv = await createInvitation({ token, clientType: 'url', label });
      setInvitation(inv);
    } catch (err) {
      setInvitation(null);
      setServerError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!invitation?.url) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(invitation.url);
      } else {
        // Fallback for insecure contexts
        const ta = document.createElement('textarea');
        ta.value = invitation.url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setServerError('Gagal menyalin URL ke clipboard.');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Client URL</h1>
        <p>Buat tautan undangan agar client dapat melakukan pairing melalui browser.</p>
      </div>

      <Card title="Buat undangan baru">
        <form onSubmit={handleCreate} noValidate>
          <div className="form-row">
            <label htmlFor="label">Label (opsional)</label>
            <input
              id="label"
              className="input"
              type="text"
              maxLength={120}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: HP staff kantor"
              disabled={submitting}
            />
            {errors.label && <span className="error">{errors.label}</span>}
            <span className="hint">Hanya sebagai penanda pada daftar perangkat.</span>
          </div>
          <Button type="submit" variant="primary" loading={submitting}>
            Buat undangan
          </Button>
        </form>
      </Card>

      {serverError && <div className="alert error" role="alert" style={{ marginTop: 16 }}>{serverError}</div>}

      {invitation && (
        <Card title="Undangan dibuat" className="" subtitle="URL hanya ditampilkan setelah server mengonfirmasi pembuatan undangan.">
          <div className="form-row">
            <label>URL undangan</label>
            <div className="code" aria-label="URL undangan">{invitation.url}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button onClick={handleCopy} variant="primary" size="sm">
              {copied ? 'Tersalin ✓' : 'Salin URL'}
            </Button>
            <a
              href={invitation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost sm"
              style={{ textDecoration: 'none' }}
            >
              Buka tautan
            </a>
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-2)' }}>
            <div>Berlaku hingga: {invitation.expiresAt ? formatDateTime(invitation.expiresAt) : 'Tidak ditentukan backend'}</div>
            <div>Status: {invitation.status || 'pending'}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
