export function Spinner({ size = "md", label = "Loading" }) {
  return (
    <span
      className={`spinner spinner-${size}`}
      role="status"
      aria-label={label}
    >
      <span className="spinner-ring" aria-hidden="true" />
    </span>
  );
}

export function ButtonLoader({ label = "Please wait" }) {
  return (
    <span className="btn-loader">
      <Spinner size="sm" label={label} />
      <span>{label}</span>
    </span>
  );
}

export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-card">
        <Spinner size="lg" label={message} />
        <p>{message}</p>
      </div>
    </div>
  );
}

export function FullScreenLoader({ message = "Loading panel…" }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen-inner">
        <div className="brand-mark" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <Spinner size="lg" label={message} />
        <p>{message}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = "", style }) {
  return <div className={`skeleton ${className}`.trim()} style={style} />;
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="stats-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card skeleton-card" key={i}>
          <Skeleton style={{ width: "42%", height: 12 }} />
          <Skeleton style={{ width: "58%", height: 28, marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      <div className="table-skeleton-head">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} style={{ height: 10, width: `${70 - i * 6}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div className="table-skeleton-row" key={row}>
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              style={{ height: 12, width: `${80 - ((row + col) % 3) * 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
