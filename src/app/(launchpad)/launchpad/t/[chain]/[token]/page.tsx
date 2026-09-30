import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetByAddress } from "@/config/assets";
import { CHAIN, explorerToken } from "@/config/brand";
import { ArrowUpRight } from "@/components/icons";
import { CopyAddress } from "@/components/launchpad/CopyAddress";
import { isEvmAddress, readTokenFacts, readTokenPools, type TokenFacts } from "@/components/launchpad/token-server";
import { TokenOrb } from "@/components/launchpad/Visuals";
import { SourceNote } from "@/components/ui/SourceNote";
import { readOracles } from "@/lib/market-server";
import { compact, count, pct, price } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ chain: string; token: string }> };

async function load(chain: string, token: string) {
  if (chain !== "robinhood" || !isEvmAddress(token)) return { kind: "invalid" as const };
  let facts: TokenFacts | null;
  try {
    facts = await readTokenFacts(token);
  } catch {
    return { kind: "offline" as const };
  }
  if (!facts) return { kind: "invalid" as const };
  return { kind: "ok" as const, facts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chain, token } = await params;
  const r = await load(chain, token);
  return { title: r.kind === "ok" ? `${r.facts.name} ($${r.facts.symbol})` : "Token" };
}

function Box({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel min-w-0 px-3.5 py-2.5">
      <p className="text-[11.5px] text-mute">{label}</p>
      <p className={`num mt-0.5 truncate text-[16px] font-medium ${tone}`}>{value}</p>
    </div>
  );
}

const toneOf = (v: number | null) => (v === null ? "" : v >= 0 ? "text-up" : "text-down");

export default async function TokenDetailPage({ params }: Props) {
  const { chain, token } = await params;
  const r = await load(chain, token);
  if (r.kind === "invalid") notFound();
  if (r.kind === "offline") {
    return (
      <div className="wrap grid min-h-[60vh] place-items-center py-24 text-center">
        <div>
          <p className="text-[20px] font-medium">{CHAIN.name} could not be reached</p>
          <p className="mt-2 text-[14px] text-mute">The token&apos;s contract could not be read just now. Reload in a moment.</p>
        </div>
      </div>
    );
  }
  const { facts } = r;
  const listed = assetByAddress(facts.address);
  const [{ pools, ok }, oracles] = await Promise.all([readTokenPools(facts.address), listed ? readOracles().catch(() => ({})) : Promise.resolve({})]);
  const deepest = pools.find((p) => p.priceUsd !== null) ?? null;
  const px = deepest?.priceUsd ?? null;
  const mcap = px !== null && facts.supply !== null ? px * facts.supply : null;
  const vol = pools.reduce((s, p) => s + p.volume24h, 0);
  const liq = pools.reduce((s, p) => s + p.liquidityUsd, 0);
  const buys = pools.reduce((s, p) => s + p.buys24h, 0);
  const sells = pools.reduce((s, p) => s + p.sells24h, 0);
  const oracle = listed ? ((oracles as Record<string, { price: number } | null>)[listed.symbol] ?? null) : null;
  const edge = oracle && px ? ((px - oracle.price) / oracle.price) * 100 : null;
  const maxLiq = Math.max(1, ...pools.map((p) => p.liquidityUsd));

  return (
    <div className="wrap pb-24 pt-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {listed ? <img src={listed.logo} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full bg-white" /> : <TokenOrb size={56} />}
          <div className="min-w-0">
            <h1 className="truncate text-[26px] font-medium tracking-[-0.01em]">{facts.symbol}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
              <span className="max-w-[220px] truncate">{facts.name}</span>
              <span className="chip !h-6 !text-[12px]">{CHAIN.name}</span>
              <CopyAddress address={facts.address} />
              <a href={explorerToken(facts.address)} target="_blank" rel="noreferrer" className="chip !h-6 !text-[12px] hover:!text-ink">
                {CHAIN.explorerName} <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Box label="Market cap" value={compact(mcap)} />
          <Box label="Price" value={price(px)} />
          <Box label="24h change" value={pct(deepest?.change.h24 ?? null)} tone={toneOf(deepest?.change.h24 ?? null)} />
          <Box label="24h volume" value={compact(ok ? vol : null)} />
          <Box label="Pools" value={ok ? String(pools.length) : "—"} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-5">
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[16px] font-medium">Venues</h2>
              <SourceNote live={ok}>{ok ? "Pools on Robinhood Chain, read from Dexscreener" : "Pool data could not be read right now"}</SourceNote>
            </div>
            {pools.length ? (
              <div className="mt-4 grid gap-2">
                {pools.map((p) => (
                  <a key={p.pair} href={p.url} target="_blank" rel="noreferrer" className="row-tile grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-white/[0.05] sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:items-center">
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">
                        {facts.symbol} / {p.quote}
                      </span>
                      <span className="block text-[12px] text-mute">
                        {p.dex} {p.version}
                      </span>
                    </span>
                    <span className="num text-[13.5px]">
                      <span className="text-mute sm:hidden">Price </span>
                      {price(p.priceUsd)}
                    </span>
                    <span className="text-[13.5px]">
                      <span className="text-mute sm:hidden">Liquidity </span>
                      <span className="num">{compact(p.liquidityUsd)}</span>
                      <span className="mt-1 block h-1 rounded-full bg-white/[0.06]">
                        <span className="block h-1 rounded-full bg-sage" style={{ width: `${(p.liquidityUsd / maxLiq) * 100}%` }} />
                      </span>
                    </span>
                    <span className="num text-[13.5px] sm:text-right">
                      <span className="text-mute sm:hidden">24h volume </span>
                      {compact(p.volume24h)}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-6 py-10 text-center text-[14px] text-mute">{ok ? "No pool trades this token on Robinhood Chain yet." : "Try again in a moment."}</p>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="text-[16px] font-medium">Info</h2>
            <dl className="mt-3 grid text-[13.5px]">
              {[
                ["Contract address", facts.address],
                ["Chain", `${CHAIN.name} · ${CHAIN.id}`],
                ["Decimals", String(facts.decimals)],
                ["Supply", facts.supply !== null ? count(facts.supply, 2) : "—"],
                ["Deepest pool", deepest ? `${deepest.dex} ${deepest.version} · ${facts.symbol}/${deepest.quote}` : "—"],
                ["Verified by Arbiter DEX", listed ? `Yes · ${listed.issuer} ${listed.category === "Stocks" ? "Stock Token" : "asset"}` : "No · unverified token"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-t border-line py-2.5 first:border-t-0">
                  <dt className="shrink-0 text-mute">{k}</dt>
                  <dd className="min-w-0 break-all text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-5">
          <section className="panel p-4">
            <div className="grid grid-cols-2 gap-1.5 text-center text-[14px]">
              <span className="rounded-[8px] border border-sage/60 bg-sage-tint py-2">Buy</span>
              <span className="rounded-[8px] bg-white/[0.04] py-2 text-mute">Sell</span>
            </div>
            {listed ? (
              <>
                <p className="mt-4 text-[13.5px] leading-[1.6] text-ink-2">
                  {facts.symbol} is a verified {listed.issuer} asset. Trade it on the swap, where every route is quoted on-chain and checked against its Chainlink price.
                </p>
                {edge !== null ? (
                  <p className="mt-3 text-[13px] text-mute">
                    Deepest pool vs oracle: <span className={Math.abs(edge) <= 0.5 ? "text-up" : "text-warn"}>{pct(edge)}</span>
                  </p>
                ) : null}
                <Link href={`/swap?from=USDG&to=${listed.symbol}`} className="btn btn-cream mt-4 !h-11 w-full">
                  Trade {facts.symbol}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 text-[13.5px] leading-[1.6] text-ink-2">This token is not on the Arbiter DEX verified list, so there is no oracle to check its price against. Look it up before you trade it anywhere.</p>
                <a href={explorerToken(facts.address)} target="_blank" rel="noreferrer" className="btn btn-ghost mt-4 !h-11 w-full !text-ink">
                  View on {CHAIN.explorerName} <ArrowUpRight />
                </a>
              </>
            )}
          </section>

          <section className="panel p-4">
            <div className="grid grid-cols-4 gap-1.5">
              {(["m5", "h1", "h6", "h24"] as const).map((k) => {
                const v = deepest?.change[k] ?? null;
                return (
                  <div key={k} className="row-tile px-1 py-2 text-center">
                    <p className="text-[11px] text-mute">{{ m5: "5m", h1: "1h", h6: "6h", h24: "24h" }[k]}</p>
                    <p className={`num text-[12.5px] ${toneOf(v)}`}>{pct(v)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-[12.5px]">
              <span>{count(buys)} buys</span>
              <span>{count(sells)} sells</span>
            </div>
            <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <span className="bg-up" style={{ width: buys + sells ? `${(buys / (buys + sells)) * 100}%` : "50%" }} />
              <span className="flex-1 bg-down" />
            </div>
            <p className="mt-3 text-[12px] text-mute">Last 24 hours · liquidity {compact(ok ? liq : null)}</p>
          </section>

          <section className="panel p-4">
            <h2 className="text-[15px] font-medium">About {facts.symbol}</h2>
            <p className="mt-2 text-[13.5px] text-ink-2">
              {facts.name} on {CHAIN.name}
              {deepest ? `, deepest against ${deepest.quote}.` : "."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="chip !h-6 !text-[11.5px]">{listed ? "Verified" : "Unverified"}</span>
              {deepest ? <span className="chip !h-6 !text-[11.5px]">{deepest.dex}</span> : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
