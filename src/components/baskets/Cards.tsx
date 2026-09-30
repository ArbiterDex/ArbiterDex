import Link from "next/link";
import type { GlyphName } from "@/config/baskets";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { ArrowRight } from "@/components/icons";
import { pct } from "@/lib/format";
import { GlyphDisc, GlyphTile } from "@/components/baskets/Glyph";

/* Plain presentational pieces, safe to render from server or client. */

export type CardLeg = { symbol: string; logo: string; weight: number };

export type CardData = {
  id: string;
  kind: "index" | "automated";
  href: string;
  name: string;
  ticker?: string;
  group?: string;
  rule?: string;
  summary: string;
  glyph: GlyphName;
  legs: CardLeg[];
  change24h: number | null;
  coverage: number;
  liquidityUsd: number;
};

const SHADES = ["#fdfac3", "#7fb09c", "#60917e", "#3f7a64", "#286650", "#a9c9b8", "#d8d49a", "#1d4d3c", "#8aa89b", "#c9c58a"];

/** Stacked target-weight bar: the basket's shape at a glance, in place of a price chart. */
export function AllocationBar({ legs, height = 10 }: { legs: CardLeg[]; height?: number }) {
  const total = legs.reduce((s, l) => s + l.weight, 0) || 1;
  return (
    <div className="flex w-full overflow-hidden rounded-full bg-white/[0.05]" style={{ height }} role="img" aria-label={legs.map((l) => `${l.symbol} ${l.weight}%`).join(", ")}>
      {legs.map((l, i) => (
        <span key={l.symbol} className="h-full border-r border-night last:border-r-0" style={{ width: `${(l.weight / total) * 100}%`, background: SHADES[i % SHADES.length] }} />
      ))}
    </div>
  );
}

export const shade = (i: number) => SHADES[i % SHADES.length];

export function Change({ value, label, className = "" }: { value: number | null; label?: string; className?: string }) {
  const tone = value === null ? "text-mute" : value >= 0 ? "text-up" : "text-down";
  return (
    <span className={`text-right ${className}`}>
      <span className={`num block text-[14px] font-medium ${tone}`}>{value === null ? "—" : pct(value)}</span>
      {label ? <span className="block text-[11.5px] text-mute">{label}</span> : null}
    </span>
  );
}

export function LegLogos({ legs, max = 5, size = 20 }: { legs: CardLeg[]; max?: number; size?: number }) {
  const shown = legs.slice(0, max);
  return (
    <span className="flex items-center">
      {shown.map((l, i) => (
        <span key={l.symbol} className="rounded-full ring-2 ring-panel" style={{ marginLeft: i ? -size * 0.28 : 0 }}>
          <TokenLogo src={l.logo} symbol={l.symbol} size={size} />
        </span>
      ))}
      {legs.length > max ? <span className="ml-1.5 text-[12px] text-mute">+{legs.length - max}</span> : null}
    </span>
  );
}

/** Index basket card: weights, live 24h move, summary, and a Buy link. */
export function IndexCard({ b }: { b: CardData }) {
  return (
    <article className="card flex min-w-0 flex-col p-5">
      <div className="flex items-start gap-3">
        <GlyphTile name={b.glyph} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-medium leading-[1.25] tracking-[-0.01em]">
            <Link href={b.href} className="hover:text-parchment">
              {b.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[13px] text-mute">
            ${b.ticker} · {b.legs.length} legs
          </p>
        </div>
        <Change value={b.change24h} label={b.coverage > 0 && b.coverage < 1 ? "24h, partial" : "24h"} />
      </div>
      <div className="mt-6">
        <AllocationBar legs={b.legs} />
      </div>
      <div className="scroll-x mt-4 flex gap-1.5">
        {b.legs.slice(0, 4).map((l) => (
          <span key={l.symbol} className="chip !h-7 shrink-0 !bg-white/[0.04] !text-[12px]">
            <TokenLogo src={l.logo} symbol={l.symbol} size={16} />
            <span className="text-ink">{l.symbol}</span>
            <span>{l.weight.toFixed(1)}%</span>
          </span>
        ))}
      </div>
      <p className="mt-4 line-clamp-3 text-[14px] leading-[1.55] text-ink-2">{b.summary}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-mute">
          <span className="size-2 shrink-0 rounded-full bg-sage-2" />
          <span className="truncate">Robinhood Chain · oracle-priced</span>
        </span>
        <Link href={b.href} className="btn btn-ghost !h-8 shrink-0 !px-3 !text-[13px]">
          Buy <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

/** Automated strategy card: rule, legs and a drawn disc in place of a portrait. */
export function StrategyCard({ b }: { b: CardData }) {
  return (
    <Link href={b.href} className="card group relative flex min-h-[236px] min-w-0 flex-col overflow-hidden p-5 transition-colors hover:border-line-2">
      <h3 className="pr-24 text-[18px] font-medium leading-[1.25] tracking-[-0.01em] group-hover:text-parchment">{b.name}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-mute">
        <span className="size-1.5 rounded-full bg-sage-2" /> {b.legs.length} assets · {b.rule}
      </p>
      <span className="absolute right-4 top-12 sm:right-5">
        <GlyphDisc name={b.glyph} size={100} />
      </span>
      <div className="mt-auto pt-16">
        <LegLogos legs={b.legs} />
        <p className="mt-3">
          <Change value={b.change24h} className="!text-left" />
        </p>
        <p className="text-[12px] text-mute">Legs over 24h · preview</p>
      </div>
    </Link>
  );
}
