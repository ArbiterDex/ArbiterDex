import { ASSETS } from "@/config/assets.generated";
import { ETH, USDG, WETH } from "@/config/tokens";

/* The asset universe Arbiter DEX can price today: every Robinhood Stock Token
   with a Chainlink feed on Robinhood Chain (verified on-chain, see
   assets.generated.ts), plus ETH and USDG. Categories drive the Markets menu. */

export type Category = "Stocks" | "ETFs" | "Commodities" | "Private Credit" | "Treasuries" | "Stablecoins" | "Crypto";

export const CATEGORIES: { key: Category; label: string; blurb: string }[] = [
  { key: "Stocks", label: "Stocks", blurb: "Single-company shares, tokenized one to one." },
  { key: "ETFs", label: "ETFs and Index Funds", blurb: "Whole indices and country funds in one token." },
  { key: "Commodities", label: "Commodities", blurb: "Gold, silver and oil exposure through listed funds." },
  { key: "Private Credit", label: "Private Credit", blurb: "Loan books and credit funds. None is live on Robinhood Chain yet." },
  { key: "Treasuries", label: "Treasuries", blurb: "Short-dated US government bills." },
];

const ETF = new Set(["SPY", "QQQ", "EWY"]);
const COMMODITY = new Set(["GLD", "SLV", "USO"]);
const TREASURY = new Set(["SGOV"]);

export type Asset = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  category: Category;
  /** Chainlink USD feed on Robinhood Chain; USDG has none and is priced at 1. */
  feed: `0x${string}` | null;
  issuer: "Robinhood" | "Paxos" | "Native";
  logo: string;
  /** Tokens trading under the same ticker that are not the verified contract. */
  lookalikes: number;
};

const categoryOf = (symbol: string): Category =>
  ETF.has(symbol) ? "ETFs" : COMMODITY.has(symbol) ? "Commodities" : TREASURY.has(symbol) ? "Treasuries" : "Stocks";

/** Short readable names; the generated list keeps the issuer's full ones. */
const SHORT: Record<string, string> = {
  SPCX: "SpaceX Class A",
  SPY: "SPDR S&P 500 ETF",
  SGOV: "iShares 0-3 Month Treasury",
  EWY: "iShares MSCI South Korea",
  TSM: "Taiwan Semiconductor",
  RKLB: "Rocket Lab",
  SNDK: "Sandisk",
  PLTR: "Palantir",
  CRCL: "Circle",
};

export const STOCK_ASSETS: Asset[] = ASSETS.map((a) => ({
  symbol: a.symbol,
  name: SHORT[a.symbol] ?? a.name,
  address: a.address,
  decimals: 18,
  category: categoryOf(a.symbol),
  feed: a.feed,
  issuer: "Robinhood",
  logo: `/tokens/${a.symbol.toLowerCase()}.webp`,
  lookalikes: a.lookalikes,
}));

export const ETH_ASSET: Asset = {
  symbol: "ETH",
  name: "Ether",
  address: ETH.address,
  decimals: 18,
  category: "Crypto",
  feed: ETH.feed,
  issuer: "Native",
  logo: "/tokens/eth.webp",
  lookalikes: 0,
};

export const USDG_ASSET: Asset = {
  symbol: "USDG",
  name: "Global Dollar",
  address: USDG.address,
  decimals: 6,
  category: "Stablecoins",
  feed: null,
  issuer: "Paxos",
  logo: "/tokens/usdg.webp",
  lookalikes: 0,
};

/** Everything the swap can route. */
export const ALL_ASSETS: Asset[] = [USDG_ASSET, ETH_ASSET, ...STOCK_ASSETS];

export const WETH_ADDRESS = WETH;

const bySymbol = new Map(ALL_ASSETS.map((a) => [a.symbol.toLowerCase(), a]));
const byAddress = new Map(ALL_ASSETS.map((a) => [a.address.toLowerCase(), a]));

export const assetBySymbol = (s: string) => bySymbol.get(s.toLowerCase()) ?? null;
export const assetByAddress = (a: string) => byAddress.get(a.toLowerCase()) ?? null;

/** Matches the `?category=` values the Markets menu links to. */
export function parseCategory(value: string | null | undefined): Category | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.startsWith("stock")) return "Stocks";
  if (v.startsWith("etf")) return "ETFs";
  if (v.startsWith("commod")) return "Commodities";
  if (v.startsWith("private")) return "Private Credit";
  if (v.startsWith("treas")) return "Treasuries";
  return null;
}

/** Tickers shown first wherever a short list is needed. */
export const FEATURED = ["NVDA", "TSLA", "AAPL", "SPCX", "SPY", "META", "GOOGL", "AMZN", "MSFT", "QQQ", "PLTR", "AMD", "COIN", "GLD", "SGOV", "MSTR"];
