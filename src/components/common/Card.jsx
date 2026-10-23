export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header className="card-title">
          <span>{title}</span>
          {actions}
        </header>
      )}
      {subtitle && <p className="card-sub">{subtitle}</p>}
      {children}
    </section>
  );
}
