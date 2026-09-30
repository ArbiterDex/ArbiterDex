import type { Metadata } from "next";
import { ALL_ASSETS, STOCK_ASSETS } from "@/config/assets";
import { BRAND, CHAIN } from "@/config/brand";

export const metadata: Metadata = { title: "Launchpad docs" };

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "risk",
    title: "Risk disclaimer",
    body: (
      <>
        <p>Tokens on the launchpad are made by their creators, not by {BRAND.name}. Anyone will be able to launch one. A launched token is worth only what people trade it for, and its price can fall to zero.</p>
        <p>The fee a creator sets is charged on every buy and sell in the token&apos;s pool. Nothing on this site is financial advice, and the fair-price check describes a quote at one moment; it is not a promise about the future.</p>
        <p>
          <strong>Status:</strong> the launchpad is not live yet. The pages you can use today are a preview of how it will work.
        </p>
      </>
    ),
  },
  {
    id: "create",
    title: "Create your token",
    body: (
      <>
        <p>One transaction, signed in your own wallet, will create the token and its pool together. The whole supply goes into the pool; nothing is set aside for the creator. If you want some of your own token, add a first purchase and it is bought inside the launch transaction, before anyone else.</p>
        <p>You give it an image, a name, a ticker and, if you like, a short story, a website and an X profile. These are written into the token&apos;s metadata and cannot be changed later.</p>
        <p>Before you sign, the review screen lists every value the transaction carries, and the chain simulates it, so a launch that would fail never reaches your wallet. You pay the network fee only.</p>
      </>
    ),
  },
  {
    id: "pair",
    title: "Choose your pair",
    body: (
      <>
        <p>Your token trades against one asset on {CHAIN.name}. The choices are the {ALL_ASSETS.length} assets {BRAND.name} has verified there:</p>
        <ul>
          <li>ETH, the chain&apos;s own coin</li>
          <li>USDG, the Global Dollar</li>
          <li>{STOCK_ASSETS.length} Robinhood Stock Tokens, each confirmed on-chain as the real contract and priced by a Chainlink feed</li>
        </ul>
        <p>Dollar values on the token page come from the pair asset&apos;s own oracle, not from the thin new pool, which is what makes the fair-price check possible from the first trade.</p>
      </>
    ),
  },
  {
    id: "trade",
    title: "Explore & trade",
    body: (
      <>
        <p>Every token page will carry a buy and sell box that routes through the chain&apos;s router with a slippage limit you set, and shows how the quote compares with the oracle-derived fair price before you sign.</p>
        <p>Explore lists every launch, newest first, with market cap and 24-hour volume read from its pool. Until the first launch it is empty, and it stays honest: nothing is listed that was not launched here.</p>
        <p>You can already open the live page of any existing {CHAIN.name} token by pasting its address into the Explore search.</p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees & rewards",
    body: (
      <>
        <p>The creator sets the fee at launch, between 1% and 5% of every buy and sell. It is fixed for good, charged by the pool through any router and never on plain transfers.</p>
        <ul>
          <li>
            <strong>Creator share.</strong> Chosen once at launch: keep it, share it with holders by balance, or use it to buy back and burn the token.
          </li>
          <li>
            <strong>Protocol share.</strong> Planned to buy {BRAND.symbol} in its pool and burn it, with a smaller part to the treasury. The exact split is published with the contracts.
          </li>
          <li>
            <strong>Creator pools.</strong> Extra pools a creator opens against stocks; their collected fees follow the same split.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contracts",
    title: "Contracts",
    body: (
      <>
        <p>The launchpad contracts are not deployed yet. When they are, their addresses are listed here and on every token page, each with a link to {CHAIN.explorerName}.</p>
        <p>Today, swaps on {BRAND.name} go straight to Uniswap&apos;s published routers on {CHAIN.name} from your own wallet. No {BRAND.name} contract holds your funds.</p>
      </>
    ),
  },
  {
    id: "faq",
    title: "Common questions",
    body: (
      <>
        <h3>Does it cost anything to launch?</h3>
        <p>Only the network fee. The protocol earns its share from trading fees, not from the launch.</p>
        <h3>Can I change the fee or the pair later?</h3>
        <p>No. Both are fixed in the launch transaction.</p>
        <h3>Can I remove the liquidity?</h3>
        <p>No. It is locked in the pool from the first trade.</p>
        <h3>Where do prices come from?</h3>
        <p>Pool prices come from the token&apos;s own pool. The fair-price reference comes from the pair asset&apos;s Chainlink feed on {CHAIN.name}.</p>
        <h3>When does it open?</h3>
        <p>
          Follow{" "}
          <a href={BRAND.x} target="_blank" rel="noreferrer">
            {BRAND.xHandle}
          </a>{" "}
          for the date.
        </p>
      </>
    ),
  },
];

export default function LaunchpadDocsPage() {
  return (
    <div className="wrap pb-24 pt-10 sm:pt-14">
      <h1 className="text-[40px] font-medium tracking-[-0.02em]">Docs</h1>
      <p className="mt-2 text-[17px] text-mute">How a launch works, what it costs, and where the fees go.</p>
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Sections" className="lg:sticky lg:top-[92px] lg:self-start">
          <ol className="flex flex-wrap gap-x-4 gap-y-2 lg:grid lg:gap-2.5">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-2 text-[14px] text-ink-2 hover:text-ink">
                  <span className="text-[11px] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="grid min-w-0 grid-cols-1 gap-5">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="card scroll-mt-[92px] p-6 sm:p-8">
              <h2 className="flex items-center gap-3 text-[21px] font-medium">
                <span className="grid size-7 place-items-center rounded-full border border-line-2 text-[11px] text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="prose-doc mt-4 [&>h3:first-child]:mt-0">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
