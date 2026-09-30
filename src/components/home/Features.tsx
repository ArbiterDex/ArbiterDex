import { Suspense } from "react";
import { STOCK_ASSETS, assetBySymbol } from "@/config/assets";
import { CheckIcon } from "@/components/icons";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { readMarket } from "@/lib/market-server";
import { price, bps } from "@/lib/format";

function FeatureCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="card flex min-h-[340px] items-center justify-center overflow-hidden px-5 py-10 sm:min-h-[430px] sm:px-10">{children}</div>
      <h3 className="h-card mt-8">{title}</h3>
      <p className="mt-3 max-w-[440px] text-[14px] leading-[1.6] text-ink-2">{body}</p>
    </div>
  );
}

function Pill({ symbol }: { symbol: string }) {
  const a = assetBySymbol(symbol);
  return (
    <span className="flex h-[30px] items-center gap-1.5 rounded-[6px] bg-white/[0.06] pl-1.5 pr-2.5 text-[14px] font-medium">
      <TokenLogo src={a?.logo} symbol={symbol} size={20} />
      {symbol}
    </span>
  );
}

function TokenList() {
  const rows: [string, string[]][] = [
    ["Dollars", ["USDG"]],
    ["Stocks", ["NVDA", "AAPL", "TSLA", "SPCX"]],
    ["Funds", ["SPY", "QQQ", "GLD", "SGOV"]],
  ];
  return (
    <div className="w-full max-w-[540px] rounded-[12px] border border-line bg-night/60 p-5 sm:p-6">
      <p className="text-[14px] font-medium">Tradable right now</p>
      <p className="text-[13px] text-mute">Verified token list for Robinhood Chain</p>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, list]) => (
          <div key={label} className="flex flex-wrap items-center gap-2">
            <span className="chip chip-sage !h-[26px] !text-[12.5px]">{label}</span>
            {list.map((s) => (
              <Pill key={s} symbol={s} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
        <span className="chip">{STOCK_ASSETS.length} verified stock tokens</span>
        <span className="chip">1 dollar token</span>
        <span className="chip">Native ETH</span>
      </div>
    </div>
  );
}

async function LiveVenues() {
  const market = await readMarket();
  const row = market.rows.find((r) => r.symbol === "NVDA");
  const venues = (row?.venues ?? []).filter((v) => v.priceUsd).slice(0, 3);
  const oracle = row?.oracle?.price ?? null;
  if (!row || venues.length === 0) {
    return <p className="text-[14px] text-mute">Venue prices could not be read just now. They load live on the asset pages.</p>;
  }
  const scored = venues.map((v) => ({ v, dev: oracle && v.priceUsd ? ((v.priceUsd - oracle) / oracle) * 10_000 : null }));
  const fairest = scored.reduce((best, s) => (s.dev !== null && (best.dev === null || Math.abs(s.dev) < Math.abs(best.dev)) ? s : best), scored[0]);
  return (
    <div className="flex w-full max-w-[560px] flex-col gap-4 sm:flex-row sm:items-start">
      <div className="grid min-w-0 flex-1 gap-2.5">
        <p className="flex items-center gap-2 text-[13px] text-mute">
          <TokenLogo src={row.logo} symbol="NVDA" size={18} /> NVDA venues, read live
        </p>
        {scored.map(({ v, dev }) => {
          const on = v === fairest.v;
          return (
            <div key={v.pair} className={`flex items-center gap-3 rounded-[10px] px-4 py-3 ${on ? "bg-parchment text-onparch" : "border border-line bg-white/[0.03]"}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] text-[11px] font-semibold ${on ? "bg-onparch text-parchment" : "bg-white/[0.08] text-ink-2"}`}>{v.version || "AMM"}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">
                  {v.dex} · NVDA/{v.quote}
                </span>
                <span className={`block text-[13px] ${on ? "text-onparch/70" : "text-mute"}`}>
                  {price(v.priceUsd)} · {bps(dev)} vs oracle
                </span>
              </span>
            </div>
          );
        })}
        <p className="text-[12.5px] text-mute">Oracle reference {price(oracle)} · Chainlink</p>
      </div>
      <div className="flex shrink-0 gap-2 sm:flex-col">
        <span className="chip !h-[26px] !text-[12.5px]">Compared live</span>
        <span className="flex h-[30px] items-center gap-1.5 rounded-[6px] bg-parchment px-2.5 text-[13.5px] font-medium text-onparch">
          <CheckIcon className="size-3.5" /> Fairest
        </span>
        <span className="chip !h-[26px] !text-[12.5px]">Deepest</span>
      </div>
    </div>
  );
}

function VenueSkeleton() {
  return (
    <div className="grid w-full max-w-[460px] gap-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[62px] animate-pulse rounded-[10px] bg-white/[0.04]" />
      ))}
    </div>
  );
}

function OracleGrid() {
  const tiles = ["NVDA", "AAPL", "TSLA", "SPY", "GLD", "SGOV", "META", "MSFT", "AMZN", "COIN", "QQQ", "PLTR"];
  return (
    <div className="w-full max-w-[560px]">
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {tiles.map((s, i) => (
          <div key={s} className={`grid aspect-square place-items-center rounded-[10px] border border-line ${i === 1 ? "bg-white/[0.08]" : "bg-white/[0.03]"}`}>
            <TokenLogo src={assetBySymbol(s)?.logo} symbol={s} size={30} />
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-mute">Referenced to {STOCK_ASSETS.length + 1} Chainlink feeds</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">{STOCK_ASSETS.length} stocks and funds</span>
        <span className="chip">ETH / USD</span>
        <span className="chip">On Robinhood Chain</span>
      </div>
    </div>
  );
}

function Steps() {
  const steps = [
    ["Exact approval", "Only the amount of this trade, never unlimited", false],
    ["Signed in your wallet", "One signature from your own address", false],
    ["Settled on Robinhood Chain", "Visible on the public explorer", false],
    ["Ruling kept with the receipt", "Quote, oracle price and the gap between them", true],
  ] as const;
  return (
    <div className="grid w-full max-w-[560px] gap-2.5">
      {steps.map(([title, body, done], i) => (
        <div key={title} className="flex items-center gap-3.5 rounded-[10px] border border-line bg-white/[0.03] px-4 py-3" style={{ marginLeft: i === 3 ? -4 : 0 }}>
          <span className={`grid size-7 shrink-0 place-items-center rounded-[6px] ${done ? "bg-sage text-night" : "bg-white/[0.07] text-ink-2"}`}>
            <CheckIcon className="size-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-medium">{title}</span>
            <span className="block text-[12.5px] text-mute">{body}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section className="wrap-land pb-24 pt-20 sm:pt-[100px]">
      <div className="grid grid-cols-1 gap-x-5 gap-y-16 lg:grid-cols-2">
        <FeatureCard title="Every Stock, One Verified Contract" body="Only the issuer's own contract is listed. Tokens that borrow a famous ticker are checked on-chain and left out.">
          <TokenList />
        </FeatureCard>
        <FeatureCard title="The Fairest Price on Every Trade" body="Each order is priced across the pools that trade it, then held against the oracle. The fairest route you can execute comes first.">
          <Suspense fallback={<VenueSkeleton />}>
            <LiveVenues />
          </Suspense>
        </FeatureCard>
        <FeatureCard title="An Independent Reference Price" body="Chainlink feeds on Robinhood Chain act as the neutral witness, so no quote is ever judged by the venue that made it.">
          <OracleGrid />
        </FeatureCard>
        <FeatureCard title="Settled On-Chain, Fully Transparent" body="Your wallet sends the trade itself. Nothing is held for you, and every step can be checked on the public explorer.">
          <Steps />
        </FeatureCard>
      </div>
    </section>
  );
}
