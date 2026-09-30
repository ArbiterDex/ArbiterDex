import "server-only";
import { LEND_ASSETS, maxLeverage, type LendParams } from "@/config/lend";
import type { Market } from "@/lib/market-server";
import type { LendRow } from "@/components/lend/types";

/** Joins the proposed parameters with the live oracle price and venue depth. */
export function lendRow(p: LendParams, market: Market): LendRow {
  const row = market.rows.find((r) => r.symbol === p.asset.symbol);
  return {
    symbol: p.asset.symbol,
    name: p.asset.name,
    logo: p.asset.logo,
    tier: p.tier,
    market: p.market,
    price: row?.oracle?.price ?? null,
    liquidityUsd: row?.liquidityUsd ?? 0,
    maxLtv: p.maxLtv,
    liqLtv: p.liqLtv,
    penalty: p.penalty,
    maxLeverage: maxLeverage(p.maxLtv),
  };
}

export const lendRows = (market: Market) => LEND_ASSETS.map((p) => lendRow(p, market));
