import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState label="Memeriksa sesi…" fullscreen />;
  }

  if (status === 'unconfigured') {
    return (
      <ErrorState
        fullscreen
        title="Firebase belum dikonfigurasi"
        message="Aplikasi tidak dapat melakukan autentikasi karena environment Firebase belum diisi. Hubungi administrator deployment."
      />
    );
  }

  if (status !== 'signed_in') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
