import { NavLink } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/devices', label: 'Devices', icon: 'devices' },
  { to: '/client/url', label: 'URL', icon: 'link' },
  { to: '/client/apk', label: 'APK', icon: 'download' },
  { to: '/activity-logs', label: 'Logs', icon: 'logs' },
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
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
