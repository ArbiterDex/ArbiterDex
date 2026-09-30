import Link from "next/link";
import type { IndexBasket, StrategyBasket } from "@/config/baskets";
import type { Market } from "@/lib/market-server";
import { priceLegs } from "@/components/baskets/data";
import { AllocationBar, Change, shade } from "@/components/baskets/Cards";
import { GlyphTile } from "@/components/baskets/Glyph";
import { BuyPanel } from "@/components/baskets/BuyPanel";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { BackIcon, CheckIcon } from "@/components/icons";
import { compact, pct, price } from "@/lib/format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="text-[26px] font-medium tracking-[-0.02em]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="min-w-0 p-5">
      <p className="text-[12.5px] text-mute">{label}</p>
      <p className="num mt-2 truncate text-[24px] font-medium tracking-[-0.01em] sm:text-[28px]">{value}</p>
      {note ? <p className="mt-1 text-[12px] text-mute">{note}</p> : null}
    </div>
  );
}

/** Detail page body shared by index baskets and automated strategies. */
export function BasketDetail({ basket, market }: { basket: IndexBasket | StrategyBasket; market: Market }) {
  const p = priceLegs(basket.legs, market);
  const isIndex = basket.kind === "index";
  const live = market.sources.oracle;
  const legsForCard = p.legs.map((l) => ({ symbol: l.symbol, logo: l.logo, weight: l.weight }));

  return (
    <div className="wrap pb-24 pt-10">
      <Link href="/rwa-baskets" className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-line-2 px-2.5 text-[13px] text-ink-2 hover:text-ink">
        <BackIcon className="size-3.5" /> All baskets
      </Link>

      <header className="mt-8 flex items-start gap-4">
        <GlyphTile name={basket.glyph} size={60} />
        <div className="min-w-0">
          <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[38px]">{basket.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-ink-2">
            <span className={`num font-medium ${p.change24h === null ? "text-mute" : p.change24h >= 0 ? "text-up" : "text-down"}`}>{pct(p.change24h)} 24h</span>
            {isIndex ? <span className="text-mute">${basket.symbol}</span> : null}
            <span className="text-mute">{p.legs.length} legs</span>
            {!isIndex ? <span className="text-mute">{basket.group}</span> : null}
            <span className="chip !h-6 !text-[12px]">
              <span className="size-1.5 rounded-full bg-sage-2" /> Robinhood Chain
            </span>
            {!isIndex ? <span className="tag-soon">Preview</span> : null}
          </div>
        </div>
      </header>

      {!isIndex ? (
        <div className="mt-5 flex flex-wrap gap-2 text-[12.5px]">
          {[
            ["legs", String(p.legs.length)],
            ["rule", basket.rule],
            ["largest", `${p.legs[0].symbol} ${p.legs[0].weight}%`],
            ["rebalanced", basket.rebalance],
            ["funded in", "USDG on Robinhood Chain"],
            ["minimum", "set at launch"],
          ].map(([k, v]) => (
            <span key={k} className="rounded-[6px] border border-line px-2.5 py-1 text-mute">
              {k} <span className="text-ink">{v}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Composition panel, in place of a price history this basket does not have yet. */}
          <div className="panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[14px] font-medium">Target weights</p>
              <Change value={p.change24h} label={p.coverage > 0 && p.coverage < 1 ? "24h, legs with data" : "24h, weighted"} />
            </div>
            <div className="mt-5">
              <AllocationBar legs={legsForCard} height={16} />
            </div>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {p.legs.map((l, i) => (
                <li key={l.symbol} className="flex items-center gap-2.5 text-[13.5px]">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: shade(i) }} />
                  <span className="text-ink">{l.symbol}</span>
                  <span className="min-w-0 flex-1 truncate text-mute">{l.name}</span>
                  <span className="num text-ink-2">{l.weight.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-line pt-4 text-[12.5px] leading-[1.5] text-mute">
              This basket has no price history yet: it has not launched. The 24h figure is the weighted move of its legs on Robinhood Chain venues, before fees and rebalancing.
            </p>
          </div>

          {!isIndex ? (
            <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-[12px] border border-line sm:grid-cols-3 [&>*+*]:border-t [&>*+*]:border-line sm:[&>*+*]:border-l sm:[&>*+*]:border-t-0">
              <Stat label="Total invested" value="—" note="Opens at launch" />
              <Stat label="Investors" value="—" note="Opens at launch" />
              <Stat label="Rebalancing" value={<span className="text-[20px]">By rule</span>} note={basket.rebalance} />
            </div>
          ) : null}

          <Section title="About this basket">
            <p className="text-[17px] leading-[1.65] text-ink-2">{basket.about}</p>
            <p className="mt-4 text-[15px] leading-[1.6] text-mute">{isIndex ? basket.method : `Rule: ${basket.rule}. Rebalanced ${basket.rebalance.toLowerCase()}.`}</p>
          </Section>

          <Section title="Holdings">
            <div className="overflow-hidden rounded-[12px] border border-line">
              <p className="flex items-start gap-2.5 border-b border-line px-5 py-3.5 text-[13px] text-ink-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-sage-2" />
                <span>
                  <b className="font-medium text-ink">Every leg is an official Stock Token.</b> Each contract was verified on-chain against Robinhood&apos;s token beacon; look-alike tokens with the same ticker are excluded.
                </span>
              </p>
              <div className="table-head hidden grid-cols-[minmax(0,2.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)] gap-4 border-b border-line px-5 py-3 md:grid">
                <span>Asset</span>
                <span className="text-right">Weight</span>
                <span className="text-right">Oracle price</span>
                <span className="text-right">24h</span>
                <span className="text-right">Liquidity</span>
              </div>
              <ul>
                {p.legs.map((l) => (
                  <li key={l.symbol} className="border-b border-line last:border-b-0">
                    <Link href={`/assets/${l.symbol}`} className="grid grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-white/[0.02] md:grid-cols-[minmax(0,2.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
                      <span className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                        <TokenLogo src={l.logo} symbol={l.symbol} size={30} />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium">{l.name}</span>
                          <span className="block text-[12px] text-mute">{l.symbol}</span>
                        </span>
                      </span>
                      <span className="num text-[13.5px] md:text-right">
                        <span className="text-mute md:hidden">Weight </span>
                        {l.weight.toFixed(2)}%
                      </span>
                      <span className="num text-right text-[13.5px]">{price(l.price)}</span>
                      <span className="text-[13.5px] md:text-right">
                        <span className="text-mute md:hidden">24h </span>
                        <span className={`num ${l.change24h === null ? "text-mute" : l.change24h >= 0 ? "text-up" : "text-down"}`}>{pct(l.change24h)}</span>
                      </span>
                      <span className="num text-right text-[13.5px] text-ink-2">{compact(l.liquidityUsd || null)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {isIndex ? (
            <Section title="Fees and stats">
              <div className="grid grid-cols-2 overflow-hidden rounded-[12px] border border-line sm:grid-cols-3">
                <Stat label="Arbiter DEX fee" value="None" note="Pool fees still apply per leg" />
                <Stat label="Legs" value={p.legs.length} />
                <Stat label="Oracle coverage" value={`${Math.round(p.priced * 100)}%`} note="Weight priced by Chainlink" />
                <Stat label="Leg liquidity" value={compact(p.liquidityUsd || null)} />
                <Stat label="Leg volume 24h" value={compact(p.volume24h || null)} />
                <Stat label="Holders" value="—" note="Opens at launch" />
              </div>
            </Section>
          ) : (
            <>
              <Section title="How Rebalancing Works">
                <div className="grid gap-4 text-[16px] leading-[1.65] text-ink-2">
                  <p>Each leg has a target weight. Prices pull the legs apart, so on schedule whatever has grown past target is trimmed and whatever has fallen behind is topped up. Every trade is quoted against the oracle first; a rebalance that would fill unfairly waits for the next window.</p>
                  <p>Funds stay in an account only your address controls. Withdrawing sells the legs back into USDG and sends it to your wallet.</p>
                </div>
              </Section>
              <Section title="How It Works">
                <ol className="grid list-decimal gap-2.5 pl-5 text-[15px] leading-[1.6] text-ink-2">
                  <li>You open a strategy account with one signature and fund it in USDG.</li>
                  <li>The legs are bought at target weights, each routed to its fairest venue.</li>
                  <li>The rule rebalances on schedule; you can pause it or rebalance by hand.</li>
                  <li>Withdraw at any time: holdings are sold and the USDG comes back to you.</li>
                </ol>
                <p className="mt-4 text-[13px] text-mute">Strategy accounts are a preview. Nothing on this page executes yet.</p>
              </Section>
            </>
          )}

          <div className="panel mt-10 p-4">
            <SourceNote live={live}>
              {live ? "Stock Token oracle prices follow US market hours, 24 hours a day, five days a week. Outside those hours legs carry their last reported price." : "Oracle prices could not be read right now."}
            </SourceNote>
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BuyPanel name={isIndex ? `$${basket.symbol}` : basket.name} mode={isIndex ? "buy" : "invest"} legs={p.legs.map((l) => ({ symbol: l.symbol, logo: l.logo, weight: l.weight, price: l.price }))} />
        </div>
      </div>
    </div>
  );
}
