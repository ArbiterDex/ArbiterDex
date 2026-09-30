import "server-only";
import { ALL_ASSETS, WETH_ADDRESS, assetByAddress } from "@/config/assets";
import { USDG } from "@/config/tokens";
import { batch, ethCall } from "@/lib/chain-server";
import { readOracles, readVenues, type Venue } from "@/lib/market-server";

/* Extra on-chain reads for the Markets pages: fee tiers of Uniswap v3 style
   pools and recent Swap events. Everything here reads Robinhood Chain directly. */

const isPoolAddress = (a: string) => /^0x[0-9a-fA-F]{40}$/.test(a);
const SEL = { fee: "0xddca3f43", token0: "0x0dfe1681", token1: "0xd21220a7" };

let feeCache: { at: number; value: Record<string, number | null> } | null = null;

/** Fee tier in hundredths of a bip (500 = 0.05%) for every v3 pool; null when unreadable. */
export async function readPoolFees(pairs: string[]): Promise<Record<string, number | null>> {
  const wanted = pairs.filter(isPoolAddress).map((p) => p.toLowerCase());
  if (feeCache && Date.now() - feeCache.at < 10 * 60_000 && wanted.every((p) => p in feeCache!.value)) return feeCache.value;
  const out: Record<string, number | null> = { ...(feeCache?.value ?? {}) };
  try {
    const results = await batch(wanted.map((p) => ethCall(p, SEL.fee)));
    wanted.forEach((p, i) => {
      const hex = results[i];
      out[p] = hex && hex.length >= 66 ? Number(BigInt(hex.slice(0, 66))) : null;
    });
    if (results.some(Boolean)) feeCache = { at: Date.now(), value: out };
  } catch {
    for (const p of wanted) out[p] ??= null;
  }
  return out;
}

export type Settlement = {
  tx: string;
  block: number;
  time: number | null;
  symbol: string;
  logo: string;
  quote: string;
  dex: string;
  side: "Buy" | "Sell";
  size: number;
  price: number;
  valueUsd: number | null;
  pool: string;
};

const SWAP_TOPIC = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

function signed256(hex: string): bigint {
  const v = BigInt("0x" + hex);
  return v >= 1n << 255n ? v - (1n << 256n) : v;
}

type Log = { address: string; data: string; blockNumber: string; transactionHash: string; logIndex: string };

/**
 * Recent swaps in the v3 pools of verified stock tokens. These are
 * settlements on the venues Arbiter DEX compares, whoever sent them.
 */
export async function readSettlements(limit = 60, onlyPair?: string): Promise<{ rows: Settlement[]; pools: number; fromBlock: number; toBlock: number } | null> {
  try {
    const venues = await readVenues();
    const pools: (Venue & { symbol: string })[] = [];
    for (const [symbol, list] of Object.entries(venues)) {
      if (symbol === "ETH" && !onlyPair) continue;
      for (const v of list) if (v.version.includes("V3") && isPoolAddress(v.pair)) pools.push({ ...v, symbol });
    }
    if (!pools.length) return null;
    const top = onlyPair
      ? pools.filter((p) => p.pair.toLowerCase() === onlyPair.toLowerCase())
      : pools.sort((a, b) => b.volume24h - a.volume24h).slice(0, 40);
    if (!top.length) return null;

    const meta = await batch([{ method: "eth_blockNumber", params: [] }, ...top.flatMap((p) => [ethCall(p.pair, SEL.token0), ethCall(p.pair, SEL.token1)])]);
    const latest = Number(BigInt(meta[0]!));
    const tokenOf = (hex: string | null) => (hex ? "0x" + hex.slice(-40) : "");

    let logs: Log[] = [];
    let span = 4000;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const [res] = await batch([
          {
            method: "eth_getLogs",
            params: [{ address: top.map((p) => p.pair), topics: [SWAP_TOPIC], fromBlock: "0x" + (latest - span).toString(16), toBlock: "0x" + latest.toString(16) }],
          },
        ]);
        const got = res as unknown as Log[] | null;
        if (Array.isArray(got)) {
          logs = got;
          break;
        }
        span = Math.floor(span / 4);
      } catch {
        span = Math.floor(span / 4);
      }
    }

    logs.sort((a, b) => Number(BigInt(b.blockNumber)) - Number(BigInt(a.blockNumber)) || Number(BigInt(b.logIndex)) - Number(BigInt(a.logIndex)));
    logs = logs.slice(0, limit);

    const oracles = await readOracles().catch(() => ({}) as Awaited<ReturnType<typeof readOracles>>);
    const ethUsd = oracles.ETH?.price ?? null;

    const blocks = [...new Set(logs.map((l) => l.blockNumber))].slice(0, 30);
    const blockRes = blocks.length ? await batch(blocks.map((b) => ({ method: "eth_getBlockByNumber", params: [b, false] }))).catch(() => []) : [];
    const times = new Map<string, number>();
    blocks.forEach((b, i) => {
      const blk = blockRes[i] as unknown as { timestamp?: string } | null;
      if (blk?.timestamp) times.set(b, Number(BigInt(blk.timestamp)));
    });

    const rows: Settlement[] = [];
    for (const log of logs) {
      const idx = top.findIndex((p) => p.pair.toLowerCase() === log.address.toLowerCase());
      if (idx < 0) continue;
      const pool = top[idx];
      const t0 = tokenOf(meta[1 + idx * 2]);
      const t1 = tokenOf(meta[2 + idx * 2]);
      const a0 = signed256(log.data.slice(2, 66));
      const a1 = signed256(log.data.slice(66, 130));
      const stock = ALL_ASSETS.find((a) => a.symbol === pool.symbol);
      if (!stock) continue;
      const stockAddr = stock.symbol === "ETH" ? WETH_ADDRESS : stock.address;
      const stockIs0 = t0.toLowerCase() === stockAddr.toLowerCase();
      const stockAmt = stockIs0 ? a0 : a1;
      const quoteAmt = stockIs0 ? a1 : a0;
      const quoteAddr = (stockIs0 ? t1 : t0).toLowerCase();
      const quoteDecimals = quoteAddr === USDG.address.toLowerCase() ? 6 : assetByAddress(quoteAddr)?.decimals ?? 18;
      const size = Math.abs(Number(stockAmt)) / 10 ** stock.decimals;
      const quoteSize = Math.abs(Number(quoteAmt)) / 10 ** quoteDecimals;
      if (!size) continue;
      const quoteUsd = quoteAddr === USDG.address.toLowerCase() ? 1 : quoteAddr === WETH_ADDRESS.toLowerCase() ? ethUsd : null;
      rows.push({
        tx: log.transactionHash,
        block: Number(BigInt(log.blockNumber)),
        time: times.get(log.blockNumber) ?? null,
        symbol: stock.symbol,
        logo: stock.logo,
        quote: pool.quote,
        dex: pool.dex,
        // Stock flowing into the pool means the trader sold it.
        side: stockAmt > 0n ? "Sell" : "Buy",
        size,
        price: quoteUsd ? (quoteSize / size) * quoteUsd : quoteSize / size,
        valueUsd: quoteUsd ? quoteSize * quoteUsd : null,
        pool: pool.pair,
      });
    }
    return { rows, pools: top.length, fromBlock: latest - span, toBlock: latest };
  } catch {
    return null;
  }
}
