import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profil Saya</h1>
        <p>Informasi akun yang sedang login.</p>
      </div>
      <Card title="Akun">
        <dl className="kv-grid">
          <dt>UID</dt><dd className="mono">{user.uid}</dd>
          <dt>Email</dt><dd>{user.email || '—'}</dd>
          <dt>Nama tampilan</dt><dd>{user.displayName || 'Belum diatur'}</dd>
        </dl>
        <div className="divider" />
        <Link to="/profile/edit">
          <Button variant="primary">Edit Profil</Button>
        </Link>
      </Card>
    </div>
  );
}
