import { ASSETS } from "@/config/assets.generated";

/* Low-level token list used by the chain readers. Stock Tokens come from the
   verified registry (each one proxies to Robinhood's token beacon and has a
   Chainlink feed); ETH and USDG are added by hand. Addresses were checked
   on-chain. Pages use config/assets.ts, which adds categories and logos. */

export type Kind = "stock" | "eth" | "usd";

export type PayToken = {
  symbol: string;
  name: string;
  /** Zero address for native ETH. */
  address: `0x${string}`;
  decimals: number;
  kind: Kind;
  /** Chainlink USD feed; USDG has none and is priced at 1. */
  feed: `0x${string}` | null;
};

export const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const USDG: PayToken = {
  symbol: "USDG",
  name: "Global Dollar",
  address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  decimals: 6,
  kind: "usd",
  feed: null,
};

export const ETH: PayToken = {
  symbol: "ETH",
  name: "Ether",
  address: ZERO,
  decimals: 18,
  kind: "eth",
  feed: "0x78F3556b67E17Df817D51Ef5a990cDaF09E8d3A9",
};

export const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as const;

export const STOCKS: PayToken[] = ASSETS.map((a) => ({
  symbol: a.symbol,
  name: a.name,
  address: a.address,
  decimals: 18,
  kind: "stock",
  feed: a.feed,
}));

export const TOKENS: PayToken[] = [...STOCKS, ETH, USDG];

const byAddress = new Map(TOKENS.map((t) => [t.address.toLowerCase(), t]));
const bySymbol = new Map(TOKENS.map((t) => [t.symbol, t]));

export const tokenByAddress = (address: string) => byAddress.get(address.toLowerCase()) ?? null;
export const tokenBySymbol = (symbol: string) => bySymbol.get(symbol) ?? null;
