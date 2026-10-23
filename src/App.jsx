import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DevicesPage from './pages/DevicesPage.jsx';
import DeviceDetailPage from './pages/DeviceDetailPage.jsx';
import ActivityLogsPage from './pages/ActivityLogsPage.jsx';
import ClientUrlPage from './pages/ClientUrlPage.jsx';
import ClientApkPage from './pages/ClientApkPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const { status } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={status === 'signed_in' ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/client/url" element={<ClientUrlPage />} />
        <Route path="/client/apk" element={<ClientApkPage />} />
        <Route path="/activity-logs" element={<ActivityLogsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
