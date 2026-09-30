import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lendBySlug } from "@/config/lend";
import { readMarket } from "@/lib/market-server";
import { lendRow } from "@/components/lend/data";
import { BorrowCalculator } from "@/components/lend/Calculators";
import { BackLink, Block, StatGrid } from "@/components/lend/Bits";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { compact, price } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ action?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = lendBySlug((await params).slug);
  return p ? { title: `Borrow against ${p.asset.symbol}`, description: `Proposed lending parameters for ${p.asset.name} on Arbiter DEX.` } : { title: "Market not found" };
}

export default async function LendAssetPage({ params, searchParams }: Props) {
  const p = lendBySlug((await params).slug);
  if (!p) notFound();
  const { action } = await searchParams;
  const market = await readMarket();
  const row = lendRow(p, market);
  const s = row.symbol;

  return (
    <div className="wrap pb-24 pt-10">
      <BackLink />
      <header className="mt-8 flex items-center gap-4">
        <TokenLogo src={row.logo} symbol={s} size={56} />
        <div className="min-w-0">
          <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[38px]">{s} Lending</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mute">
            <span>{row.name}</span>
            <span>{row.tier}</span>
            <span className="chip !h-6 !text-[12px]">
              <span className="size-1.5 rounded-full bg-sage-2" /> Robinhood Chain
            </span>
            <span className="tag-soon">Soon</span>
          </p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <StatGrid
            stats={[
              { label: "Oracle price", value: price(row.price), note: "Chainlink, Robinhood Chain" },
              { label: "Max LTV", value: `${row.maxLtv}%`, note: "Proposed" },
              { label: "Liquidation LTV", value: `${row.liqLtv}%`, note: `Proposed, ${row.penalty}% penalty` },
              { label: "Venue liquidity", value: compact(row.liquidityUsd || null), note: "All Robinhood Chain pools" },
            ]}
          />

          <Block title="What Borrowing Against It Means">
            <p>
              You deposit {s} and borrow USDG against it without selling. Up to {row.maxLtv}% of the deposit&apos;s value can be borrowed. The position stays yours: repay the USDG and the {s} comes back.
            </p>
            <p className="mt-3">
              Deposit $1,000 of {s} and you could borrow up to ${(10 * row.maxLtv).toLocaleString("en-US")} USDG. If the loan grows to {row.liqLtv}% of what the collateral is worth, part of it is sold to repay the debt, with a {row.penalty}% penalty.
            </p>
          </Block>

          <Block title="Marked to a Fair Price">
            <p>
              Collateral is valued by the Chainlink {s}/USD feed, not by the last trade in any one pool. A single thin pool cannot be pushed to trigger liquidations. Stock Token feeds follow US market hours, five days a week; outside them, the last reported price holds.
            </p>
          </Block>

          <Block title="Why These Numbers">
            <ul className="grid list-disc gap-2 pl-5 text-[15px]">
              <li>{row.tier} collateral gets a {row.maxLtv}% limit. Names that move more get lower limits.</li>
              <li>The gap between {row.maxLtv}% and {row.liqLtv}% is room for a normal bad day before anything is sold.</li>
              <li>These are proposed launch parameters and can change before markets open.</li>
            </ul>
          </Block>

          <Block title="Risks">
            <ul className="grid list-disc gap-2 pl-5 text-[15px]">
              <li>A fall past the liquidation point sells part of the collateral at a penalty.</li>
              <li>The issuer of a Stock Token can pause or block transfers of it; a paused token cannot be liquidated or withdrawn until it resumes.</li>
              <li>Borrow rates rise with demand. This page is not investment advice.</li>
            </ul>
          </Block>
        </div>
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BorrowCalculator row={row} initial={action === "borrow" ? "borrow" : "supply"} />
        </div>
      </div>
      <div className="mt-10">
        <SourceNote live={market.sources.oracle}>{market.sources.oracle ? "Live oracle price; lending itself opens at launch." : "Oracle price unavailable right now."}</SourceNote>
      </div>
    </div>
  );
}
