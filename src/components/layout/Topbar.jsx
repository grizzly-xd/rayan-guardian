import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import ConnectionBadge from './ConnectionBadge.jsx';
import Dropdown from '../common/Dropdown.jsx';
import Icon from '../common/Icon.jsx';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const TITLE_BY_PATH = [
  { path: '/', title: 'Dashboard' },
  { path: '/devices', title: 'Client Device' },
  { path: '/client/url', title: 'Client URL' },
  { path: '/client/apk', title: 'Client APK' },
  { path: '/activity-logs', title: 'Activity Logs' },
  { path: '/profile', title: 'Profil Saya' },
  { path: '/profile/edit', title: 'Edit Profil' },
  { path: '/settings/api', title: 'Konfigurasi API' },
  { path: '/settings/auto', title: 'Konfigurasi Otomatis' },
];

function pageTitle(pathname) {
  for (const t of TITLE_BY_PATH) {
    if (t.path === '/') {
      if (pathname === '/') return t.title;
    } else if (pathname === t.path || pathname.startsWith(t.path + '/')) {
      return t.title;
    }
  }
  return 'Rayan Guardian';
}

export default function Topbar({ onMobileOpen }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const initial = (user?.email || '?').trim().charAt(0).toUpperCase();

  async function doLogout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await signOut();
      setConfirmLogout(false);
      navigate('/login', { replace: true });
    } catch (err) {
      setLogoutError(err?.message || 'Gagal logout.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="icon-btn topbar-burger"
            aria-label="Buka navigasi"
            onClick={onMobileOpen}
          >
            <Icon name="menu" size={20} />
          </button>
          <div>
            <div className="topbar-title">{pageTitle(location.pathname)}</div>
            <div className="topbar-sub">{user?.email || ''}</div>
          </div>
        </div>

        <div className="topbar-right">
          <ConnectionBadge />
          <ThemeToggle />
          <Dropdown
            width={240}
            trigger={
              <span className="avatar" aria-hidden="true">{initial}</span>
            }
          >
            {({ close }) => (
              <>
                <div className="dropdown-header">
                  <div className="dropdown-user-email">{user?.email || 'Tidak login'}</div>
                </div>
                <MenuItem icon="user" label="Profil Saya" onClick={() => { close(); navigate('/profile'); }} />
                <MenuItem icon="api" label="Konfigurasi API Backend" onClick={() => { close(); navigate('/settings/api'); }} />
                <MenuItem icon="settings" label="Konfigurasi Otomatis" onClick={() => { close(); navigate('/settings/auto'); }} />
                <MenuItem icon="edit" label="Edit Profil" onClick={() => { close(); navigate('/profile/edit'); }} />
                <div className="dropdown-divider" role="separator" />
                <MenuItem
                  icon="logout"
                  label="Log Out"
                  variant="danger"
                  onClick={() => { close(false); setConfirmLogout(true); }}
                />
              </>
            )}
          </Dropdown>
        </div>
      </header>

      <Modal
        open={confirmLogout}
        title="Keluar dari akun?"
        onClose={() => !loggingOut && setConfirmLogout(false)}
        closable={!loggingOut}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
              Batal
            </Button>
            <Button variant="danger" onClick={doLogout} loading={loggingOut}>
              Ya, Keluar
            </Button>
          </>
        }
      >
        <p>Sesi Anda akan diakhiri. Anda harus login kembali untuk mengakses dashboard.</p>
        {logoutError && <div className="alert error" role="alert">{logoutError}</div>}
      </Modal>
    </>
  );
}

function MenuItem({ icon, label, onClick, variant }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`dropdown-item${variant ? ` ${variant}` : ''}`}
      onClick={onClick}
    >
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </button>
  );
}
