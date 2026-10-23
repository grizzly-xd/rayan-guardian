import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ maxWidth: 600, margin: '60px auto' }}>
      <EmptyState
        title="Halaman tidak ditemukan"
        message="URL yang Anda buka tidak tersedia pada aplikasi ini."
        action={
          <Link to="/">
            <Button variant="primary">Ke Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
