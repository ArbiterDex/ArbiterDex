import { STOCK_ASSETS } from "@/config/assets";

/* Decorative pieces for the launchpad pages. Logos are the real Stock Token
   marks listed on Robinhood Chain; positions are fixed so the server and the
   browser render the same field. */

const FIELD = [
  { s: "NVDA", x: 12, y: 8, size: 56, o: 1 },
  { s: "AAPL", x: 30, y: 2, size: 44, o: 0.55 },
  { s: "TSLA", x: 48, y: 5, size: 46, o: 0.5 },
  { s: "GME", x: 62, y: 10, size: 62, o: 1 },
  { s: "META", x: 80, y: 3, size: 44, o: 0.45 },
  { s: "AMZN", x: 8, y: 26, size: 48, o: 0.6 },
  { s: "ORCL", x: 50, y: 28, size: 64, o: 1 },
  { s: "COIN", x: 74, y: 30, size: 40, o: 0.35 },
  { s: "MSFT", x: 92, y: 18, size: 42, o: 0.4 },
  { s: "ASML", x: 2, y: 50, size: 54, o: 0.9 },
  { s: "SPCX", x: 38, y: 48, size: 62, o: 1 },
  { s: "INTC", x: 64, y: 52, size: 40, o: 0.35 },
  { s: "CRCL", x: 86, y: 50, size: 60, o: 1 },
  { s: "AMD", x: 12, y: 74, size: 52, o: 0.85 },
  { s: "MSTR", x: 30, y: 70, size: 62, o: 1 },
  { s: "PLTR", x: 6, y: 64, size: 50, o: 0.95 },
  { s: "GOOGL", x: 56, y: 78, size: 42, o: 0.4 },
  { s: "TSM", x: 80, y: 76, size: 62, o: 1 },
  { s: "SPY", x: 44, y: 92, size: 58, o: 1 },
  { s: "QQQ", x: 70, y: 94, size: 44, o: 0.45 },
  { s: "MU", x: 94, y: 88, size: 46, o: 0.5 },
  { s: "RKLB", x: 20, y: 90, size: 44, o: 0.4 },
  { s: "GLD", x: 96, y: 36, size: 40, o: 0.3 },
];

/** Floating field of stock-token logos for the launchpad hero. */
export function LogoField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {FIELD.map((f, i) => (
        <span
          key={f.s}
          className="absolute animate-float"
          style={{ left: `${f.x}%`, top: `${f.y}%`, opacity: f.o, filter: f.o < 0.7 ? "blur(1.5px)" : undefined, animationDelay: `${(i % 7) * -0.9}s` }}
        >
          <img
            src={`/tokens/${f.s.toLowerCase()}.webp`}
            alt=""
            width={f.size}
            height={f.size}
            className="rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-4 ring-black/40"
            style={{ width: f.size, height: f.size }}
          />
        </span>
      ))}
    </div>
  );
}

/** Endless strip of listed tickers under the hero. */
export function TickerStrip() {
  const list = STOCK_ASSETS.slice(0, 28);
  const row = [...list, ...list];
  return (
    <div className="relative overflow-hidden border-y border-line py-3.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-9">
        {row.map((a, i) => (
          <span key={`${a.symbol}-${i}`} className="flex items-center gap-2 text-[13px] text-ink-2">
            <img src={a.logo} alt="" width={20} height={20} className="size-5 rounded-full bg-white" />
            {a.symbol}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Dotted backdrop used behind the closing call to action. */
export function DotGrid() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]">
      <defs>
        <pattern id="lp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.14)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-dots)" />
    </svg>
  );
}

/** A placeholder token avatar: a soft sage orb, never someone else's art. */
export function TokenOrb({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: "radial-gradient(circle at 30% 30%, #fdfac3, #60917e 55%, #13281f 100%)" }}
    />
  );
}

/** Small uppercase section label, as used across the launchpad. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-2">{children}</p>;
}
