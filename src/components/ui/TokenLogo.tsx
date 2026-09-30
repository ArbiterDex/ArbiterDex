/** Round asset logo. Plain <img>: next/image renders blank at icon sizes. */
export function TokenLogo({ src, symbol, size = 32, className = "" }: { src?: string | null; symbol: string; size?: number; className?: string }) {
  if (!src) {
    return (
      <span className={`grid shrink-0 place-items-center rounded-full bg-white/[0.08] font-medium text-ink-2 ${className}`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {symbol.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-white object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Small overlapping stack of logos, as in "NVDA, TSLA, AAPL and more". */
export function LogoStack({ items, size = 24 }: { items: { src: string; symbol: string }[]; size?: number }) {
  return (
    <span className="flex">
      {items.map((it, i) => (
        <span key={it.symbol} className="rounded-full ring-2 ring-night" style={{ marginLeft: i ? -size * 0.3 : 0 }}>
          <TokenLogo src={it.src} symbol={it.symbol} size={size} />
        </span>
      ))}
    </span>
  );
}
