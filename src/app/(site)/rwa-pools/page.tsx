import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { readPools } from "@/lib/market-server";
import { compact } from "@/lib/format";
import { PageIntro } from "@/components/ui/PageIntro";
import { StatStrip } from "@/components/ui/StatStrip";
import { SourceNote } from "@/components/ui/SourceNote";
import { XIcon } from "@/components/icons";
import { readPoolFees } from "@/components/markets/server";
import { PoolsTable, type PoolRow } from "@/components/markets/PoolsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tokenized Pools",
  description: "Every pool on Robinhood Chain where verified stock tokens trade, with liquidity, volume and fee yield.",
};

export default async function PoolsPage() {
  const { pools, ok } = await readPools();
  const fees = ok ? await readPoolFees(pools.map((p) => p.pair)) : {};
  const rows: PoolRow[] = pools.map((p) => ({
    pair: p.pair,
    symbol: p.symbol,
    name: p.name,
    logo: p.logo,
    quote: p.quote,
    dex: p.dex,
    version: p.version,
    liquidityUsd: p.liquidityUsd,
    volume24h: p.volume24h,
    fee: fees[p.pair.toLowerCase()] ?? null,
  }));
  const liquidity = rows.reduce((s, p) => s + p.liquidityUsd, 0);
  const volume = rows.reduce((s, p) => s + p.volume24h, 0);

  return (
    <div className="wrap pb-24">
      <PageIntro
        eyebrow="Tokenized Pools"
        title="Every Pool. Weighed in the Open."
        lead={
          <>
            <b className="font-medium text-ink">{ok ? `${rows.length} pools` : "Every pool"}</b> where verified stock tokens trade on Robinhood Chain. Arbiter DEX compares all of them before it routes a single order.
          </>
        }
        action={
          <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn btn-ghost !h-10">
            <XIcon className="size-4" /> Follow on X
          </a>
        }
      />

      <div className="mt-10">
        <StatStrip
          stats={[
            { label: "Pools", value: ok ? rows.length : "—" },
            { label: "Liquidity", value: ok ? compact(liquidity) : "—" },
            { label: "24h volume", value: ok ? compact(volume) : "—" },
          ]}
        />
      </div>

      <div className="mt-6">
        <PoolsTable pools={rows} />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <SourceNote live={ok}>Pools and volume: Dexscreener · fee tiers read from each pool contract · refreshed each minute</SourceNote>
        <p className="max-w-[760px] text-[13px] leading-[1.6] text-mute">
          Fee APR is the last day&apos;s volume times the pool fee, annualised over its liquidity. It is a trailing figure, not a promise. One-click deposits through Arbiter DEX are not open yet; each pool page links to where it trades today.
        </p>
      </div>
    </div>
  );
}
