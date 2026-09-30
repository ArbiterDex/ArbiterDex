import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHAIN, explorerAddress, explorerToken, shortAddress } from "@/config/brand";
import { assetBySymbol } from "@/config/assets";
import { readMarket } from "@/lib/market-server";
import { bps, compact, count, pct, price } from "@/lib/format";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { readPoolFees, readSettlements } from "@/components/markets/server";
import { SettlementsTable } from "@/components/markets/SettlementsTable";
import { Change, ExternalArrow, spreadTone } from "@/components/markets/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ poolId: string }> };

async function findPool(poolId: string) {
  const market = await readMarket();
  for (const row of market.rows) {
    const venue = row.venues.find((v) => v.pair.toLowerCase() === poolId.toLowerCase());
    if (venue) return { row, venue };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { poolId } = await params;
  const found = await findPool(poolId);
  return found ? { title: `${found.row.symbol} / ${found.venue.quote} pool` } : { title: "Pool not found" };
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 text-[13.5px] last:border-0">
      <span className="text-mute">{label}</span>
      <span className="num text-right text-ink">{value}</span>
    </div>
  );
}

export default async function PoolPage({ params }: Props) {
  const { poolId } = await params;
  const found = await findPool(poolId);
  if (!found) notFound();
  const { row, venue } = found;
  const isAddr = /^0x[0-9a-fA-F]{40}$/.test(venue.pair);
  const [fees, swaps] = await Promise.all([readPoolFees([venue.pair]), venue.version.includes("V3") && isAddr ? readSettlements(25, venue.pair) : Promise.resolve(null)]);
  const fee = fees[venue.pair.toLowerCase()] ?? null;
  const dayFees = fee !== null ? venue.volume24h * (fee / 1e6) : null;
  const apr = dayFees !== null && venue.liquidityUsd > 0 ? ((dayFees * 365) / venue.liquidityUsd) * 100 : null;
  const oracle = row.oracle?.price ?? null;
  const dev = oracle && venue.priceUsd ? ((venue.priceUsd - oracle) / oracle) * 10_000 : null;
  const tone = spreadTone(dev);
  const quoteAsset = assetBySymbol(venue.quote === "WETH" ? "ETH" : venue.quote);

  return (
    <div className="wrap pb-24">
      <nav className="pt-10 text-[13.5px] text-mute" aria-label="Breadcrumb">
        <Link href="/rwa-pools" className="hover:text-ink">
          Pools
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-2">
          {row.symbol} / {venue.quote}
        </span>
      </nav>

      <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <TokenLogo src={row.logo} symbol={row.symbol} size={52} />
          <div className="min-w-0">
            <h1 className="h-page truncate">
              {row.symbol} / {venue.quote}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13.5px] text-mute">
              <span>{CHAIN.name}</span>
              <span>
                {venue.dex} {venue.version}
              </span>
              {fee !== null ? <span className="text-ink-2">{fee / 10000}%</span> : null}
              <span>{row.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Pool price</p>
              <p className="num mt-2 text-[30px] font-medium leading-none">{price(venue.priceUsd)}</p>
              <p className="mt-2 text-[12.5px]">
                <Change value={venue.change24h} /> <span className="text-mute">24h</span>
              </p>
            </div>
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Oracle price</p>
              <p className="num mt-2 text-[30px] font-medium leading-none">{price(oracle)}</p>
              <p className="mt-2 text-[12.5px] text-mute">Chainlink reference</p>
            </div>
            <div className="panel p-5">
              <p className="text-[13px] text-mute">Ruling</p>
              <p className={`mt-2 text-[30px] font-medium leading-none ${tone.cls}`}>{tone.label}</p>
              <p className="num mt-2 text-[12.5px] text-mute">{bps(dev)} against the oracle</p>
            </div>
          </div>

          <h2 className="h-card mt-10">Transactions</h2>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-line">
            {swaps && swaps.rows.length ? (
              <SettlementsTable rows={swaps.rows} now={new Date().getTime()} showPair={false} />
            ) : (
              <p className="px-5 py-10 text-center text-[14px] text-mute">
                {isAddr && venue.version.includes("V3")
                  ? swaps
                    ? "No swap in this pool over the last few thousand blocks."
                    : "Swaps could not be read from the chain right now."
                  : "Swap history is shown for v3 pools. Open the chart link for this one."}
              </p>
            )}
          </div>
          {swaps && swaps.rows.length ? <p className="mt-3 text-[12.5px] text-mute">The {swaps.rows.length} most recent swaps between blocks {count(swaps.fromBlock)} and {count(swaps.toBlock)}, read from the pool&apos;s own events.</p> : null}
        </div>

        <aside className="grid h-fit grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/swap?from=USDG&to=${row.symbol}`} className="btn btn-ghost !h-10">
              Swap
            </Link>
            <button type="button" disabled className="btn btn-cream !h-10" title="Deposits through Arbiter DEX are not open yet">
              Add liquidity · soon
            </button>
          </div>
          <div className="card p-5">
            <h2 className="text-[18px] font-medium">Stats</h2>
            <div className="mt-2">
              <Line label="Liquidity" value={compact(venue.liquidityUsd)} />
              <Line label="24h volume" value={compact(venue.volume24h)} />
              <Line label="24h fees" value={dayFees !== null ? compact(dayFees) : "—"} />
              <Line label="Fee APR (trailing)" value={<span className="text-sage-2">{pct(apr, 2, false)}</span>} />
              <Line label="Trades, 24h" value={`${count(venue.buys24h)} buys · ${count(venue.sells24h)} sells`} />
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="text-[18px] font-medium">Links</h2>
            <div className="mt-2">
              {isAddr ? (
                <Line
                  label={`${row.symbol} / ${venue.quote} · pool`}
                  value={
                    <a href={explorerAddress(venue.pair)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12.5px] text-ink-2 hover:text-ink">
                      {shortAddress(venue.pair)} <ExternalArrow />
                    </a>
                  }
                />
              ) : null}
              <Line
                label={`${row.name} · ${row.symbol}`}
                value={
                  <Link href={`/assets/${row.symbol}`} className="font-mono text-[12.5px] text-ink-2 hover:text-ink">
                    {shortAddress(row.address)}
                  </Link>
                }
              />
              <Line
                label={`${venue.quote} · quote token`}
                value={
                  <a href={explorerToken(quoteAsset?.address ?? venue.quoteAddress)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12.5px] text-ink-2 hover:text-ink">
                    {shortAddress(venue.quoteAddress)} <ExternalArrow />
                  </a>
                }
              />
              <Line
                label="Live chart"
                value={
                  <a href={venue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-ink-2 hover:text-ink">
                    Dexscreener <ExternalArrow />
                  </a>
                }
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
