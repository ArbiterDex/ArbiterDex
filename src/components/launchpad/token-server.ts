import "server-only";
import { decodeAbiParameters, hexToString, type Hex } from "viem";
import { batch, ethCall } from "@/lib/chain-server";

/* Reads any ERC-20 on Robinhood Chain: its own contract for name, symbol,
   decimals and supply, and Dexscreener for every pool trading it. */

export type TokenFacts = { address: string; name: string; symbol: string; decimals: number; supply: number | null };

export type TokenPool = {
  pair: string;
  dex: string;
  version: string;
  quote: string;
  priceUsd: number | null;
  liquidityUsd: number;
  volume24h: number;
  change: { m5: number | null; h1: number | null; h6: number | null; h24: number | null };
  buys24h: number;
  sells24h: number;
  fdv: number | null;
  marketCap: number | null;
  url: string;
  createdAt: number | null;
};

const SEL = { name: "0x06fdde03", symbol: "0x95d89b41", decimals: "0x313ce567", totalSupply: "0x18160ddd" };

/** ABI string, or the bytes32 form some older tokens return. */
function readString(raw: string | null): string | null {
  if (!raw || raw === "0x") return null;
  try {
    return decodeAbiParameters([{ type: "string" }], raw as Hex)[0];
  } catch {
    try {
      return hexToString(raw as Hex).replace(/\u0000/g, "").trim() || null;
    } catch {
      return null;
    }
  }
}

export const isEvmAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v);

/** Null when the address holds no ERC-20 (no symbol and no decimals). Throws if the chain is unreachable. */
export async function readTokenFacts(address: string): Promise<TokenFacts | null> {
  const [name, symbol, decimals, supply] = await batch([
    ethCall(address, SEL.name),
    ethCall(address, SEL.symbol),
    ethCall(address, SEL.decimals),
    ethCall(address, SEL.totalSupply),
  ]);
  const sym = readString(symbol);
  if (!sym || !decimals || decimals === "0x") return null;
  const dec = Number(BigInt(decimals.slice(0, 66)));
  if (!Number.isFinite(dec) || dec > 36) return null;
  const rawSupply = supply && supply !== "0x" ? BigInt(supply.slice(0, 66)) : null;
  return {
    address,
    name: readString(name) ?? sym,
    symbol: sym,
    decimals: dec,
    supply: rawSupply === null ? null : Number(rawSupply) / 10 ** dec,
  };
}

type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: { address: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  priceUsd?: string;
  txns?: { h24?: { buys: number; sells: number } };
  volume?: { h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

/** Pools on Robinhood Chain where this token is the base asset, deepest first. Empty on failure. */
export async function readTokenPools(address: string): Promise<{ pools: TokenPool[]; ok: boolean }> {
  try {
    const res = await fetch(`https://api.dexscreener.com/token-pairs/v1/robinhood/${address}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return { pools: [], ok: false };
    const body = (await res.json()) as DexPair[];
    const pools = (Array.isArray(body) ? body : [])
      .filter((p) => p.chainId === "robinhood" && p.baseToken.address.toLowerCase() === address.toLowerCase())
      .map((p) => ({
        pair: p.pairAddress,
        dex: p.dexId.charAt(0).toUpperCase() + p.dexId.slice(1),
        version: (p.labels ?? []).join(" ").toUpperCase(),
        quote: p.quoteToken.symbol,
        priceUsd: p.priceUsd ? Number(p.priceUsd) : null,
        liquidityUsd: p.liquidity?.usd ?? 0,
        volume24h: p.volume?.h24 ?? 0,
        change: { m5: p.priceChange?.m5 ?? null, h1: p.priceChange?.h1 ?? null, h6: p.priceChange?.h6 ?? null, h24: p.priceChange?.h24 ?? null },
        buys24h: p.txns?.h24?.buys ?? 0,
        sells24h: p.txns?.h24?.sells ?? 0,
        fdv: p.fdv ?? null,
        marketCap: p.marketCap ?? null,
        url: p.url,
        createdAt: p.pairCreatedAt ?? null,
      }))
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd);
    return { pools, ok: true };
  } catch {
    return { pools: [], ok: false };
  }
}
