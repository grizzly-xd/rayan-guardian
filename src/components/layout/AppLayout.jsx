import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('rayan_guardian_sidebar_collapsed') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapse() {
    setCollapsed((v) => {
      const next = !v;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rayan_guardian_sidebar_collapsed', next ? '1' : '0');
      }
      return next;
    });
  }

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed-shell' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="main-area">
        <Topbar onMobileOpen={() => setMobileOpen(true)} />
        <main>
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
