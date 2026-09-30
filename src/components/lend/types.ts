import type { LendMarketId } from "@/config/lend";

/** One collateral row as the lend pages render it: proposed parameters plus live price. */
export type LendRow = {
  symbol: string;
  name: string;
  logo: string;
  tier: string;
  market: LendMarketId;
  price: number | null;
  liquidityUsd: number;
  maxLtv: number;
  liqLtv: number;
  penalty: number;
  maxLeverage: number;
};
