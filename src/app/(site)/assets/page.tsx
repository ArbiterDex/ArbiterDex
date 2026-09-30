import type { Metadata } from "next";
import { CATEGORIES, parseCategory, type Category } from "@/config/assets";
import { readMarket } from "@/lib/market-server";
import { compact } from "@/lib/format";
import { PageIntro } from "@/components/ui/PageIntro";
import { StatStrip } from "@/components/ui/StatStrip";
import { SourceNote } from "@/components/ui/SourceNote";
import { AssetsTable, type AssetRow } from "@/components/markets/AssetsTable";
import { Segments } from "@/components/markets/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All assets",
  description: "Every tokenized asset Arbiter DEX can price on Robinhood Chain, each weighed against its Chainlink oracle.",
};

const ISSUERS = ["Robinhood", "Paxos"] as const;

export default async function AssetsPage({ searchParams }: { searchParams: Promise<{ category?: string; issuer?: string }> }) {
  const sp = await searchParams;
  const category = parseCategory(sp.category);
  const issuer = ISSUERS.find((i) => i.toLowerCase() === (sp.issuer ?? "").toLowerCase()) ?? null;
  const market = await readMarket();

  const tradable = market.rows.filter((r) => r.category !== "Crypto");
  const inScope = tradable.filter((r) => (!category || r.category === category) && (!issuer || r.issuer === issuer));

  const rows: AssetRow[] = inScope.map((r) => ({
    symbol: r.symbol,
    name: r.name,
    logo: r.logo,
    issuer: r.issuer,
    category: r.category,
    oracle: r.oracle?.price ?? null,
    venuePrice: r.venues.find((v) => v.priceUsd)?.priceUsd ?? null,
    spreadBps: r.spreadBps,
    change24h: r.change24h,
    volume24h: r.volume24h,
    liquidityUsd: r.liquidityUsd,
    venues: r.venues.length,
    supplyUsd: r.supply !== null && r.oracle ? r.supply * r.oracle.price : null,
  }));

  const venues = inScope.reduce((s, r) => s + r.venues.length, 0);
  const volume = inScope.reduce((s, r) => s + r.volume24h, 0);
  const catLabel = category ? CATEGORIES.find((c) => c.key === category)!.label : null;
  const count = (c: Category) => tradable.filter((r) => r.category === c && (!issuer || r.issuer === issuer)).length;
  const q = (c: string | null) => {
    const p = new URLSearchParams();
    if (c) p.set("category", c);
    if (issuer) p.set("issuer", issuer);
    const s = p.toString();
    return s ? `/assets?${s}` : "/assets";
  };

  const empty =
    category === "Private Credit"
      ? "No private credit token is live on Robinhood Chain yet. It will be listed here, oracle and all, once one is."
      : issuer === "Paxos"
        ? "Paxos issues USDG, the dollar every asset here is quoted in. It is the base currency, so it has no row of its own."
        : "No asset in this view yet.";

  return (
    <div className="wrap pb-24">
      <PageIntro
        eyebrow={issuer ? `Issuer · ${issuer}` : catLabel ? `Markets · ${catLabel}` : "Markets"}
        title={catLabel ? `${catLabel}, Weighed Fairly.` : "Every Asset. One Fair Price."}
        lead={
          <>
            <b className="font-medium text-ink">{rows.length} tokenized assets</b> on Robinhood Chain, each priced on every venue that trades it and checked against an independent oracle.
          </>
        }
      />

      <div className="mt-10">
        <StatStrip
          stats={[
            { label: "Assets", value: rows.length },
            { label: "Venues compared", value: market.sources.venues ? venues : "—" },
            { label: "24h volume", value: market.sources.venues ? compact(volume) : "—" },
          ]}
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Segments
          items={[
            { label: "All", href: q(null), active: !category, count: tradable.filter((r) => !issuer || r.issuer === issuer).length },
            ...CATEGORIES.map((c) => ({ label: c.label, href: q(c.key), active: category === c.key, count: count(c.key) })),
          ]}
        />
        <SourceNote live={market.sources.oracle || market.sources.venues}>
          {market.sources.oracle ? "Oracle: Chainlink on Robinhood Chain" : "Oracle unreachable"} · {market.sources.venues ? "Venues: Dexscreener" : "Venues unreachable"} · refreshed each minute
        </SourceNote>
      </div>

      <div className="mt-6">
        <AssetsTable rows={rows} empty={empty} />
      </div>

      <p className="mt-6 max-w-[760px] text-[13px] leading-[1.6] text-mute">
        Spread is the deepest venue&apos;s price against the Chainlink reference. Stock feeds follow US market hours, so outside them a gap can mean the venue moved while the reference waited. On-chain value is the token&apos;s circulating supply times its oracle price.
      </p>
    </div>
  );
}
