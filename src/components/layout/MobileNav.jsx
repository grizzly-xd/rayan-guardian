import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/devices', label: 'Devices' },
  { to: '/client/url', label: 'URL' },
  { to: '/client/apk', label: 'APK' },
  { to: '/activity-logs', label: 'Logs' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navigasi bawah">
      <div className="mobile-nav-inner">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
