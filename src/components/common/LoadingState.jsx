export default function LoadingState({ label = 'Memuat…', fullscreen = false }) {
  return (
    <div
      className="state-box"
      style={fullscreen ? { minHeight: '100vh', border: 'none' } : undefined}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
