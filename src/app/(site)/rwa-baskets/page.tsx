import type { Metadata } from "next";
import Link from "next/link";
import { INDEX_BASKETS, STRATEGIES, STRATEGY_GROUPS } from "@/config/baskets";
import { readMarket } from "@/lib/market-server";
import { toCard } from "@/components/baskets/data";
import { IndexCard } from "@/components/baskets/Cards";
import { StrategyBrowser } from "@/components/baskets/StrategyBrowser";
import { LogoField, PlanesArt } from "@/components/baskets/Art";
import { StatStrip } from "@/components/ui/StatStrip";
import { SourceNote } from "@/components/ui/SourceNote";
import { ArrowRight } from "@/components/icons";
import { compact } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tokenized Baskets",
  description: "Themed baskets of verified Stock Tokens on Robinhood Chain, every leg priced live against an independent oracle.",
};

export default async function BasketsPage() {
  const market = await readMarket();
  const index = INDEX_BASKETS.map((b) => toCard(b, market));
  const strategies = STRATEGIES.map((b) => toCard(b, market));
  const legs = new Set([...INDEX_BASKETS, ...STRATEGIES].flatMap((b) => b.legs.map((l) => l.symbol)));
  const rows = market.rows.filter((r) => legs.has(r.symbol));
  const liquidity = rows.reduce((s, r) => s + r.liquidityUsd, 0);
  const volume = rows.reduce((s, r) => s + r.volume24h, 0);
  const live = market.sources.oracle || market.sources.venues;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <LogoField />
        <div className="wrap relative flex min-h-[460px] flex-col items-center justify-center py-20 text-center sm:min-h-[560px]">
          <p className="eyebrow">Tokenized Baskets</p>
          <h1 className="h-hero mt-5 max-w-[780px]">
            Own a Thesis.
            <br />
            Not One Ticker at a Time.
          </h1>
          <p className="lead mt-5 max-w-[560px]">
            <b>{INDEX_BASKETS.length + STRATEGIES.length} baskets</b>. <b>{legs.size} verified Stock Tokens</b>. Every leg priced against the oracle before you commit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#baskets" className="btn btn-cream">
              Explore Baskets <ArrowRight className="size-3.5" />
            </a>
            <Link href="/docs#tokenized-baskets" className="btn btn-ghost">
              How Baskets Work
            </Link>
          </div>
        </div>
      </section>

      {/* The arbiter explainer */}
      <section className="wrap-land grid grid-cols-1 items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="eyebrow">The Arbiter</p>
          <h2 className="h-sec mt-5">Every Leg Checked. One Order.</h2>
          <p className="lead mt-5 max-w-[560px]">A basket is only as fair as its worst fill. Arbiter DEX prices each leg against an independent oracle and the venues that trade it, so a diversified position is a single, checked decision.</p>
          <dl className="mt-10 grid gap-7">
            <div>
              <dt className="text-[14px] font-medium">Index Baskets</dt>
              <dd className="mt-1 text-[14px] text-ink-2">
                A whole thesis at published weights. <b className="font-medium text-ink">Every leg verified on-chain.</b> <b className="font-medium text-ink">No Arbiter DEX fee on the legs.</b>
              </dd>
            </div>
            <div>
              <dt className="text-[14px] font-medium">Automated Baskets</dt>
              <dd className="mt-1 text-[14px] text-ink-2">
                Rule-based strategies: <b className="font-medium text-ink">equal weight</b>, <b className="font-medium text-ink">barbells</b> or <b className="font-medium text-ink">capped size</b>, rebalanced to target.
              </dd>
            </div>
            <div>
              <dt className="text-[14px] font-medium">Issuer and Chain</dt>
              <dd className="mt-1 text-[14px] text-ink-2">Official Robinhood Stock Tokens, settled on Robinhood Chain.</dd>
              <dd className="mt-3 flex flex-wrap gap-2">
                <span className="chip">Robinhood Stock Tokens</span>
                <span className="chip">Chainlink reference prices</span>
                <span className="chip">
                  <span className="size-2 rounded-full bg-sage-2" /> Robinhood Chain
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex min-w-0 justify-center">
          <PlanesArt />
        </div>
      </section>

      {/* Index baskets */}
      <section id="baskets" className="wrap-land scroll-mt-24 py-16 sm:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Index Baskets</p>
            <h2 className="h-sec mt-5 max-w-[640px]">One Order. A Whole Thesis.</h2>
            <p className="lead mt-5 max-w-[560px]">
              <b>{INDEX_BASKETS.length} baskets</b> at published weights. <b>Priced leg by leg</b>, live.
            </p>
          </div>
          <Link href="/rwa-baskets/discover" className="btn btn-ghost self-start lg:self-auto">
            Discover All Baskets <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-10">
          <StatStrip
            stats={[
              { label: "Baskets", value: INDEX_BASKETS.length + STRATEGIES.length },
              { label: "Distinct legs", value: legs.size },
              { label: "Leg liquidity", value: compact(liquidity || null), note: "All venues, Robinhood Chain" },
              { label: "Leg volume 24h", value: compact(volume || null) },
            ]}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {index.map((c) => (
            <IndexCard key={c.id} b={c} />
          ))}
        </div>
        <div className="mt-5">
          <SourceNote live={live}>
            {live ? "Legs priced by Chainlink on Robinhood Chain; liquidity, volume and 24h moves from on-chain venues via Dexscreener. One-order basket buys open at launch." : "Live prices could not be read right now. Weights are shown as published."}
          </SourceNote>
        </div>
      </section>

      {/* Automated strategies */}
      <section id="automated" className="wrap-land scroll-mt-24 pb-24 pt-16 sm:pt-24">
        <p className="eyebrow flex items-center gap-2">
          Automated Baskets <span className="tag-soon">Preview</span>
        </p>
        <h2 className="h-sec mt-5 max-w-[720px]">{STRATEGIES.length} Strategies. Rebalanced by Rule.</h2>
        <p className="lead mt-5 max-w-[560px]">
          Stocks, index funds, metals and treasuries. <b>Held in your own account</b> and <b>brought back to target</b> by a rule you can read.
        </p>
        <div className="mt-10">
          <StrategyBrowser cards={strategies} groups={STRATEGY_GROUPS} />
        </div>
      </section>
    </>
  );
}
