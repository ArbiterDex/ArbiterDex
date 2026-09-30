import type { Metadata } from "next";
import { LEND_ASSETS } from "@/config/lend";
import { readMarket } from "@/lib/market-server";
import { lendRows } from "@/components/lend/data";
import { LendBoard } from "@/components/lend/LendBoard";
import { StatStrip } from "@/components/ui/StatStrip";
import { SourceNote } from "@/components/ui/SourceNote";
import { compact } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lend and Borrow",
  description: "Proposed lending markets for Stock Tokens on Robinhood Chain: collateral, loan-to-value limits and live oracle prices.",
};

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function LendPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const market = await readMarket();
  const rows = lendRows(market);
  const depth = rows.reduce((s, r) => s + r.liquidityUsd, 0);

  return (
    <div className="wrap pb-24">
      <div className="pt-12 sm:pt-[70px]">
        <p className="eyebrow flex flex-wrap items-center gap-2">
          Lend and Borrow <span className="tag-soon">Soon</span>
          <span className="chip !h-6 !text-[12px]">
            <span className="size-1.5 rounded-full bg-sage-2" /> Robinhood Chain
          </span>
        </p>
        <h1 className="h-sec mt-5 max-w-[720px]">Borrow Against Your Stocks. At a Fair Mark.</h1>
        <p className="lead mt-5 max-w-[560px]">Supply a Stock Token, borrow USDG against it, or lever the position. Every loan is marked to an independent oracle, never to a single thin pool.</p>
      </div>

      <div className="mt-10">
        <StatStrip
          stats={[
            { label: "Collateral assets", value: LEND_ASSETS.length },
            { label: "Market size", value: "—", note: "Opens at launch" },
            { label: "Active borrows", value: "—", note: "Opens at launch" },
            { label: "Collateral venue depth", value: compact(depth || null), note: "Live, Robinhood Chain venues" },
          ]}
        />
      </div>

      <p className="mt-6 rounded-[10px] border border-line bg-white/[0.02] px-4 py-3 text-[13.5px] leading-[1.55] text-ink-2">
        <b className="font-medium text-ink">Preview.</b> Lending is not live yet. Loan-to-value limits below are <b className="font-medium text-ink">proposed</b> launch parameters; rates are set by utilisation once markets open, so none are shown.
      </p>

      <div className="mt-8">
        <LendBoard key={tab === "multiply" ? "multiply" : "lend"} rows={rows} initialTab={tab === "multiply" ? "multiply" : "lend"} />
      </div>
      <div className="mt-5">
        <SourceNote live={market.sources.oracle}>
          {market.sources.oracle ? "Prices from Chainlink feeds on Robinhood Chain; venue depth from Dexscreener." : "Oracle prices could not be read right now."}
        </SourceNote>
      </div>
    </div>
  );
}
