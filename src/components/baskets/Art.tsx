import { STOCK_ASSETS } from "@/config/assets";
import { TokenLogo } from "@/components/ui/TokenLogo";

/* Decorative pieces for the baskets pages, all drawn here. */

/** Logos scattered around the hero, kept clear of the centred headline. */
const SPOTS: [number, number, number, number][] = [
  // left%, top%, size px, opacity
  [2, 10, 34, 0.9], [7, 34, 26, 0.5], [3, 62, 40, 0.95], [12, 80, 24, 0.45], [16, 18, 22, 0.4],
  [20, 58, 30, 0.7], [26, 6, 38, 0.95], [30, 86, 28, 0.6], [36, 2, 22, 0.35], [63, 4, 30, 0.8],
  [70, 88, 34, 0.9], [74, 16, 22, 0.4], [78, 60, 26, 0.55], [83, 32, 36, 0.95], [88, 8, 28, 0.7],
  [91, 70, 40, 0.95], [95, 42, 24, 0.5], [97, 18, 30, 0.8], [58, 92, 22, 0.4], [44, 94, 26, 0.55],
];

export function LogoField() {
  const logos = STOCK_ASSETS.slice(0, SPOTS.length);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPOTS.map(([left, top, size, opacity], i) => {
        const a = logos[i % logos.length];
        return (
          <span
            key={i}
            className="absolute animate-float rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
            style={{ left: `${left}%`, top: `${top}%`, opacity, animationDelay: `${(i % 7) * -0.9}s`, filter: opacity < 0.6 ? "blur(1px)" : undefined }}
          >
            <TokenLogo src={a.logo} symbol={a.symbol} size={size} />
          </span>
        );
      })}
    </div>
  );
}

/** Three tilted planes: assets and venues feeding through the arbiter. */
export function PlanesArt() {
  const plane = (x: number, y: number, title: string, rows: string[], accent = false) => (
    <g transform={`translate(${x} ${y}) skewY(-14)`}>
      <rect width="170" height="250" rx="10" fill={accent ? "rgba(96,145,126,0.22)" : "rgba(11,23,18,0.92)"} stroke="rgba(255,255,255,0.22)" />
      <text x="16" y="30" fill="#f6f6f6" fontSize="14" fontWeight="500">
        {title}
      </text>
      {rows.map((r, i) => (
        <g key={r} transform={`translate(16 ${52 + i * 34})`}>
          <rect width="138" height="26" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <circle cx="14" cy="13" r="6" fill={accent ? "#fdfac3" : "#60917e"} opacity="0.85" />
          <text x="28" y="17.5" fill="rgba(255,255,255,0.75)" fontSize="11">
            {r}
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 560 420" className="h-auto w-full max-w-[560px]" role="img" aria-label="Assets and venues passing through the arbiter into one basket order">
      {plane(20, 160, "Assets", ["NVDA", "SPY", "GLD", "SGOV", "USDG"])}
      {plane(200, 110, "Arbiter", ["Oracle price", "Best venue", "Fairness check", "One order"], true)}
      {plane(380, 60, "Venues", ["Uniswap v3", "Uniswap v4", "Direct pools", "Two-hop routes"])}
      <g transform="translate(262 380)" className="text-parchment">
        <circle r="26" fill="#000f06" stroke="rgba(253,250,195,0.5)" />
        <g transform="translate(-12 -12)">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="#fdfac3">
            <path d="M13.2 3.5h5.6L29 28.5h-5.1L16 8.4 8.1 28.5H3L13.2 3.5Z" />
            <rect x="1" y="16.6" width="30" height="2.6" rx="1.3" />
          </svg>
        </g>
      </g>
    </svg>
  );
}
