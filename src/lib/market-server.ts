import "server-only";
import { ALL_ASSETS, STOCK_ASSETS, WETH_ADDRESS, type Asset, type Category } from "@/config/assets";
import { USDG } from "@/config/tokens";
import { batch, ethCall } from "@/lib/chain-server";

/* Market data for the whole site, read without keys:
     - Chainlink feeds on Robinhood Chain: the independent reference price.
     - Dexscreener: every pool (venue) trading each verified token address,
       with liquidity, 24h volume and price.
     - The token contracts themselves: circulating supply.
   Reads are cached in memory for a short while; a failed read is never cached. */

export type Venue = {
  pair: string;
  dex: string;
  version: string;
  quote: string;
  quoteAddress: string;
  priceUsd: number | null;
  liquidityUsd: number;
  volume24h: number;
  change24h: number | null;
  buys24h: number;
  sells24h: number;
  url: string;
  createdAt: number | null;
};

export type Oracle = { price: number; updatedAt: number } | null;

export type MarketRow = {
  symbol: string;
  name: string;
  address: string;
  category: Category;
  logo: string;
  issuer: Asset["issuer"];
  oracle: Oracle;
  /** Venues sorted by liquidity, deepest first. */
  venues: Venue[];
  liquidityUsd: number;
  volume24h: number;
  change24h: number | null;
  supply: number | null;
  /** Deepest venue's price minus the oracle, in basis points. */
  spreadBps: number | null;
  lookalikes: number;
};

const SEL = { latestRoundData: "0xfeaf968c", totalSupply: "0x18160ddd" };
const TTL = 60_000;

let oracleCache: { at: number; value: Record<string, Oracle> } | null = null;
let venueCache: { at: number; value: Record<string, Venue[]> } | null = null;
let supplyCache: { at: number; value: Record<string, number | null> } | null = null;

const word = (hex: string | null, i: number) =>
  !hex || hex.length < 2 + (i + 1) * 64 ? null : BigInt("0x" + hex.slice(2 + i * 64, 2 + (i + 1) * 64));

/** Chainlink answer and update time for every asset with a feed. */
export async function readOracles(): Promise<Record<string, Oracle>> {
  if (oracleCache && Date.now() - oracleCache.at < TTL) return oracleCache.value;
  const priced = ALL_ASSETS.filter((a) => a.feed);
  const results = await batch(priced.map((a) => ethCall(a.feed!, SEL.latestRoundData)));
  const out: Record<string, Oracle> = {};
  let hits = 0;
  priced.forEach((a, i) => {
    const answer = word(results[i], 1);
    const updated = word(results[i], 3);
    if (answer && answer > 0n) {
      out[a.symbol] = { price: Number(answer) / 1e8, updatedAt: Number(updated ?? 0n) };
      hits++;
    } else out[a.symbol] = null;
  });
  out.USDG = { price: 1, updatedAt: Math.floor(Date.now() / 1000) };
  if (hits > 0) oracleCache = { at: Date.now(), value: out };
  return out;
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
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
  pairCreatedAt?: number;
};

const DEX_NAMES: Record<string, string> = { uniswap: "Uniswap", sushiswap: "SushiSwap", pancakeswap: "PancakeSwap", kittenswap: "KittenSwap", up: "Up" };

/** Every pair Dexscreener indexes for one token (up to 30, deepest first). */
async function fetchPairs(address: string): Promise<DexPair[]> {
  const res = await fetch(`https://api.dexscreener.com/token-pairs/v1/robinhood/${address}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`dexscreener ${res.status}`);
  const body = (await res.json()) as DexPair[];
  return Array.isArray(body) ? body : [];
}

/** Runs `fn` over `items` with at most `limit` in flight; failures become empty lists. */
async function pooled<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R[]>): Promise<R[][]> {
  const out: R[][] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]).catch(() => []);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Every pool on Robinhood Chain that trades one of our verified addresses. */
export async function readVenues(): Promise<Record<string, Venue[]>> {
  if (venueCache && Date.now() - venueCache.at < TTL) return venueCache.value;
  const tracked = [...STOCK_ASSETS.map((a) => a.address), WETH_ADDRESS];
  const pairs = (await pooled(tracked, 8, fetchPairs)).flat();
  const bySymbol: Record<string, Venue[]> = {};
  const seen = new Set<string>();
  for (const p of pairs) {
    if (p.chainId !== "robinhood" || seen.has(p.pairAddress.toLowerCase())) continue;
    seen.add(p.pairAddress.toLowerCase());
    const base = ALL_ASSETS.find((a) => a.address.toLowerCase() === p.baseToken.address.toLowerCase()) ??
      (p.baseToken.address.toLowerCase() === WETH_ADDRESS.toLowerCase() ? ALL_ASSETS.find((a) => a.symbol === "ETH") : undefined);
    if (!base) continue;
    const venue: Venue = {
      pair: p.pairAddress,
      dex: DEX_NAMES[p.dexId] ?? p.dexId.charAt(0).toUpperCase() + p.dexId.slice(1),
      version: (p.labels ?? []).join(" ").toUpperCase(),
      quote: p.quoteToken.symbol,
      quoteAddress: p.quoteToken.address,
      priceUsd: p.priceUsd ? Number(p.priceUsd) : null,
      liquidityUsd: p.liquidity?.usd ?? 0,
      volume24h: p.volume?.h24 ?? 0,
      change24h: p.priceChange?.h24 ?? null,
      buys24h: p.txns?.h24?.buys ?? 0,
      sells24h: p.txns?.h24?.sells ?? 0,
      url: p.url,
      createdAt: p.pairCreatedAt ?? null,
    };
    (bySymbol[base.symbol] ??= []).push(venue);
  }
  for (const list of Object.values(bySymbol)) list.sort((a, b) => b.liquidityUsd - a.liquidityUsd);
  if (Object.keys(bySymbol).length > 0) venueCache = { at: Date.now(), value: bySymbol };
  return bySymbol;
}

/** Circulating supply of each stock token, straight from the contract. */
export async function readSupplies(): Promise<Record<string, number | null>> {
  if (supplyCache && Date.now() - supplyCache.at < TTL * 5) return supplyCache.value;
  const results = await batch(STOCK_ASSETS.map((a) => ethCall(a.address, SEL.totalSupply)));
  const out: Record<string, number | null> = {};
  STOCK_ASSETS.forEach((a, i) => {
    const raw = word(results[i], 0);
    out[a.symbol] = raw === null ? null : Number(raw) / 10 ** a.decimals;
  });
  if (results.some(Boolean)) supplyCache = { at: Date.now(), value: out };
  return out;
}

const settle = async <T,>(p: Promise<T>, fallback: T) => {
  try {
    return await p;
  } catch {
    return fallback;
  }
};

export type Market = { rows: MarketRow[]; readAt: number; sources: { oracle: boolean; venues: boolean; supply: boolean } };

/** One row per asset with oracle, venues and supply merged. Never throws. */
export async function readMarket(): Promise<Market> {
  const [oracles, venues, supplies] = await Promise.all([
    settle(readOracles(), {} as Record<string, Oracle>),
    settle(readVenues(), {} as Record<string, Venue[]>),
    settle(readSupplies(), {} as Record<string, number | null>),
  ]);
  const rows: MarketRow[] = ALL_ASSETS.filter((a) => a.symbol !== "USDG").map((a) => {
    const list = venues[a.symbol] ?? [];
    const oracle = oracles[a.symbol] ?? null;
    const deepest = list.find((v) => v.priceUsd);
    const spreadBps = oracle && deepest?.priceUsd ? ((deepest.priceUsd - oracle.price) / oracle.price) * 10_000 : null;
    return {
      symbol: a.symbol,
      name: a.name,
      address: a.address,
      category: a.category,
      logo: a.logo,
      issuer: a.issuer,
      oracle,
      venues: list,
      liquidityUsd: list.reduce((s, v) => s + v.liquidityUsd, 0),
      volume24h: list.reduce((s, v) => s + v.volume24h, 0),
      change24h: deepest?.change24h ?? null,
      supply: supplies[a.symbol] ?? null,
      spreadBps,
      lookalikes: a.lookalikes,
    };
  });
  return {
    rows,
    readAt: Date.now(),
    sources: {
      oracle: Object.values(oracles).some(Boolean),
      venues: Object.keys(venues).length > 0,
      supply: Object.values(supplies).some((v) => v !== null),
    },
  };
}

/** Flat list of every venue with its asset, deepest first. */
export async function readPools() {
  const market = await readMarket();
  const pools = market.rows.flatMap((row) => row.venues.map((v) => ({ ...v, symbol: row.symbol, name: row.name, logo: row.logo, category: row.category })));
  pools.sort((a, b) => b.liquidityUsd - a.liquidityUsd);
  return { pools, readAt: market.readAt, ok: market.sources.venues };
}

export const USDG_ADDRESS = USDG.address;
