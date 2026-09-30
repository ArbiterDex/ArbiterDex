import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetBySymbol } from "@/config/assets";
import { CHAIN, explorerToken, shortAddress } from "@/config/brand";
import { readMarket } from "@/lib/market-server";
import { ago, bps, compact, count, price } from "@/lib/format";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { readPoolFees } from "@/components/markets/server";
import { Change, ExternalArrow, SpreadCell, spreadTone } from "@/components/markets/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ ticker: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const asset = assetBySymbol(ticker);
  if (!asset) return { title: "Asset not found" };
  return { title: `${asset.symbol} · ${asset.name}`, description: `${asset.name} on Robinhood Chain: every venue's price against the Chainlink reference.` };
}

export default async function AssetPage({ params }: Props) {
  const { ticker } = await params;
  const asset = assetBySymbol(ticker);
  if (!asset || asset.symbol === "USDG") notFound();

  const market = await readMarket();
  const row = market.rows.find((r) => r.symbol === asset.symbol);
  if (!row) notFound();
  const fees = await readPoolFees(row.venues.map((v) => v.pair));
  const oracle = row.oracle?.price ?? null;
  const tone = spreadTone(row.spreadBps);
  const isNative = asset.symbol === "ETH";

  return (
    <div className="wrap pb-24">
      <nav className="pt-10 text-[13.5px] text-mute" aria-label="Breadcrumb">
        <Link href="/assets" className="hover:text-ink">
          All assets
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-2">{asset.symbol}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <TokenLogo src={asset.logo} symbol={asset.symbol} size={56} />
          <div className="min-w-0">
            <h1 className="h-page truncate">{asset.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-mute">
              <span className="text-ink-2">${asset.symbol}</span>
              <span>{CHAIN.name}</span>
              <span>Issued by {asset.issuer === "Native" ? "the network" : asset.issuer}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/swap?from=USDG&to=${asset.symbol}`} className="btn btn-cream">
            Trade {asset.symbol}
          </Link>
          {!isNative ? (
            <a href={explorerToken(asset.address)} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Contract <ExternalArrow />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Oracle price</p>
              <p className="num mt-2 text-[30px] font-medium leading-none">{price(oracle)}</p>
              <p className="mt-2 text-[12.5px] text-mute">{row.oracle ? `Chainlink · updated ${ago(row.oracle.updatedAt)}` : "Feed unreachable"}</p>
            </div>
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Deepest venue</p>
              <p className="num mt-2 text-[30px] font-medium leading-none">{price(row.venues.find((v) => v.priceUsd)?.priceUsd)}</p>
              <p className="mt-2 text-[12.5px]">
                <Change value={row.change24h} /> <span className="text-mute">24h</span>
              </p>
            </div>
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Ruling</p>
              <p className={`mt-2 text-[30px] font-medium leading-none ${tone.cls}`}>{tone.label}</p>
              <p className="num mt-2 text-[12.5px] text-mute">{bps(row.spreadBps)} against the oracle</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <h2 className="h-card">Every venue on {CHAIN.name}</h2>
            <SourceNote live={market.sources.venues}>{market.sources.venues ? "Dexscreener pools · on-chain fee tiers" : "Venue data unreachable right now"}</SourceNote>
          </div>

          {row.venues.length === 0 ? (
            <div className="mt-4 panel px-5 py-10 text-center text-[14px] text-mute">
              {market.sources.venues ? `No pool trades ${asset.symbol} on ${CHAIN.name} right now.` : "Venues could not be read. Try again in a minute."}
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-2">
              {row.venues.map((v) => {
                const dev = oracle && v.priceUsd ? ((v.priceUsd - oracle) / oracle) * 10_000 : null;
                const fee = fees[v.pair.toLowerCase()];
                return (
                  <li key={v.pair} className="row-tile grid grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <p className="truncate text-[15px] font-medium">
                        {asset.symbol}/{v.quote}
                      </p>
                      <p className="truncate text-[12.5px] text-mute">
                        {v.dex} {v.version}
                        {fee ? ` · ${fee / 10000}% fee` : ""}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-mute">Price</p>
                      <p className="num text-[14px]">{price(v.priceUsd)}</p>
                    </div>
                    <div className="min-w-0 text-right sm:text-left">
                      <p className="text-[12px] text-mute">vs oracle</p>
                      <SpreadCell value={dev} stacked={false} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-mute">Liquidity · 24h</p>
                      <p className="num text-[14px]">
                        {compact(v.liquidityUsd)} <span className="text-mute">· {compact(v.volume24h)}</span>
                      </p>
                    </div>
                    <div className="min-w-0 text-right">
                      <Link href={`/rwa-pools/${v.pair}`} className="text-[13px] text-ink-2 hover:text-ink">
                        Pool
                      </Link>
                      <span className="px-2 text-mute">·</span>
                      <a href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-ink-2 hover:text-ink">
                        Chart <ExternalArrow />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="grid h-fit grid-cols-1 gap-4">
          <div className="card p-5">
            <h2 className="text-[16px] font-medium">Token facts</h2>
            <dl className="mt-4 grid gap-3 text-[13.5px]">
              {!isNative ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-mute">Contract</dt>
                  <dd>
                    <a href={explorerToken(asset.address)} target="_blank" rel="noreferrer" className="font-mono text-[12.5px] text-ink-2 hover:text-ink">
                      {shortAddress(asset.address)}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-mute">Category</dt>
                <dd className="text-ink-2">{asset.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mute">Circulating supply</dt>
                <dd className="num text-ink-2">{count(row.supply, 2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mute">On-chain value</dt>
                <dd className="num text-ink-2">{compact(row.supply !== null && oracle ? row.supply * oracle : null)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mute">Total liquidity</dt>
                <dd className="num text-ink-2">{compact(row.liquidityUsd)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mute">24h volume</dt>
                <dd className="num text-ink-2">{compact(row.volume24h)}</dd>
              </div>
            </dl>
          </div>
          {asset.lookalikes > 0 ? (
            <div className="rounded-[12px] border border-warn/30 bg-warn/[0.06] p-5 text-[13.5px] leading-[1.6] text-ink-2">
              <p className="font-medium text-warn">
                {asset.lookalikes} lookalike{asset.lookalikes === 1 ? "" : "s"} found
              </p>
              <p className="mt-1">
                Other tokens on {CHAIN.name} trade under the ticker {asset.symbol}. Arbiter DEX only routes to the verified contract above, which proxies to the issuer&apos;s token beacon.
              </p>
            </div>
          ) : null}
          <p className="text-[12.5px] leading-[1.6] text-mute">
            The oracle is a Chainlink feed on {CHAIN.name}. Stock feeds update during US market hours, so a gap outside them usually means the venues moved first.
          </p>
        </aside>
      </div>
    </div>
  );
}
