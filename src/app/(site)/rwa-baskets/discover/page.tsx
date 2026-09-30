import type { Metadata } from "next";
import { INDEX_BASKETS, STRATEGIES } from "@/config/baskets";
import { readMarket } from "@/lib/market-server";
import { toCard } from "@/components/baskets/data";
import { DiscoverTable } from "@/components/baskets/DiscoverTable";
import { PageIntro } from "@/components/ui/PageIntro";
import { SourceNote } from "@/components/ui/SourceNote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Discover Baskets", description: "Every index and automated basket on Arbiter DEX, searchable by holding." };

export default async function DiscoverPage() {
  const market = await readMarket();
  const cards = [...INDEX_BASKETS, ...STRATEGIES].map((b) => toCard(b, market));
  const live = market.sources.venues;
  return (
    <div className="wrap pb-24">
      <PageIntro
        eyebrow="Tokenized Baskets"
        title="Discover Every Basket"
        lead={
          <>
            <b className="font-medium text-ink">{INDEX_BASKETS.length} index baskets</b> and <b className="font-medium text-ink">{STRATEGIES.length} automated baskets</b>, all built from verified Stock Tokens.
          </>
        }
      />
      <div className="mt-10">
        <DiscoverTable cards={cards} />
      </div>
      <div className="mt-5">
        <SourceNote live={live}>{live ? "Leg liquidity and 24h moves read from Robinhood Chain venues via Dexscreener, sorted deepest first." : "Venue data is unavailable right now; baskets are listed as published."}</SourceNote>
      </div>
    </div>
  );
}
