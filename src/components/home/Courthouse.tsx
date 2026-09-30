/** Engraved-style courthouse facade drawn in thin sage lines. Decorative. */
export function Courthouse({ className = "" }: { className?: string }) {
  const columns = Array.from({ length: 8 }, (_, i) => 70 + i * 60);
  return (
    <svg viewBox="0 0 560 420" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      {/* Pediment */}
      <path d="M30 118 280 30l250 88Z" />
      <path d="M62 112 280 42l218 70Z" opacity="0.6" />
      <circle cx="280" cy="86" r="16" opacity="0.7" />
      <path d="M268 86h24M280 74v24" opacity="0.5" />
      {/* Entablature */}
      <rect x="30" y="118" width="500" height="22" />
      <rect x="40" y="140" width="480" height="16" />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d={`M${48 + i * 20} 142v12`} opacity="0.45" />
      ))}
      {/* Columns with fluting */}
      {columns.map((x) => (
        <g key={x}>
          <rect x={x - 17} y="156" width="34" height="10" />
          <path d={`M${x - 14} 166v196M${x + 14} 166v196`} />
          <path d={`M${x - 7} 170v188M${x} 170v188M${x + 7} 170v188`} opacity="0.35" />
          <rect x={x - 18} y="362" width="36" height="10" />
        </g>
      ))}
      {/* Steps */}
      <path d="M20 372h520v14H20zM8 386h544v14H8zM0 400h560v14H0z" />
      {/* Door */}
      <path d="M262 362V250a18 18 0 0 1 36 0v112" opacity="0.5" />
    </svg>
  );
}
