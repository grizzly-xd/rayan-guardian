import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { updateDisplayName, updateEmailIfChanged } from '../firebase/firebaseClient.js';
import { isValidEmail } from '../utils/validators.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [serverError, setServerError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setServerError(null);

    const nextErrors = {};
    if (displayName.trim().length === 0) {
      nextErrors.displayName = 'Nama tampilan tidak boleh kosong.';
    } else if (displayName.trim().length > 80) {
      nextErrors.displayName = 'Nama tampilan maksimal 80 karakter.';
    }
    if (!isValidEmail(email)) {
      nextErrors.email = 'Format email tidak valid.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (displayName.trim() !== (user?.displayName || '')) {
        await updateDisplayName(displayName.trim());
      }
      if (email.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
        await updateEmailIfChanged(email.trim());
      }
      setSuccess('Profil berhasil diperbarui.');
      setTimeout(() => navigate('/profile'), 800);
    } catch (err) {
      setServerError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit Profil</h1>
        <p>Perubahan disimpan melalui Firebase Authentication.</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="displayName">Nama tampilan</label>
            <input
              id="displayName"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              disabled={saving}
              aria-invalid={errors.displayName ? 'true' : 'false'}
            />
            {errors.displayName && <span className="error">{errors.displayName}</span>}
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <span className="error">{errors.email}</span>}
            <span className="hint">
              Jika email diubah, Anda mungkin perlu login ulang dan memverifikasi email baru.
            </span>
          </div>
          {success && <div className="alert success" role="status">{success}</div>}
          {serverError && <div className="alert error" role="alert">{serverError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" variant="primary" loading={saving}>Simpan Perubahan</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/profile')} disabled={saving}>
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function friendlyError(err) {
  const code = err?.code || '';
  if (code.includes('requires-recent-login')) {
    return 'Perubahan email memerlukan login ulang. Silakan logout, login kembali, lalu coba lagi.';
  }
  if (code.includes('email-already-in-use')) {
    return 'Email sudah dipakai akun lain.';
  }
  if (code.includes('invalid-email')) {
    return 'Email tidak valid.';
  }
  if (code.includes('network-request-failed')) {
    return 'Tidak dapat menghubungi server autentikasi.';
  }
  return err?.message || 'Gagal menyimpan perubahan.';
}
