import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import ConnectionBadge from './ConnectionBadge.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">Rayan Guardian</div>
            <div className="topbar-sub">{user?.email || ''}</div>
          </div>
          <ConnectionBadge />
        </header>
        <main>
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
