import type { Metadata } from "next";
import Link from "next/link";
import { ALL_ASSETS, STOCK_ASSETS } from "@/config/assets";
import { CHAIN } from "@/config/brand";
import { ArrowRight, CheckIcon, LockIcon, ScaleIcon } from "@/components/icons";
import { NavIcon } from "@/components/site/NavIcon";
import { DotGrid, Kicker, LogoField, TickerStrip, TokenOrb } from "@/components/launchpad/Visuals";

export const metadata: Metadata = {
  title: "Launchpad",
  description: "Launch a token on Robinhood Chain paired with a tokenized stock, ETH or dollars, with a fair-price check on every trade.",
};

const PAIR_GRID = ["NVDA", "TSLA", "AAPL", "META", "AMZN", "GOOGL", "COIN", "AMD", "CRCL", "MSFT", "PLTR", "MSTR", "ASML", "INTC", "TSM", "SPY", "QQQ", "GLD"];

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-parchment">{children}</span>;
}

function Mock({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full max-w-[340px] rounded-[10px] border border-line bg-night/70 p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ${className}`}>{children}</div>;
}

function ProductCard({ title, body, soon, children, tall = false }: { title: string; body: string; soon?: boolean; children: React.ReactNode; tall?: boolean }) {
  return (
    <div className="card flex min-w-0 flex-col overflow-hidden p-6 sm:p-8">
      <div className={`flex flex-1 items-center justify-center py-6 ${tall ? "min-h-[280px]" : "min-h-[220px]"}`}>{children}</div>
      <div>
        <h3 className="h-card flex items-center gap-2 !text-[22px]">
          {title} {soon ? <span className="tag-soon">Soon</span> : null}
        </h3>
        <p className="mt-1.5 text-[14px] text-mute">{body}</p>
      </div>
    </div>
  );
}

function FeatureRow({ icon, kicker, title, body, visual, flip = false }: { icon: Parameters<typeof NavIcon>[0]["name"]; kicker: string; title: string; body: string; visual: React.ReactNode; flip?: boolean }) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={`card grid min-h-[300px] place-items-center p-6 sm:min-h-[340px] ${flip ? "lg:order-2" : ""}`}>{visual}</div>
      <div className={flip ? "lg:order-1" : ""}>
        <p className="flex items-center gap-2 text-[13px] text-ink-2">
          <span className="grid size-6 place-items-center rounded-[5px] bg-white/[0.06]">
            <NavIcon name={icon} className="size-3.5" />
          </span>
          {kicker}
        </p>
        <h3 className="mt-5 text-[32px] font-medium leading-[1.12] tracking-[-0.02em] sm:text-[40px]">{title}</h3>
        <p className="mt-4 max-w-[460px] text-[17px] leading-[1.6] text-mute">{body}</p>
      </div>
    </div>
  );
}

export default function LaunchpadPage() {
  const pairCount = ALL_ASSETS.length;
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 hidden w-[60%] lg:block">
          <LogoField />
        </div>
        <div className="wrap-land relative flex flex-col justify-center py-20 lg:min-h-[780px]">
          <div className="max-w-[560px]">
            <Kicker>Fair launch · Robinhood Chain</Kicker>
            <h1 className="h-hero mt-6">
              Launch more than a token. <Accent>Open a fair market.</Accent>
            </h1>
            <p className="mt-6 text-[19px] leading-[1.6] text-mute">Create a token, pair it with a tokenized stock, ETH or dollars, and let every trade be checked against a fair price from the first block.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/launchpad/launch" className="btn btn-cream !h-11 !px-6">
                Launch a token
              </Link>
              <Link href="/launchpad/explore" className="btn btn-ghost !h-11 !px-5 !text-ink">
                Explore launches <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-3 text-[14px] text-ink-2">
              <span className="grid size-6 place-items-center rounded-[5px] bg-sage-deep text-parchment">
                <ScaleIcon className="size-3.5" />
              </span>
              Opening on {CHAIN.name} · launches are not live yet
            </p>
          </div>
        </div>
      </section>

      <TickerStrip />

      {/* Products */}
      <section className="wrap-land pt-24 sm:pt-32">
        <Kicker>Products</Kicker>
        <h2 className="h-sec mt-5 max-w-[760px] !text-[clamp(36px,5.6vw,68px)]">
          One launchpad. <Accent>Every move</Accent> after launch.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
          <ProductCard title="Launch" body="Your token, created and trading in one signed transaction.">
            <Mock>
              <div className="flex items-center gap-2.5">
                <TokenOrb size={36} />
                <div>
                  <p className="text-[14px] font-medium">Your token</p>
                  <p className="text-[12px] text-mute">$TOKEN</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                {["ETH", "USDG", "NVDA"].map((s, i) => (
                  <span key={s} className={`chip !h-6 !text-[11px] ${i === 2 ? "border border-parchment/60 !text-ink" : ""}`}>
                    <img src={`/tokens/${s.toLowerCase()}.webp`} alt="" className="size-3.5 rounded-full bg-white" /> {s}
                  </span>
                ))}
              </div>
              <span className="btn btn-cream mt-3 !h-9 w-full !text-[13px]">Launch</span>
            </Mock>
          </ProductCard>
          <ProductCard title="Trade" body="Buy and sell against ETH or the pair asset, with the price checked each time.">
            <Mock>
              <div className="grid grid-cols-2 gap-1 text-center text-[12.5px]">
                <span className="rounded-[6px] bg-white/[0.08] py-1.5">Buy</span>
                <span className="py-1.5 text-mute">Sell</span>
              </div>
              <div className="row-tile mt-2 flex items-center justify-between px-3 py-2.5">
                <span className="num text-[18px]">0.05</span>
                <span className="chip !h-6 !text-[11px]">ETH</span>
              </div>
              <div className="row-tile mt-1.5 flex items-center justify-between px-3 py-2.5">
                <span className="num text-[18px] text-ink-2">≈ 9.4M</span>
                <span className="chip !h-6 !text-[11px]">TOKEN</span>
              </div>
              <span className="btn btn-cream mt-2 !h-9 w-full !text-[13px]">Buy TOKEN</span>
            </Mock>
          </ProductCard>
          <ProductCard title="Lending markets" soon tall body="Deposit a launched token and borrow USDG against it, without selling.">
            <Mock className="!max-w-[380px]">
              <div className="flex justify-between text-[11.5px] text-mute">
                <span>You supply</span>
                <span>Market · TOKEN / USDG</span>
              </div>
              <div className="row-tile mt-1.5 flex items-center justify-between px-3 py-2">
                <span className="flex items-center gap-2 text-[13px]">
                  <TokenOrb size={18} /> TOKEN
                </span>
                <span className="num text-[14px]">$1,000</span>
              </div>
              <p className="mt-3 text-[11.5px] text-mute">You borrow</p>
              <div className="row-tile mt-1.5 flex items-center justify-between px-3 py-2">
                <span className="num text-[20px]">350</span>
                <span className="chip !h-6 !text-[11px]">USDG</span>
              </div>
              <div className="relative mt-4 h-1 rounded-full bg-white/[0.08]">
                <span className="absolute inset-y-0 left-0 w-[35%] rounded-full bg-parchment" />
                <span className="absolute -top-1 left-[35%] size-3 -translate-x-1/2 rounded-full bg-parchment" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-mute">
                <span>Borrowing 35% of your collateral</span>
                <span className="text-up">Healthy</span>
              </div>
            </Mock>
          </ProductCard>
          <ProductCard title="Pool markets" soon tall body="Open a second market for any launched token against NVDA, TSLA or AAPL. Anyone can.">
            <Mock className="!max-w-[380px]">
              <div className="flex justify-between text-[11.5px]">
                <span className="text-mute">Open a market for TOKEN</span>
                <span className="text-parchment">Anyone can</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {["NVDA", "TSLA", "AAPL", "META"].map((s, i) => (
                  <span key={s} className={`row-tile flex flex-col items-center gap-1 py-2 text-[10.5px] ${i === 0 ? "!border-parchment/60" : ""}`}>
                    <img src={`/tokens/${s.toLowerCase()}.webp`} alt="" className="size-5 rounded-full bg-white" />
                    {s}
                  </span>
                ))}
              </div>
              <div className="row-tile mt-2 flex items-center justify-between px-3 py-2">
                <span className="text-[12.5px] font-medium">TOKEN / NVDA</span>
                <span className="text-[11px] text-mute">New market</span>
              </div>
              <span className="btn btn-cream mt-2 !h-9 w-full !text-[13px]">Create TOKEN / NVDA</span>
            </Mock>
          </ProductCard>
        </div>
      </section>

      {/* Why */}
      <section className="wrap-land pt-24 sm:pt-32">
        <Kicker>Why this launchpad</Kicker>
        <h2 className="h-sec mt-5 max-w-[640px]">
          Built for the <Accent>on-chain</Accent> stock market.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="card flex min-w-0 flex-col p-6 sm:p-8">
            <div className="grid flex-1 place-items-center py-8">
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {PAIR_GRID.map((s) => (
                  <span key={s} className="row-tile flex size-[72px] flex-col items-center justify-center gap-1.5 text-[10.5px] text-ink-2 sm:size-[78px]">
                    <img src={`/tokens/${s.toLowerCase()}.webp`} alt="" className="size-7 rounded-full bg-white" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="h-card !text-[22px]">Pair with {pairCount} assets</h3>
            <p className="mt-1.5 text-[14px] text-mute">{STOCK_ASSETS.length} verified Stock Tokens, ETH and USDG, each with a live pool on {CHAIN.name}.</p>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="card flex flex-col p-6 sm:p-8">
              <div className="grid flex-1 place-items-center py-6">
                <span className="grid size-14 place-items-center rounded-[12px] bg-sage-deep text-parchment">
                  <ScaleIcon className="size-7" />
                </span>
              </div>
              <h3 className="h-card !text-[22px]">Fair from the first trade</h3>
              <p className="mt-1.5 text-[14px] text-mute">Every trade is checked against an independent oracle price before you sign.</p>
            </div>
            <div className="card flex flex-col p-6 sm:p-8">
              <div className="grid flex-1 place-items-center py-6">
                <span className="grid size-14 place-items-center rounded-full border border-line-2 bg-white/[0.04] text-ink">
                  <LockIcon className="size-6" />
                </span>
              </div>
              <h3 className="h-card !text-[22px]">Liquidity locked</h3>
              <p className="mt-1.5 text-[14px] text-mute">It sits in the pool from the first trade. Nobody can pull it, including the creator.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="wrap-land pt-24 sm:pt-32">
        <Kicker>Platform</Kicker>
        <h2 className="h-sec mt-5">
          One platform. <Accent>Fair</Accent> from block one.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-20 sm:gap-24">
          <FeatureRow
            icon="bolt"
            kicker="Create"
            title="Your token in a minute."
            body="An image, a name and a ticker. No code and no second form: one review screen, one signature."
            visual={
              <Mock>
                <div className="grid grid-cols-[72px_1fr] gap-2">
                  <span className="row-tile grid h-[72px] place-items-center text-[11px] text-mute">Image</span>
                  <div className="grid gap-1.5">
                    <span className="row-tile flex justify-between px-2.5 py-1.5 text-[12px]">
                      Your token <span className="text-mute">Name</span>
                    </span>
                    <span className="row-tile flex justify-between px-2.5 py-1.5 text-[12px]">
                      $TOKEN <span className="text-mute">Ticker</span>
                    </span>
                  </div>
                </div>
                <span className="row-tile mt-2 block px-2.5 py-3 text-[11.5px] text-mute">Tell people what this token is for.</span>
                <span className="btn btn-cream mt-2 !h-9 w-full !text-[12.5px]">Review your token</span>
              </Mock>
            }
          />
          <FeatureRow
            flip
            icon="cycle"
            kicker="Choose"
            title="Keep it, share it or burn it."
            body="At launch you decide, once, where your token's trading fees go: to you, to your holders, or into buying back and burning the token."
            visual={
              <Mock>
                <p className="text-[11.5px] text-mute">Your token&apos;s fees go to</p>
                {[
                  { t: "Keep it", d: "Collect any time.", on: true },
                  { t: "Pay holders", d: "Shared by balance.", on: false },
                  { t: "Buy back and burn", d: "Supply only shrinks.", on: false },
                ].map((o) => (
                  <div key={o.t} className={`row-tile mt-1.5 flex items-center justify-between px-3 py-2 ${o.on ? "!border-parchment/60" : ""}`}>
                    <span>
                      <span className="block text-[12.5px] font-medium">{o.t}</span>
                      <span className="block text-[11px] text-mute">{o.d}</span>
                    </span>
                    <span className={`grid size-3.5 place-items-center rounded-full border ${o.on ? "border-parchment" : "border-line-2"}`}>{o.on ? <span className="size-1.5 rounded-full bg-parchment" /> : null}</span>
                  </div>
                ))}
              </Mock>
            }
          />
          <FeatureRow
            icon="stack"
            kicker="Pair"
            title="Pair it with Nvidia."
            body="Choose ETH, dollars or a verified Stock Token. Your token trades against it from the first block, in its own pool."
            visual={
              <Mock>
                <span className="row-tile block px-2.5 py-2 text-[11.5px] text-mute">Search {pairCount} assets</span>
                {[
                  { s: "ETH", k: "Coin" },
                  { s: "USDG", k: "Dollar" },
                  { s: "NVDA", k: "Selected", on: true },
                  { s: "TSLA", k: "Stock" },
                  { s: "AAPL", k: "Stock" },
                ].map((r) => (
                  <div key={r.s} className={`row-tile mt-1.5 flex items-center justify-between px-2.5 py-1.5 ${r.on ? "!border-parchment/60" : ""}`}>
                    <span className="flex items-center gap-2 text-[12.5px]">
                      <img src={`/tokens/${r.s.toLowerCase()}.webp`} alt="" className="size-4 rounded-full bg-white" />
                      {r.s}
                    </span>
                    <span className="text-[11px] text-mute">{r.k}</span>
                  </div>
                ))}
              </Mock>
            }
          />
          <FeatureRow
            flip
            icon="trend"
            kicker="Trade"
            title="A terminal built in."
            body="A live chart, every trade and every holder on the token's own page, with a buy and sell box that shows the fair-price check before you sign."
            visual={
              <Mock>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium">
                    <TokenOrb size={18} /> TOKEN
                  </span>
                  <span className="text-[11.5px] text-up">+24.6%</span>
                </div>
                <svg viewBox="0 0 300 90" className="mt-3 w-full" aria-hidden="true">
                  <path d="M0 72 L30 66 L55 70 L85 56 L110 60 L140 46 L165 50 L195 34 L220 38 L250 24 L275 28 L300 16 L300 90 L0 90 Z" fill="rgba(96,145,126,0.22)" />
                  <path d="M0 72 L30 66 L55 70 L85 56 L110 60 L140 46 L165 50 L195 34 L220 38 L250 24 L275 28 L300 16" fill="none" stroke="#fdfac3" strokeWidth="1.8" />
                </svg>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-center text-[12px]">
                  <span className="rounded-[6px] border border-sage/60 bg-sage-tint py-1.5">Buy</span>
                  <span className="rounded-[6px] bg-white/[0.04] py-1.5 text-mute">Sell</span>
                </div>
              </Mock>
            }
          />
          <FeatureRow
            icon="shield"
            kicker="Fair price"
            title="A verdict on every fill."
            body="Before a trade is signed, its price is compared with an independent oracle for the pair asset, so a thin pool can never quietly overcharge you."
            visual={
              <Mock>
                <p className="text-[11.5px] text-mute">Fair-price check</p>
                {[
                  { t: "Pool price", v: "$0.000412" },
                  { t: "Oracle reference", v: "$0.000410" },
                  { t: "Difference", v: "+0.49%" },
                ].map((r) => (
                  <div key={r.t} className="row-tile mt-1.5 flex items-center justify-between px-3 py-2 text-[12.5px]">
                    <span className="text-ink-2">{r.t}</span>
                    <span className="num">{r.v}</span>
                  </div>
                ))}
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-up">
                  <CheckIcon className="size-3.5" /> Fair: within 0.5%
                </p>
              </Mock>
            }
          />
        </div>
      </section>

      {/* Chain */}
      <section className="wrap-land pt-24 sm:pt-32">
        <Kicker>Chain</Kicker>
        <h2 className="h-sec mt-5">
          One chain. <Accent>Done properly.</Accent>
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="card flex min-h-[170px] flex-col justify-between p-6">
            <span className="grid size-10 place-items-center rounded-[8px] bg-parchment text-onparch">
              <NavIcon name="bolt" className="size-5" />
            </span>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[18px] font-medium">{CHAIN.name}</p>
                <p className="mt-1 text-[13px] text-mute">Chain id {CHAIN.id} · gas in {CHAIN.nativeSymbol} · where the verified Stock Tokens live</p>
              </div>
              <Link href="/launchpad/explore" aria-label="Explore launches" className="text-ink-2 hover:text-ink">
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="panel flex flex-col justify-center p-6">
            <p className="text-[15px] font-medium">More chains, later</p>
            <p className="mt-2 text-[14px] leading-[1.6] text-mute">A chain is added only once its tokenized assets and oracles can be verified the same way. Until then, one chain and no shortcuts.</p>
          </div>
        </div>
      </section>

      {/* Built on */}
      <section className="wrap-land pt-24 sm:pt-32">
        <Kicker>Built on</Kicker>
        <h2 className="h-sec mt-5">
          Proven <Accent>rails.</Accent>
          <br />
          Nothing to trust.
        </h2>
        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-[14px] border border-line sm:grid-cols-3 lg:grid-cols-6">
          {[
            { t: "Uniswap", d: "Trading pools", hi: true },
            { t: "Locked", d: "Liquidity" },
            { t: "Chainlink", d: "Price reference", hi: true },
            { t: "No code", d: "To launch" },
            { t: "Any asset", d: "To pair with", hi: true },
            { t: "On-chain", d: "Every trade" },
          ].map((c) => (
            <div key={c.t} className="border-b border-r border-line px-6 py-5 lg:border-b-0 [&:nth-child(6)]:border-r-0">
              <p className={`text-[22px] font-medium sm:text-[26px] ${c.hi ? "text-parchment" : ""}`}>{c.t}</p>
              <p className="mt-1 text-[13.5px] text-mute">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wrap-land py-24 sm:py-32">
        <div className="card relative overflow-hidden px-6 py-24 text-center sm:py-28">
          <DotGrid />
          <div className="relative">
            <h2 className="h-sec">
              Ready to <Accent>launch</Accent>?
            </h2>
            <p className="mt-4 text-[18px] text-mute">Draft your token now. Launches open on {CHAIN.name} soon.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/launchpad/launch" className="btn btn-cream !h-11 !px-6">
                Launch a token
              </Link>
              <Link href="/launchpad/explore" className="btn btn-ghost !h-11 !px-5 !text-ink">
                Explore launches <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
