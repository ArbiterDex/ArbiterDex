import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CHAIN, TOKEN, explorerToken, shortAddress } from "@/config/brand";
import { Mark } from "@/components/Logo";
import { ArrowUpRight, XIcon } from "@/components/icons";
import { ArbiterTradeBox } from "@/components/launchpad/ArbiterTradeBox";
import { CopyAddress } from "@/components/launchpad/CopyAddress";
import { readTokenFacts, readTokenPools, type TokenPool } from "@/components/launchpad/token-server";
import { SourceNote } from "@/components/ui/SourceNote";
import { compact, count, pct, price } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${BRAND.ticker} · ${BRAND.name}`, description: `Price, pools and trading for ${BRAND.symbol} on Robinhood Chain.` };

async function load() {
  if (!TOKEN.isLive) return { supply: null as number | null, pools: [] as TokenPool[], ok: false };
  const [facts, pools] = await Promise.all([readTokenFacts(BRAND.ca).catch(() => null), readTokenPools(BRAND.ca)]);
  return { supply: facts?.supply ?? null, pools: pools.pools, ok: pools.ok };
}

const TIMES = ["5M", "1H", "6H", "24H", "All"];

export default async function ArbiterTokenPage() {
  const live = TOKEN.isLive;
  const { supply, pools, ok } = await load();
  const deepest = pools.find((p) => p.priceUsd !== null) ?? null;
  const px = deepest?.priceUsd ?? null;
  const fdv = px !== null && supply !== null ? px * supply : (deepest?.fdv ?? null);
  const vol = ok ? pools.reduce((s, p) => s + p.volume24h, 0) : null;
  const liq = ok ? pools.reduce((s, p) => s + p.liquidityUsd, 0) : null;
  const buys = pools.reduce((s, p) => s + p.buys24h, 0);
  const sells = pools.reduce((s, p) => s + p.sells24h, 0);
  const change = deepest?.change.h24 ?? null;
  const empty = live ? "No trades in this range yet." : "Trading opens when the contract is published.";

  return (
    <div className="wrap pb-24 pt-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] text-mute">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <span className="text-ink-2">{BRAND.name}</span>
      </nav>

      <div className="mt-5 flex items-center gap-4">
        <span className="grid size-[60px] shrink-0 place-items-center rounded-full border border-line bg-night-2 text-parchment">
          <Mark size={30} />
        </span>
        <div className="min-w-0">
          <h1 className="text-[34px] font-medium leading-none tracking-[-0.02em] sm:text-[40px]">{BRAND.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-2">
            <span className="font-medium text-ink">{BRAND.ticker}</span>
            {live ? <CopyAddress address={BRAND.ca} /> : <span className="chip !h-6 !text-[12px]">CA published at launch</span>}
            <span className="chip !h-6 !text-[12px]">{CHAIN.name}</span>
            <a href={BRAND.x} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-ink">
              <XIcon className="size-3.5" /> {BRAND.xHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="panel mt-6 grid grid-cols-2 gap-5 p-5 md:grid-cols-5">
        {[
          { l: "FDV", v: compact(fdv), n: change !== null ? `${pct(change)} over the past 24h` : null, tone: change !== null && change < 0 ? "text-down" : "text-up" },
          { l: "Price", v: price(px) },
          { l: "24H volume", v: compact(vol) },
          { l: "Liquidity", v: compact(liq), n: ok ? `${pools.length} pool${pools.length === 1 ? "" : "s"}` : null },
          { l: "Supply", v: supply !== null ? compact(supply, "") : "—", n: BRAND.ticker },
        ].map((s) => (
          <div key={s.l} className="min-w-0">
            <p className="text-[12.5px] text-mute">{s.l}</p>
            <p className="num mt-1.5 truncate text-[24px] font-medium">{s.v}</p>
            {s.n ? <p className={`mt-0.5 text-[12px] ${s.l === "FDV" ? s.tone : "text-mute"}`}>{s.n}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-5">
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="num text-[18px] font-medium">
                {price(px)} {change !== null ? <span className={`ml-1 text-[13px] ${change < 0 ? "text-down" : "text-up"}`}>{pct(change)}</span> : null}
              </p>
              <div className="flex gap-1">
                {TIMES.map((t) => (
                  <span key={t} className={`rounded-[6px] px-2.5 py-1 text-[12.5px] ${t === "24H" ? "bg-white/[0.08] text-ink" : "text-mute"}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative mt-4 grid h-[260px] place-items-center overflow-hidden rounded-[8px] sm:h-[320px]">
              <svg aria-hidden="true" className="absolute inset-0 size-full opacity-60">
                <defs>
                  <pattern id="arb-grid" width="48" height="40" patternUnits="userSpaceOnUse">
                    <path d="M48 0H0V40" fill="none" stroke="rgba(255,255,255,0.05)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#arb-grid)" />
              </svg>
              <p className="relative text-[14px] text-ink-2">{empty}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-8 border-t border-line pt-4 text-[12.5px]">
              <div>
                <p className="text-mute">Volume</p>
                <p className="num mt-0.5 text-[15px]">{compact(vol)}</p>
              </div>
              <div>
                <p className="text-mute">{live ? count(buys) : "—"} buys</p>
              </div>
              <div>
                <p className="text-mute">{live ? count(sells) : "—"} sells</p>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-medium">Activity</h2>
              <SourceNote live={ok}>{ok ? "Pools read from Dexscreener" : live ? "Pool data unavailable right now" : "Waiting for launch"}</SourceNote>
            </div>
            <div className="scroll-x mt-4">
              <div className="grid min-w-[560px] grid-cols-6 border-b border-line pb-2 text-[12px] text-mute">
                <span>Time</span>
                <span>Trade</span>
                <span>Value</span>
                <span>{BRAND.ticker}</span>
                <span>Price</span>
                <span className="text-right">Trader</span>
              </div>
            </div>
            <p className="py-10 text-center text-[14px] text-mute">{empty}</p>
          </section>

          <section className="panel p-5">
            <h2 className="text-[16px] font-medium">Info</h2>
            <dl className="mt-3 text-[13.5px]">
              {[
                ["Contract address", live ? shortAddress(BRAND.ca, 6, 4) : "Published at launch", live ? explorerToken(BRAND.ca) : null],
                ["Chain", CHAIN.name, null],
                ["Traded against", deepest ? deepest.quote : "—", null],
                ["Pool", deepest ? `${deepest.dex} ${deepest.version}` : "—", null],
                ["Supply", supply !== null ? count(supply) : "—", null],
                ["X account", BRAND.xHandle, BRAND.x],
              ].map(([k, v, href]) => (
                <div key={k} className="flex justify-between gap-4 border-t border-line py-2.5 first:border-t-0">
                  <dt className="text-mute">{k}</dt>
                  <dd className="min-w-0 truncate text-right font-medium">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-parchment">
                        {v} <ArrowUpRight className="size-3" />
                      </a>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <ArbiterTradeBox />
        </aside>
      </div>
    </div>
  );
}
