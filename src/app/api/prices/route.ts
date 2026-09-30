import { NextResponse } from "next/server";
import { TOKENS, tokenByAddress } from "@/config/tokens";
import { readPrices } from "@/lib/chain-server";

export const dynamic = "force-dynamic";

/** USD prices from Chainlink. `?tokens=` narrows the list; omitted means all. */
export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("tokens");
  const tokens = param
    ? param.split(",").map((a) => tokenByAddress(a.trim())).filter((t): t is NonNullable<typeof t> => t !== null)
    : TOKENS;
  try {
    const prices = await readPrices(tokens);
    return NextResponse.json({ prices }, { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch {
    return NextResponse.json({ prices: {}, error: "Prices are unavailable right now." }, { status: 502 });
  }
}
