import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { STOCK_ASSETS } from "@/config/assets";
import { UNISWAP } from "@/lib/uniswap";
import { DocsNav } from "@/components/docs/DocsNav";

export const metadata: Metadata = {
  title: "Docs",
  description: `How ${BRAND.name} finds the fairest price for tokenized assets, and what is live today.`,
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "swap-vs-bridge", label: "Swap and Bridge" },
  { id: "how-it-works", label: "How a trade works" },
  { id: "fair-price", label: "How a ruling is made" },
  { id: "tokenized-baskets", label: "Tokenized Baskets" },
  { id: "index-baskets", label: "Index baskets" },
  { id: "automated-baskets", label: "Automated baskets" },
  { id: "strategy-baskets", label: "Strategy baskets" },
  { id: "issuers", label: "Issuers and verification" },
  { id: "tokenized-pools", label: "Tokenized Pools" },
  { id: "lend-and-borrow", label: "Lend and Borrow" },
  { id: "fees", label: "Fees" },
  { id: "private-swaps", label: "Private settlement" },
  { id: "tracking", label: "Tracking a trade" },
  { id: "safety", label: "Safety" },
  { id: "chains", label: "Supported network" },
  { id: "faq", label: "FAQ" },
];

function Steps({ items }: { items: [string, string][] }) {
  return (
    <ol className="!mt-6 !list-none !pl-0 grid !gap-3">
      {items.map(([title, body], i) => (
        <li key={title} className="flex gap-4 rounded-[12px] border border-line bg-white/[0.02] px-5 py-5">
          <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-white/[0.07] text-[13px] text-ink">{i + 1}</span>
          <span>
            <span className="block text-[15px] font-medium text-ink">{title}</span>
            <span className="mt-1 block text-[14.5px] leading-[1.6] text-ink-2">{body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function KeyTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="!mt-6 overflow-hidden rounded-[12px] border border-line">
      {rows.map(([k, v], i) => (
        <div key={k} className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 ${i ? "border-t border-line" : ""}`}>
          <span className="text-[14px] font-medium text-ink-2">{k}</span>
          <span className="text-[14px] leading-[1.6] text-ink">{v}</span>
        </div>
      ))}
    </div>
  );
}

function Status({ state }: { state: "Live" | "Preview" | "Soon" }) {
  const tone = state === "Live" ? "bg-sage text-night" : state === "Preview" ? "bg-white/[0.1] text-ink" : "bg-sage-tint text-ink";
  return <span className={`ml-2 inline-flex h-5 items-center rounded-[4px] px-1.5 align-middle text-[11.5px] font-semibold ${tone}`}>{state}</span>;
}

export default function DocsPage() {
  return (
    <div className="wrap pb-24">
      <div className="pt-12 sm:pt-[70px]">
        <p className="eyebrow">Docs</p>
        <h1 className="h-page mt-4">How {BRAND.name} Works</h1>
        <p className="mt-4 text-[18px] leading-[1.6] text-mute">{BRAND.tagline}: every venue compared, one independent referee.</p>
      </div>

      <div className="mt-10 overflow-hidden rounded-[16px] border border-line">
        <div className="px-6 py-6">
          <p className="flex items-center gap-2 text-[20px] font-medium">
            {BRAND.name} is live <span className="rounded-[4px] bg-parchment px-1.5 text-[13px] font-medium text-onparch">Beta</span>
          </p>
          <p className="mt-3 text-[14.5px] text-ink-2">Swaps are real: you sign them from your own address and they settle on {CHAIN.name}. Beta means more products are still on the way.</p>
        </div>
        <div className="grid grid-cols-1 border-t border-line md:grid-cols-2">
          {[
            ["Swaps are live today", `${STOCK_ASSETS.length} verified stock and fund tokens, ETH and USDG, routed through Uniswap v3 and judged against Chainlink.`],
            ["Other products are marked", "Baskets, lending, pools deposits, private settlement and the launchpad show a Preview or Soon label until they open."],
            ["Prices depend on venues", "Liquidity comes from public pools. Outside US market hours stock pools are thinner and oracle updates pause, so rulings can widen."],
            ["Tell us what you find", `Report anything that looks wrong on X, ${BRAND.xHandle}.`],
          ].map(([t, b], i) => (
            <div key={t} className={`px-6 py-6 ${i % 2 ? "md:border-l" : ""} ${i > 0 ? "border-t md:border-t-0" : ""} ${i > 1 ? "md:border-t" : ""} border-line`}>
              <p className="text-[15px] font-medium">{t}</p>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-2">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsNav sections={SECTIONS} />
        <article className="prose-doc min-w-0 max-w-[760px] [&>section:first-child>h2]:mt-0">
          <section id="overview">
            <h2>Overview</h2>
            <p>
              {BRAND.name} is a decentralized exchange that acts as an arbiter for tokenized assets. When the same stock token trades in several pools, their prices drift apart, and a trader rarely knows which one is honest. {BRAND.name} reads every venue, compares them with an independent oracle, and tells you how fair the best executable price is before you sign.
            </p>
            <p>
              It never holds your funds. Trades go from your own address to a public router contract and back to your address, in one transaction you approve in your own wallet. There is no account, no deposit and no identity check.
            </p>
            <p>
              Today the live product is the <Link href="/swap">swap</Link> on {CHAIN.name}. <Link href="/assets">Markets</Link> and <Link href="/rwa-pools">Tokenized Pools</Link> show live venue data. Baskets, lending and private settlement are shown as previews and say so on every page.
            </p>
          </section>

          <section id="swap-vs-bridge">
            <h2>Swap and Bridge</h2>
            <KeyTable
              rows={[
                ["Swap", `Same network. Trade one asset for another on ${CHAIN.name}, for example USDG → NVDA.`],
                ["Bridge", `Across networks. Move value into or out of ${CHAIN.name}. Not open yet.`],
              ]}
            />
            <p className="!mt-5">The Swap tab is live. The Bridge tab explains what is coming and stays disabled until routes are verified.</p>
          </section>

          <section id="how-it-works">
            <h2>How a trade works</h2>
            <Steps
              items={[
                ["Choose what to send and receive", "Pick two verified assets and enter the amount you want to send."],
                ["Every route is quoted", "Direct pools at every fee tier and two-hop routes through ETH or USDG are quoted on-chain by the Uniswap quoter, up to 36 routes per order."],
                ["The ruling appears", "The best route is compared with the oracle's fair value and labelled Fair, Within tolerance or Unfair, with the exact gap shown."],
                ["Approve and sign", "Tokens other than ETH need an approval for exactly this amount, never unlimited. Then one signature sends the swap."],
                ["Settled on-chain", "The trade lands in your wallet with a link to the public explorer. If the price moves past your slippage limit the swap reverts and only gas is spent."],
              ]}
            />
          </section>

          <section id="fair-price">
            <h2>How a ruling is made</h2>
            <p>
              A fair price needs a witness that does not profit from the trade. {BRAND.name} uses the Chainlink price feed for each asset on {CHAIN.name} as that witness. The fair output is your amount times the oracle price of what you send, divided by the oracle price of what you receive.
            </p>
            <KeyTable
              rows={[
                ["Fair", "The best route gives up less than 0.5% against fair value."],
                ["Within tolerance", "The best route gives up between 0.5% and 1.5%."],
                ["Unfair right now", "Every route gives up more than 1.5%. You can still trade, knowingly."],
                ["No reference", "One side has no oracle feed, so only venue prices are compared."],
              ]}
            />
            <p className="!mt-5">
              Stock feeds follow US market hours on weekdays. Outside them the oracle holds the last close while pools keep trading, so a gap can reflect news rather than a bad pool. The ruling shows the oracle price used so you can judge that yourself.
            </p>
          </section>

          <section id="tokenized-baskets">
            <h2>Tokenized Baskets</h2>
            <p>
              A basket is a set of verified stock tokens at stated weights. <Link href="/rwa-baskets">Baskets</Link> are valued live from the oracle prices of their legs. Buying a whole basket in one order is not open yet; until it is, each leg links to the swap.
            </p>
          </section>
          <section id="index-baskets">
            <h2>Index baskets <Status state="Preview" /></h2>
            <p>Fixed weights published up front, such as a broad-market or chip-maker basket. The page shows each leg, its weight and its live oracle price.</p>
          </section>
          <section id="automated-baskets">
            <h2>Automated baskets <Status state="Preview" /></h2>
            <p>Rule-based portfolios, such as equal weight or a treasury ladder, that will rebalance on a schedule you can read before you join. The rules are shown; the automation is not running yet.</p>
          </section>
          <section id="strategy-baskets">
            <h2>Strategy baskets <Status state="Preview" /></h2>
            <p>A list of stocks and weights with no basket token: you would hold each stock token yourself. Strategies follow written rules, never a named person&apos;s trades.</p>
          </section>

          <section id="issuers">
            <h2>Issuers and verification <Status state="Live" /></h2>
            <p>
              Dozens of tokens on {CHAIN.name} copy the ticker of a famous stock. {BRAND.name} only lists a stock token when three things hold on-chain: the contract is a proxy to the issuer&apos;s token beacon, its symbol matches the ticker, and its name carries the issuer&apos;s suffix. Look-alikes are counted on each asset page and never routed.
            </p>
          </section>

          <section id="tokenized-pools">
            <h2>Tokenized Pools <Status state="Live" /></h2>
            <p>
              <Link href="/rwa-pools">Tokenized Pools</Link> lists every public pool on {CHAIN.name} that trades a verified asset, with liquidity and 24-hour volume read live. Adding liquidity from {BRAND.name} is not open yet.
            </p>
          </section>

          <section id="lend-and-borrow">
            <h2>Lend and Borrow <Status state="Soon" /></h2>
            <p>
              Borrowing USDG against tokenized assets, valued at the oracle price, is planned. The <Link href="/lend">Lend</Link> page shows the proposed collateral list and limits; no position can be opened yet.
            </p>
          </section>

          <section id="fees">
            <h2>Fees</h2>
            <KeyTable
              rows={[
                ["Arbiter DEX fee", "None on swaps today. Nothing is added to the route."],
                ["Pool fee", "Each Uniswap pool charges its own fee tier (0.01% to 1%), shown in the route name and already inside the quote."],
                ["Network fee", `Gas on ${CHAIN.name}, paid in ETH by your wallet.`],
                ["Slippage", "Your limit (0.1%, 0.5% or 1%) sets the minimum you accept. It is a ceiling, not a charge."],
              ]}
            />
          </section>

          <section id="private-swaps">
            <h2>Private settlement <Status state="Soon" /></h2>
            <p>Moving an asset to a fresh address without an on-chain link to the sender is planned for larger transfers. It will be slower than a swap and every transfer will be screened. The Private tab describes it and stays disabled until it opens.</p>
          </section>

          <section id="tracking">
            <h2>Tracking a trade</h2>
            <p>
              After you sign, the swap card shows each step: approval, swap and settlement. When it lands you get a link to the transaction on {CHAIN.explorerName}. The <Link href="/explorer">Settlement Explorer</Link> shows recent swaps on the pools {BRAND.name} compares.
            </p>
          </section>

          <section id="safety">
            <h2>Safety</h2>
            <ul>
              <li>Your keys never leave your wallet. Connecting shares only your address.</li>
              <li>Approvals are for the exact amount of one trade, never unlimited.</li>
              <li>
                Swaps go through Uniswap&apos;s published SwapRouter02 on {CHAIN.name}: <code>{UNISWAP.swapRouter02}</code>. Quotes come from QuoterV2: <code>{UNISWAP.quoterV2}</code>.
              </li>
              <li>Only verified issuer contracts are routed. Always check the address of anything you receive.</li>
              <li>Stock tokens are issued by their issuer, who can pause or restrict them. That risk sits with the token, not with the route.</li>
            </ul>
          </section>

          <section id="chains">
            <h2>Supported network</h2>
            <KeyTable
              rows={[
                ["Network", CHAIN.name],
                ["Chain ID", `${CHAIN.id} (${CHAIN.hex})`],
                ["Native coin", CHAIN.nativeSymbol],
                ["Public RPC", CHAIN.publicRpc],
                ["Explorer", CHAIN.explorer],
              ]}
            />
            <p className="!mt-5">Connecting from the site adds the network to your wallet if it is missing. Phantom cannot add custom networks and is shown as not supported.</p>
          </section>

          <section id="faq">
            <h2>FAQ</h2>
            <h3>Is the best price always the fair price?</h3>
            <p>No. The best route is simply the one that pays most right now. The ruling tells you how that compares with an independent reference, so a thin market cannot pass itself off as a good one.</p>
            <h3>Why is my ruling &quot;Unfair&quot; for a large order?</h3>
            <p>Pools move against size. Try a smaller amount; the gap usually narrows.</p>
            <h3>Does {BRAND.name} take custody or ask for identity?</h3>
            <p>No. There is no account and no deposit. Your wallet signs and sends every transaction.</p>
            <h3>Where is the {BRAND.symbol} contract?</h3>
            <p>It is published at launch. Until then every copy button on the site says so instead of copying a placeholder.</p>
          </section>
        </article>
      </div>
    </div>
  );
}
