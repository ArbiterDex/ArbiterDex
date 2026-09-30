import { STOCK_ASSETS, ALL_ASSETS } from "@/config/assets";
import { SwapCard } from "@/components/swap/SwapCard";
import { ConnectButton } from "@/components/ui/ConnectButton";

/** Shared body of /swap and /private: the card, then the one-line pitch below it. */
export function SwapPage({ tab, from, to }: { tab: "swap" | "private"; from?: string; to?: string }) {
  return (
    <>
      <section className="wrap pt-8 sm:pt-7">
        <SwapCard initialTab={tab} initialFrom={from} initialTo={to} />
      </section>
      <section className="wrap pb-24 pt-16 text-center sm:pb-32 sm:pt-[72px]">
        <p className="text-[14px] font-medium text-ink">Fair-Price Aggregator</p>
        <h1 className="h-hero mx-auto mt-5 max-w-[1000px] !leading-[1.1]">
          Swap Any Tokenized Asset at a <span className="text-parchment">Fair Price.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-[1.55] text-mute sm:text-[20px]">
          <span className="text-ink">
            {ALL_ASSETS.length} verified assets. Up to 36 routes per order. One independent oracle.
          </span>{" "}
          {STOCK_ASSETS.length} stock and fund tokens, ETH and USDG, judged before you sign.
        </p>
        <div className="mt-9 flex justify-center">
          <ConnectButton label="Get Started" className="btn btn-cream !h-[38px] !w-[200px]" />
        </div>
      </section>
    </>
  );
}
