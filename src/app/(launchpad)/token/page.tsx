import type { Metadata } from "next";
import { BRAND, TOKEN } from "@/config/brand";
import { FeeFlow } from "@/components/launchpad/FeeFlow";
import { TokenCaCard } from "@/components/launchpad/TokenCaCard";
import { readTokenFacts } from "@/components/launchpad/token-server";
import { count } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: BRAND.symbol, description: `How fees across ${BRAND.name} are planned to buy and burn ${BRAND.symbol}.` };

const BURN_OUT = [
  { title: `Buy and burn ${BRAND.symbol}`, sub: "Bought in its own pool, then sent to 0xdead" },
  { title: "Treasury", sub: "Kept to run the protocol" },
];

const EXPLAIN = [
  {
    t: `Every launch buys and burns ${BRAND.symbol}`,
    b: `A launched token carries a trading fee of 1% to 5%, set once by its creator. Most of it belongs to the creator. The protocol's share is planned to buy ${BRAND.symbol} in its pool and burn it, with a smaller part going to the treasury.`,
  },
  {
    t: `Creator pools buy and burn ${BRAND.symbol}`,
    b: "A creator can open extra pools of their token against the most traded stocks. When those fees are collected through the launchpad, the protocol's share follows the same path: bought, burned, and part to the treasury.",
  },
  {
    t: `Lending and pool markets buy and burn ${BRAND.symbol}`,
    b: "Launched tokens are set to get lending markets and pool markets. The protocol's share of the interest and of the pool fees is planned to take the same route.",
  },
  {
    t: `Product fees buy and burn ${BRAND.symbol}`,
    b: `Fees from ${BRAND.name} products, from swaps and private swaps to baskets and lending, are planned to buy ${BRAND.symbol} on the open market. What is bought is burned, and a part goes to the treasury.`,
  },
];

async function readSupply() {
  if (!TOKEN.isLive) return null;
  try {
    return (await readTokenFacts(BRAND.ca))?.supply ?? null;
  } catch {
    return null;
  }
}

export default async function TokenPage() {
  const supply = await readSupply();
  const stats = [
    { label: "Burned so far", value: "—", note: `${BRAND.symbol} burned or at 0xdead` },
    { label: "Supply", value: supply !== null ? count(supply) : "—", note: TOKEN.isLive ? "Total supply now, read from the contract" : "Read from the contract once it is live" },
    { label: "Burned share", value: "—", note: "Of the supply minted at launch" },
  ];
  return (
    <div className="wrap pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">{BRAND.symbol}</p>
      <h1 className="h-hero mt-4 max-w-[640px] !text-[clamp(36px,4.6vw,56px)]">Every fair trade buys and burns {BRAND.symbol}.</h1>
      <p className="mt-5 max-w-[600px] text-[18px] leading-[1.6] text-mute">
        Launches, pools, lending and every {BRAND.name} product are designed to send a share of their fees into buying {BRAND.symbol} on Robinhood Chain and burning it. This is the planned model; it starts with the first fees after launch.
      </p>

      <div className="mt-10">
        <TokenCaCard />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[14px] text-ink-2">{s.label}</p>
            <p className="num mt-2 text-[38px] font-medium leading-none tracking-[-0.02em]">{s.value}</p>
            <p className="mt-2 text-[13px] text-mute">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="card mt-12 grid grid-cols-1 gap-14 p-5 sm:p-8">
        <p className="-mb-6 flex items-center gap-2 text-[12.5px] text-mute">
          <span className="size-1.5 rounded-full bg-warn" /> Planned fee routing. Nothing has been collected or burned yet.
        </p>
        <FeeFlow
          label="Launch fees"
          sources={[
            { title: "Robinhood Chain launches", sub: "1–5% fee on every trade", logo: "/tokens/eth.webp" },
            { title: "Creator's share", sub: "Kept, paid to holders or burned" },
          ]}
          center={{ title: "Protocol share", sub: "Written into every launch; the rest is the creator's" }}
          outcomes={BURN_OUT}
        />
        <FeeFlow
          label="Creator pool collections"
          sources={[
            { title: "TOKEN / NVDA", logo: "/tokens/nvda.webp" },
            { title: "TOKEN / META", logo: "/tokens/meta.webp" },
            { title: "TOKEN / SPCX", logo: "/tokens/spcx.webp" },
            { title: "TOKEN / AAPL", logo: "/tokens/aapl.webp" },
            { title: "Every creator pool", sub: "On Robinhood Chain" },
          ]}
          center={{ title: "Protocol share of each collection", sub: "Sold for ETH; the rest goes to the creator and holders" }}
          outcomes={BURN_OUT}
        />
        <FeeFlow
          label="Lending markets"
          sources={[
            { title: "Supply a launched token", sub: "Borrow USDG against it", soon: true },
            { title: "Interest paid by borrowers", sub: "Every launchpad market", soon: true },
          ]}
          center={{ title: "Protocol share of interest", sub: "Collected per market, sold for ETH" }}
          outcomes={BURN_OUT}
        />
        <FeeFlow
          label="Pool markets"
          sources={[
            { title: "TOKEN / NVDA", soon: true, logo: "/tokens/nvda.webp" },
            { title: "TOKEN / TSLA", soon: true, logo: "/tokens/tsla.webp" },
            { title: "TOKEN / AAPL", soon: true, logo: "/tokens/aapl.webp" },
            { title: "Every pool market", sub: "Opened by anyone", soon: true },
          ]}
          center={{ title: "Protocol share of pool fees", sub: "Collected per pool, sold for ETH" }}
          outcomes={BURN_OUT}
        />
        <FeeFlow
          label="Product fees"
          sources={[
            { title: "Swaps and bridges", sub: "No fee is charged today", soon: true },
            { title: "Private swaps", soon: true },
            { title: "Automated baskets", soon: true },
            { title: "Index baskets", soon: true },
            { title: "Lend and borrow", soon: true },
            { title: "Multiply", soon: true },
            { title: "New products", soon: true },
          ]}
          center={{ title: `Buy ${BRAND.symbol}`, sub: "On the open market" }}
          outcomes={[
            { title: `Burn ${BRAND.symbol}`, sub: "Removed from supply for good" },
            { title: "Treasury", sub: "Kept to run the protocol" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {EXPLAIN.map((e) => (
          <div key={e.t} className="card p-6 sm:p-7">
            <h2 className="h-card">{e.t}</h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-mute">{e.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
