import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lendBySlug } from "@/config/lend";
import { readMarket } from "@/lib/market-server";
import { lendRow } from "@/components/lend/data";
import { MultiplyCalculator } from "@/components/lend/Calculators";
import { BackLink, Block, StatGrid } from "@/components/lend/Bits";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { compact } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = lendBySlug((await params).slug);
  return p ? { title: `${p.asset.symbol} Multiply`, description: `Leverage preview for ${p.asset.name} on Arbiter DEX.` } : { title: "Market not found" };
}

export default async function MultiplyPage({ params }: Props) {
  const p = lendBySlug((await params).slug);
  if (!p) notFound();
  const market = await readMarket();
  const row = lendRow(p, market);
  const s = row.symbol;
  const lev = row.maxLeverage;
  const ltv = (lev - 1) / lev;
  const fall = (1 - (ltv * 100) / row.liqLtv) * 100;
  const moves = [20, 10, 0, -10, -20];

  return (
    <div className="wrap pb-24 pt-10">
      <BackLink />
      <header className="mt-8 flex items-center gap-4">
        <TokenLogo src={row.logo} symbol={s} size={56} />
        <div className="min-w-0">
          <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[38px]">{s} Multiply</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mute">
            <span className="text-ink">Up to {lev.toFixed(2)}×</span>
            <span className="chip !h-6 !text-[12px]">
              <span className="size-1.5 rounded-full bg-sage-2" /> Robinhood Chain
            </span>
            <span>{row.name}</span>
            <span className="tag-soon">Soon</span>
          </p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <StatGrid
            stats={[
              { label: "Max leverage", value: `${lev.toFixed(2)}×`, note: "Proposed ceiling" },
              { label: `Net APY at ${lev.toFixed(2)}×`, value: "—", note: "Rates set once markets open" },
              { label: "Deposited in this pair", value: "—", note: "Opens at launch" },
              { label: `${s} venue liquidity`, value: compact(row.liquidityUsd || null), note: "Live, for the swap in and out" },
            ]}
          />

          <Block title="What Multiply Means">
            <p>
              Multiply holds more {s} than you deposit. You put in {s}; in one transaction USDG is borrowed against it, swapped for more {s} at the fairest venue, and deposited too. At {lev.toFixed(2)}× you hold {lev.toFixed(2)} times what you put in and owe USDG for the difference.
            </p>
            <p className="mt-3">
              Gains and losses both scale by the same multiple. Deposit $1,000 at {lev.toFixed(2)}×: you hold ${Math.round(1000 * lev).toLocaleString("en-US")} of {s} and owe ${Math.round(1000 * (lev - 1)).toLocaleString("en-US")} of USDG.
            </p>
            <div className="mt-5 max-w-[520px] overflow-hidden rounded-[12px] border border-line">
              <div className="table-head grid grid-cols-3 border-b border-line px-4 py-2.5">
                <span>{s} moves</span>
                <span className="text-right">Your $1,000 becomes</span>
                <span className="text-right">Change</span>
              </div>
              {moves.map((m) => {
                const change = m * lev;
                return (
                  <div key={m} className="num grid grid-cols-3 border-b border-line px-4 py-2.5 text-[13.5px] last:border-b-0">
                    <span>{m > 0 ? `+${m}%` : m === 0 ? "0%" : `−${Math.abs(m)}%`}</span>
                    <span className="text-right text-ink">${Math.max(0, Math.round(1000 * (1 + change / 100))).toLocaleString("en-US")}</span>
                    <span className={`text-right ${change > 0 ? "text-up" : change < 0 ? "text-down" : ""}`}>{change > 0 ? `+${change.toFixed(0)}%` : change < 0 ? `−${Math.abs(change).toFixed(0)}%` : "0%"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[14px] text-mute">
              At the full {lev.toFixed(2)}×, a {fall.toFixed(1)}% fall in {s} from where you opened takes the loan to the proposed {row.liqLtv}% liquidation LTV and part of the position is sold to repay it. Figures ignore interest and swap costs.
            </p>
          </Block>

          <Block title="How It Works">
            <ol className="grid list-decimal gap-2 pl-5 text-[15px]">
              <li>You choose how much {s} to deposit and the leverage, up to {lev.toFixed(2)}×.</li>
              <li>One transaction borrows USDG, buys {s} at the fairest quote, deposits everything and borrows against it. If any step fails, none of it happens.</li>
              <li>Closing runs in reverse: the debt is repaid, the {s} is withdrawn, enough is sold to cover the loan and the rest returns to you.</li>
            </ol>
          </Block>

          <Block title="Risks">
            <ul className="grid list-disc gap-2 pl-5 text-[15px]">
              <li>Losses grow by the same multiple as gains. A fall past the liquidation point sells part of the position at a penalty.</li>
              <li>When the borrow rate is above what {s} earns, the position costs money to hold.</li>
              <li>Stock Tokens can be paused by their issuer and follow US market hours. This page is not investment advice.</li>
            </ul>
          </Block>
        </div>
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <MultiplyCalculator row={row} />
        </div>
      </div>
      <div className="mt-10">
        <SourceNote live={market.sources.oracle}>{market.sources.oracle ? "Live oracle price and venue depth; Multiply opens at launch." : "Oracle price unavailable right now."}</SourceNote>
      </div>
    </div>
  );
}
