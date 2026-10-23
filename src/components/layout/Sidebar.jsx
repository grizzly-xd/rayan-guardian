import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../common/Button.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/devices', label: 'Client Device' },
  { to: '/client/url', label: 'Client URL' },
  { to: '/client/apk', label: 'Client APK' },
  { to: '/activity-logs', label: 'Activity Logs' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.message || 'Gagal logout.');
      setSigningOut(false);
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo" aria-hidden="true">RG</div>
        <div>
          <div className="brand-name">Rayan Guardian</div>
          <div className="brand-sub">Device Monitoring</div>
        </div>
      </div>

      <nav aria-label="Navigasi utama">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" title={user?.email || ''}>
          {user?.email || 'Tidak login'}
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        <Button variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
