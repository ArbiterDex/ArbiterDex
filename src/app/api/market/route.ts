import { NextResponse } from "next/server";
import { readMarket } from "@/lib/market-server";

export const dynamic = "force-dynamic";

/** Oracle price, venues and supply for every listed asset. */
export async function GET() {
  const market = await readMarket();
  return NextResponse.json(market, { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } });
}
