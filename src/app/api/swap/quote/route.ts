import { NextResponse } from "next/server";
import { assetBySymbol } from "@/config/assets";
import { batch, ethCall } from "@/lib/chain-server";
import { readOracles } from "@/lib/market-server";
import { UNISWAP, candidates, decodeQuote, quoteCalldata } from "@/lib/uniswap";
import { rule } from "@/lib/verdict";
import { parseUnits } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Quotes every Uniswap v3 route for an exact-input swap on Robinhood Chain and
 * rules on the best one against Chainlink. `?from=ETH&to=NVDA&amount=0.5`.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = assetBySymbol(params.get("from") ?? "");
  const to = assetBySymbol(params.get("to") ?? "");
  const amount = params.get("amount") ?? "";
  if (!from || !to || from.symbol === to.symbol) return NextResponse.json({ error: "Pick two different assets." }, { status: 400 });
  const amountIn = parseUnits(amount, from.decimals);
  if (amountIn === null || amountIn === 0n) return NextResponse.json({ error: "Enter an amount." }, { status: 400 });

  const routes = candidates(from, to);
  try {
    const [results, oracles] = await Promise.all([
      batch(routes.map((r) => ethCall(UNISWAP.quoterV2, quoteCalldata(r, amountIn)))),
      readOracles().catch(() => ({}) as Awaited<ReturnType<typeof readOracles>>),
    ]);
    const quotes = routes
      .map((route, i) => {
        const q = decodeQuote(route, results[i]);
        return q && q.amountOut > 0n ? { route, amountOut: q.amountOut.toString(), gasEstimate: Number(q.gasEstimate) } : null;
      })
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .sort((a, b) => (BigInt(b.amountOut) > BigInt(a.amountOut) ? 1 : -1));

    const pIn = oracles[from.symbol]?.price ?? null;
    const pOut = oracles[to.symbol]?.price ?? null;
    const inHuman = Number(amount);
    const fairOut = pIn && pOut ? (inHuman * pIn) / pOut : null;
    const best = quotes[0] ?? null;
    const bestOut = best ? Number(BigInt(best.amountOut)) / 10 ** to.decimals : null;
    const edgeBps = fairOut && bestOut !== null ? ((bestOut - fairOut) / fairOut) * 10_000 : null;

    return NextResponse.json({
      from: from.symbol,
      to: to.symbol,
      amountIn: amountIn.toString(),
      quotes,
      checked: routes.length,
      oracle: { from: oracles[from.symbol] ?? null, to: oracles[to.symbol] ?? null, fairOut },
      edgeBps,
      ruling: best ? rule(edgeBps) : null,
      at: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Quotes are unavailable right now. The chain could not be reached." }, { status: 502 });
  }
}
