import Button from './Button.jsx';

export default function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kesalahan saat mengambil data dari server.',
  onRetry,
  fullscreen = false,
}) {
  return (
    <div
      className="state-box error"
      style={fullscreen ? { minHeight: '100vh', border: 'none' } : undefined}
      role="alert"
    >
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="ghost" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}
