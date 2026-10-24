export default function Skeleton({ height = 20, width = '100%', radius = 6, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--bg-2) 0%, var(--bg-3) 50%, var(--bg-2) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/** Composite skeleton for card-like data. */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton height={14} width="40%" />
      <div style={{ height: 8 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ marginTop: 8 }}>
          <Skeleton height={12} width={`${100 - i * 12}%`} />
        </div>
      ))}
    </div>
  );
}
