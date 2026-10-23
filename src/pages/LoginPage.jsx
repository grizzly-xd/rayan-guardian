import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { validateLoginForm, validateResetForm } from '../utils/validators.js';
import Button from '../components/common/Button.jsx';

export default function LoginPage() {
  const { signIn, resetPassword, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [info, setInfo] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    setInfo(null);

    if (mode === 'reset') {
      const v = validateResetForm({ email });
      setErrors(v);
      if (Object.keys(v).length) return;
      setSubmitting(true);
      try {
        await resetPassword(email.trim());
        setInfo('Email reset password telah dikirim. Periksa kotak masuk Anda.');
      } catch (err) {
        setServerError(err?.message || 'Gagal mengirim email reset.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const v = validateLoginForm({ email, password });
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Firebase error codes are cryptic; provide readable messages.
      setServerError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-logo">RG</div>
            <div>
              <h1>Rayan Guardian</h1>
              <p>Konfigurasi tidak lengkap</p>
            </div>
          </div>
          <div className="alert error" role="alert">
            Konfigurasi Firebase belum diisi. Administrator deployment harus mengisi variabel
            <code> VITE_FIREBASE_* </code> di environment. Login tidak dapat dilakukan.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-brand">
          <div className="login-brand-logo">RG</div>
          <div>
            <h1>Rayan Guardian</h1>
            <p>Admin access</p>
          </div>
        </div>

        {serverError && <div className="alert error" role="alert">{serverError}</div>}
        {info && <div className="alert success" role="status">{info}</div>}

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? 'true' : 'false'}
            disabled={submitting}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        {mode === 'login' && (
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={submitting}
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
        )}

        <Button type="submit" variant="primary" block loading={submitting}>
          {mode === 'login' ? 'Login' : 'Kirim email reset'}
        </Button>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13 }}>
          {mode === 'login' ? (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setMode('reset');
                setServerError(null);
                setInfo(null);
                setErrors({});
              }}
              disabled={submitting}
            >
              Lupa password?
            </button>
          ) : (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setMode('login');
                setServerError(null);
                setInfo(null);
                setErrors({});
              }}
              disabled={submitting}
            >
              Kembali ke login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) {
    return 'Email atau password salah.';
  }
  if (code.includes('user-not-found')) return 'Akun tidak ditemukan.';
  if (code.includes('too-many-requests')) return 'Terlalu banyak percobaan. Coba lagi nanti.';
  if (code.includes('network-request-failed')) return 'Tidak dapat terhubung ke server autentikasi.';
  if (code.includes('user-disabled')) return 'Akun ini dinonaktifkan.';
  return err?.message || 'Login gagal.';
}
