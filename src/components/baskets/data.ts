import "server-only";
import { assetBySymbol } from "@/config/assets";
import type { IndexBasket, Leg, StrategyBasket } from "@/config/baskets";
import type { Market, MarketRow } from "@/lib/market-server";

/* Prices every leg of a basket from the live market read. The weighted 24h
   change only counts legs that have a venue change; `coverage` says how much
   of the basket that was, so the UI never presents a partial figure as whole. */

export type PricedLeg = {
  symbol: string;
  name: string;
  logo: string;
  weight: number;
  price: number | null;
  change24h: number | null;
  liquidityUsd: number;
  volume24h: number;
};

export type PricedBasket = {
  legs: PricedLeg[];
  /** Weighted 24h change across legs with data, percent. */
  change24h: number | null;
  /** Share of the basket's weight that had a 24h change, 0 to 1. */
  coverage: number;
  /** Share of weight with a live oracle price, 0 to 1. */
  priced: number;
  liquidityUsd: number;
  volume24h: number;
};

export function priceLegs(legs: Leg[], market: Market): PricedBasket {
  const rows = new Map<string, MarketRow>(market.rows.map((r) => [r.symbol, r]));
  const priced: PricedLeg[] = legs.map((leg) => {
    const row = rows.get(leg.symbol);
    const asset = assetBySymbol(leg.symbol);
    return {
      symbol: leg.symbol,
      name: asset?.name ?? leg.symbol,
      logo: asset?.logo ?? "",
      weight: leg.weight,
      price: row?.oracle?.price ?? null,
      change24h: row?.change24h ?? null,
      liquidityUsd: row?.liquidityUsd ?? 0,
      volume24h: row?.volume24h ?? 0,
    };
  });
  const total = priced.reduce((s, l) => s + l.weight, 0) || 1;
  const withChange = priced.filter((l) => l.change24h !== null);
  const wChange = withChange.reduce((s, l) => s + l.weight, 0);
  return {
    legs: priced.sort((a, b) => b.weight - a.weight),
    change24h: wChange > 0 ? withChange.reduce((s, l) => s + l.weight * (l.change24h as number), 0) / wChange : null,
    coverage: wChange / total,
    priced: priced.filter((l) => l.price !== null).reduce((s, l) => s + l.weight, 0) / total,
    liquidityUsd: priced.reduce((s, l) => s + l.liquidityUsd, 0),
    volume24h: priced.reduce((s, l) => s + l.volume24h, 0),
  };
}

export type AnyBasket = IndexBasket | StrategyBasket;

export const basketHref = (b: AnyBasket) => (b.kind === "index" ? `/rwa-baskets/${b.symbol.toLowerCase()}` : `/rwa-baskets/automated/${b.slug}`);
export const basketId = (b: AnyBasket) => (b.kind === "index" ? b.symbol : b.slug);

/** Flattens a basket and its live pricing into the props the cards take. */
export function toCard(b: AnyBasket, market: Market): import("@/components/baskets/Cards").CardData {
  const p = priceLegs(b.legs, market);
  return {
    id: basketId(b),
    kind: b.kind,
    href: basketHref(b),
    name: b.name,
    ticker: b.kind === "index" ? b.symbol : undefined,
    group: b.kind === "automated" ? b.group : undefined,
    rule: b.kind === "automated" ? b.rule : "Index",
    summary: b.summary,
    glyph: b.glyph,
    legs: p.legs.map((l) => ({ symbol: l.symbol, logo: l.logo, weight: l.weight })),
    change24h: p.change24h,
    coverage: p.coverage,
    liquidityUsd: p.liquidityUsd,
  };
}
