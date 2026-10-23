export default function EmptyState({ title = 'Belum ada data', message, action }) {
  return (
    <div className="state-box" role="status">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
