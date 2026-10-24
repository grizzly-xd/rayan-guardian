import { NavLink } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import Icon from '../common/Icon.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/devices', label: 'Devices', icon: 'devices' },
  { to: '/client/url', label: 'Client URL', icon: 'link' },
  { to: '/client/apk', label: 'Client APK', icon: 'download' },
  { to: '/activity-logs', label: 'Activity Logs', icon: 'logs' },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onMobileClose?.();
    },
    [onMobileClose]
  );

  useEffect(() => {
    if (!mobileOpen) return undefined;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, handleKey]);

  const cls = [
    'sidebar',
    collapsed ? 'sidebar-collapsed' : '',
    mobileOpen ? 'sidebar-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside className={cls} aria-label="Sidebar navigasi">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">RG</div>
          {!collapsed && (
            <div>
              <div className="brand-name">Rayan Guardian</div>
              <div className="brand-sub">Device Monitoring</div>
            </div>
          )}
          <button
            type="button"
            className="icon-btn sidebar-collapse-btn"
            aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
            onClick={onToggleCollapse}
          >
            <Icon name={collapsed ? 'chevronRight' : 'menu'} size={16} />
          </button>
          <button
            type="button"
            className="icon-btn sidebar-mobile-close"
            aria-label="Tutup navigasi"
            onClick={onMobileClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={18} className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
