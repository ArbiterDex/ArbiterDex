import { STOCK_ASSETS, type Asset } from "@/config/assets";

/* Lending on Arbiter DEX is not live. These are PROPOSED risk parameters for
   the first markets, published so holders can see and discuss them before
   launch. Rates are set by utilisation once markets open, so none are shown. */

export type LendMarketId = "equities" | "metals";

export const LEND_MARKETS: { id: LendMarketId; name: string; blurb: string; debt: string }[] = [
  { id: "equities", name: "Equities Market", blurb: "Stock Tokens and index funds as collateral, USDG to borrow.", debt: "USDG" },
  { id: "metals", name: "Treasury and Metals Market", blurb: "Treasuries and metals as collateral, USDG to borrow.", debt: "USDG" },
];

/** Names that move a lot day to day get a lower loan-to-value. */
const VOLATILE = new Set(["IONQ", "RGTI", "RKLB", "CLSK", "MSTR", "GME", "USAR", "CRWV", "NBIS", "SNDK", "CRCL", "COIN"]);
const MEGACAP = new Set(["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSM", "ORCL"]);

export type LendParams = {
  asset: Asset;
  market: LendMarketId;
  /** Proposed maximum loan-to-value when borrowing, percent. */
  maxLtv: number;
  /** Proposed liquidation loan-to-value, percent. */
  liqLtv: number;
  /** Proposed liquidation penalty, percent. */
  penalty: number;
  tier: "Treasury" | "Index fund" | "Metal" | "Megacap" | "Large cap" | "Volatile";
};

function params(asset: Asset): LendParams {
  const s = asset.symbol;
  if (s === "SGOV") return { asset, market: "metals", maxLtv: 85, liqLtv: 90, penalty: 3, tier: "Treasury" };
  if (s === "GLD" || s === "SLV") return { asset, market: "metals", maxLtv: s === "GLD" ? 70 : 60, liqLtv: s === "GLD" ? 78 : 70, penalty: 5, tier: "Metal" };
  if (s === "USO") return { asset, market: "metals", maxLtv: 45, liqLtv: 55, penalty: 8, tier: "Metal" };
  if (asset.category === "ETFs") return { asset, market: "equities", maxLtv: s === "EWY" ? 55 : 70, liqLtv: s === "EWY" ? 65 : 78, penalty: 5, tier: "Index fund" };
  if (VOLATILE.has(s)) return { asset, market: "equities", maxLtv: 30, liqLtv: 40, penalty: 10, tier: "Volatile" };
  if (MEGACAP.has(s)) return { asset, market: "equities", maxLtv: 60, liqLtv: 70, penalty: 6, tier: "Megacap" };
  return { asset, market: "equities", maxLtv: 50, liqLtv: 60, penalty: 7, tier: "Large cap" };
}

export const LEND_ASSETS: LendParams[] = STOCK_ASSETS.map(params).sort((a, b) => b.maxLtv - a.maxLtv || a.asset.symbol.localeCompare(b.asset.symbol));

export const lendBySlug = (slug: string) => LEND_ASSETS.find((p) => p.asset.symbol.toLowerCase() === slug.toLowerCase()) ?? null;

/** Highest leverage a loop can reach at a given max LTV: 1 / (1 - LTV). */
export const maxLeverage = (maxLtvPct: number) => Math.floor((1 / (1 - maxLtvPct / 100)) * 100) / 100;
