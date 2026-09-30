import "server-only";
import { cache } from "react";
import { CHAIN, serverRpc } from "@/config/brand";
import { TOKENS, USDG, type PayToken } from "@/config/tokens";

/* Server-side chain reads: Chainlink prices, wallet balances and chain facts.
   One JSON-RPC batch per request, configured endpoint first, public fallback
   second. Nothing here needs a key. */

type RpcCall = { method: string; params: unknown[] };

// An endpoint that just failed sits out for a minute, so every read does not
// pay its timeout again. Some networks intercept the primary host's DNS.
const benched = new Map<string, number>();
const BENCH_MS = 60_000;

function endpoints() {
  const all = [serverRpc(), CHAIN.fallbackRpc].filter((url, i, list) => list.indexOf(url) === i);
  const now = Date.now();
  const ready = all.filter((url) => (benched.get(url) ?? 0) < now);
  return ready.length ? ready : all;
}

export async function batch(calls: RpcCall[]): Promise<(string | null)[]> {
  if (calls.length === 0) return [];
  let lastError: unknown;
  for (const url of endpoints()) {
    try {
      const out: (string | null)[] = new Array(calls.length).fill(null);
      // Chunked: public endpoints reject large batches with an HTML error page.
      for (let start = 0; start < calls.length; start += 20) {
        const chunk = calls.slice(start, start + 20);
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(chunk.map((c, i) => ({ jsonrpc: "2.0", id: start + i, method: c.method, params: c.params }))),
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`rpc ${res.status}`);
        const body = (await res.json()) as { id: number; result?: string }[];
        if (!Array.isArray(body)) throw new Error("rpc batch unsupported");
        for (const item of body) out[item.id] = item.result ?? null;
      }
      return out;
    } catch (error) {
      benched.set(url, Date.now() + BENCH_MS);
      lastError = error;
    }
  }
  throw lastError;
}

export const ethCall = (to: string, data: string): RpcCall => ({ method: "eth_call", params: [{ to, data }, "latest"] });
const pad = (address: string) => address.toLowerCase().replace(/^0x/, "").padStart(64, "0");

function word(hex: string | null, index: number): bigint | null {
  if (!hex || hex.length < 2 + (index + 1) * 64) return null;
  return BigInt("0x" + hex.slice(2 + index * 64, 2 + (index + 1) * 64));
}

const SEL = {
  latestRoundData: "0xfeaf968c",
  balanceOf: "0x70a08231",
  totalSupply: "0x18160ddd",
};

/** USD price per token from Chainlink; USDG is 1. Missing feeds are left out. */
export async function readPrices(tokens: PayToken[] = TOKENS): Promise<Record<string, number>> {
  const priced = tokens.filter((t) => t.feed);
  const results = await batch(priced.map((t) => ethCall(t.feed!, SEL.latestRoundData)));
  const prices: Record<string, number> = {};
  priced.forEach((t, i) => {
    const answer = word(results[i], 1);
    if (answer && answer > 0n) prices[t.address.toLowerCase()] = Number(answer) / 1e8;
  });
  if (tokens.includes(USDG)) prices[USDG.address.toLowerCase()] = 1;
  return prices;
}

/** Raw balances (as decimal strings) of every payable token for one wallet. */
export async function readBalances(owner: string): Promise<Record<string, string>> {
  const calls = TOKENS.map((t) =>
    t.kind === "eth"
      ? { method: "eth_getBalance", params: [owner, "latest"] }
      : ethCall(t.address, SEL.balanceOf + pad(owner)),
  );
  const results = await batch(calls);
  const out: Record<string, string> = {};
  TOKENS.forEach((t, i) => {
    const hex = results[i];
    if (!hex || hex === "0x") return;
    const value = BigInt(hex);
    if (value > 0n) out[t.address.toLowerCase()] = value.toString();
  });
  return out;
}

export type ChainFacts = {
  blockTime: number | null;
  gasPriceGwei: number | null;
  usdgSupply: number | null;
  ethUsd: number | null;
  readAt: string;
};

/** Live facts for the landing page: block time, gas price, USDG in circulation. */
export const readChainFacts = cache(async (): Promise<ChainFacts> => {
  const readAt = new Date().toISOString();
  try {
    const [latestHex, gasHex, supplyHex] = await batch([
      { method: "eth_blockNumber", params: [] },
      { method: "eth_gasPrice", params: [] },
      ethCall(USDG.address, SEL.totalSupply),
    ]);
    const latest = latestHex ? Number(BigInt(latestHex)) : null;
    let blockTime: number | null = null;
    if (latest) {
      const span = 2000;
      const [a, b] = await batch([
        { method: "eth_getBlockByNumber", params: ["0x" + latest.toString(16), false] },
        { method: "eth_getBlockByNumber", params: ["0x" + (latest - span).toString(16), false] },
      ]);
      const ta = a ? Number(BigInt((a as unknown as { timestamp: string }).timestamp)) : null;
      const tb = b ? Number(BigInt((b as unknown as { timestamp: string }).timestamp)) : null;
      if (ta && tb && ta > tb) blockTime = (ta - tb) / span;
    }
    const prices = await readPrices(TOKENS.filter((t) => t.kind === "eth")).catch(() => ({}) as Record<string, number>);
    return {
      blockTime,
      gasPriceGwei: gasHex ? Number(BigInt(gasHex)) / 1e9 : null,
      usdgSupply: supplyHex && supplyHex !== "0x" ? Number(BigInt(supplyHex)) / 1e6 : null,
      ethUsd: Object.values(prices)[0] ?? null,
      readAt,
    };
  } catch {
    return { blockTime: null, gasPriceGwei: null, usdgSupply: null, ethUsd: null, readAt };
  }
});
