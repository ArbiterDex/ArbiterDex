import type { Metadata } from "next";
import Link from "next/link";
import { CHAIN } from "@/config/brand";
import { readMarket } from "@/lib/market-server";
import { compact } from "@/lib/format";
import { PageIntro } from "@/components/ui/PageIntro";
import { LogoStack } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { ArrowRight } from "@/components/icons";
import { ExternalArrow } from "@/components/markets/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Issuers",
  description: "The issuers behind every asset Arbiter DEX prices on Robinhood Chain.",
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[14px] font-medium text-ink-2">{label}</p>
      <p className="num mt-3 truncate text-[34px] font-medium leading-none tracking-[-0.02em] sm:text-[40px]">{value}</p>
    </div>
  );
}

export default async function IssuersPage() {
  const market = await readMarket();
  const stocks = market.rows.filter((r) => r.issuer === "Robinhood");
  const stockValue = stocks.reduce((s, r) => s + (r.supply !== null && r.oracle ? r.supply * r.oracle.price : 0), 0);
  const stockVolume = stocks.reduce((s, r) => s + r.volume24h, 0);
  const pairsInUsdg = market.rows.reduce((s, r) => s + r.venues.filter((v) => v.quote === "USDG").length, 0);
  const usdgVolume = market.rows.reduce((s, r) => s + r.venues.filter((v) => v.quote === "USDG").reduce((a, v) => a + v.volume24h, 0), 0);
  const top = [...stocks].sort((a, b) => b.liquidityUsd - a.liquidityUsd).slice(0, 6);

  const issuers = [
    {
      name: "Robinhood",
      legal: "Robinhood Stock Tokens",
      mark: "R",
      body: `Tokens that track US-listed shares and funds, issued on ${CHAIN.name}. Every contract listed here is checked against the issuer's token beacon, so lookalikes never reach a route.`,
      stats: [
        { label: "Assets", value: stocks.length },
        { label: "Pools trading them", value: market.sources.venues ? stocks.reduce((s, r) => s + r.venues.length, 0) : "—" },
        { label: "On-chain value", value: market.sources.supply ? compact(stockValue) : "—" },
        { label: "24h volume", value: market.sources.venues ? compact(stockVolume) : "—" },
      ],
      logos: top.map((r) => ({ src: r.logo, symbol: r.symbol })),
      href: "/assets?issuer=Robinhood",
      site: "https://robinhood.com",
    },
    {
      name: "Paxos",
      legal: "Global Dollar (USDG)",
      mark: "P",
      body: `USDG, the dollar stablecoin that almost every stock pool on ${CHAIN.name} is quoted in. It is the unit Arbiter DEX settles fair prices in.`,
      stats: [
        { label: "Assets", value: 1 },
        { label: "Pools quoted in USDG", value: market.sources.venues ? pairsInUsdg : "—" },
        { label: "Reference price", value: "$1.00" },
        { label: "24h volume in USDG pools", value: market.sources.venues ? compact(usdgVolume) : "—" },
      ],
      logos: [{ src: "/tokens/usdg.webp", symbol: "USDG" }],
      href: "/assets?issuer=Paxos",
      site: "https://paxos.com",
    },
  ];

  return (
    <div className="wrap pb-24">
      <PageIntro
        eyebrow="Issuers"
        title="Every Issuer. One Arbiter."
        lead={
          <>
            Who stands behind each token you can trade here. <b className="font-medium text-ink">{issuers.length} issuers, {stocks.length + 1} assets</b>, one fair price.
          </>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {issuers.map((it) => (
          <article key={it.name} className="panel flex flex-col p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-[10px] bg-parchment font-wide text-[20px] text-onparch">{it.mark}</span>
              <div>
                <h2 className="text-[20px] font-medium leading-tight">{it.name}</h2>
                <p className="text-[13px] text-mute">{it.legal}</p>
              </div>
            </div>
            <p className="mt-5 text-[14.5px] leading-[1.6] text-ink-2">{it.body}</p>
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8">
              {it.stats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
            <div className="mt-7 flex items-center gap-3 text-[13px] text-mute">
              <LogoStack items={it.logos} size={22} />
              <span>{CHAIN.name}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={it.href} className="btn btn-ghost !h-10">
                View Assets <ArrowRight className="size-3.5" />
              </Link>
              <a href={it.site} target="_blank" rel="noreferrer" className="btn btn-ghost !h-10">
                Website <ExternalArrow />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SourceNote live={market.sources.venues || market.sources.supply}>Supply read from each contract · prices from Chainlink · volume from Dexscreener</SourceNote>
        <p className="text-[13px] text-mute">More issuers are listed as their tokens reach {CHAIN.name} with a verifiable price feed.</p>
      </div>
    </div>
  );
}
