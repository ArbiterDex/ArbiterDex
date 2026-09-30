"use client";

import Link from "next/link";
import { useState } from "react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { ArrowUpRight, InfoIcon } from "@/components/icons";
import { price, tokenAmount, usd } from "@/lib/format";

export type BuyLeg = { symbol: string; logo: string; weight: number; price: number | null };

/**
 * Order ticket for a basket. It splits an order across legs at live oracle
 * prices so the user sees exactly what one order would buy. Executing the
 * whole basket in one transaction opens at launch; until then each leg links
 * to the swap, where it trades for real from the user's own wallet.
 */
export function BuyPanel({ name, legs, mode = "buy" }: { name: string; legs: BuyLeg[]; mode?: "buy" | "invest" }) {
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<"in" | "out">("in");
  const size = Number(amount) || 0;
  const total = legs.reduce((s, l) => s + l.weight, 0) || 1;

  return (
    <aside className="panel !bg-night-2 p-3">
      <div className="flex gap-1 p-1">
        {(["in", "out"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`h-8 rounded-[6px] px-3 text-[13px] ${tab === t ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
            {t === "in" ? (mode === "buy" ? "Buy" : "Invest") : mode === "buy" ? "Sell" : "Withdraw"}
          </button>
        ))}
      </div>
      <div className="mt-1 rounded-[10px] bg-white/[0.03] p-4">
        <p className="text-[13px] text-ink-2">{tab === "in" ? "Order size" : "Amount to redeem"}</p>
        <div className="mt-2 flex items-center gap-3">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))}
            placeholder="0"
            aria-label="Order size in USDG"
            className="num min-w-0 flex-1 bg-transparent text-[30px] font-medium outline-none placeholder:text-ink-4"
          />
          <span className="flex items-center gap-2 rounded-[8px] border border-line bg-white/[0.04] px-2.5 py-1.5 text-[14px]">
            <TokenLogo src="/tokens/usdg.webp" symbol="USDG" size={20} /> USDG
          </span>
        </div>
        <p className="mt-1 text-[12.5px] text-mute">{size ? usd(size) : "$0.00"}</p>
      </div>

      <div className="mt-3 px-1">
        <p className="text-[12.5px] text-mute">Split at live oracle prices</p>
        <ul className="mt-2 grid gap-1.5">
          {legs.map((l) => {
            const legUsd = (size * l.weight) / total;
            return (
              <li key={l.symbol} className="flex items-center gap-2.5 text-[13px]">
                <TokenLogo src={l.logo} symbol={l.symbol} size={20} />
                <span className="w-14 shrink-0 text-ink">{l.symbol}</span>
                <span className="num min-w-0 flex-1 truncate text-right text-ink-2">
                  {size && l.price ? `${tokenAmount(legUsd / l.price)} · ${usd(legUsd)}` : price(l.price)}
                </span>
                <Link href={`/swap?from=USDG&to=${l.symbol}`} aria-label={`Swap USDG for ${l.symbol}`} className="grid size-6 shrink-0 place-items-center rounded-[4px] text-mute hover:bg-white/[0.06] hover:text-ink">
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 flex gap-2 rounded-[8px] border border-sage/40 bg-sage-tint px-3 py-2.5 text-[12.5px] leading-[1.5] text-ink-2">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-parchment" />
        <span>
          One-order {mode === "buy" ? "basket buys" : "strategy accounts"} open at launch. Until then, buy any leg on its own through the swap: it settles on Robinhood Chain from your wallet.
        </span>
      </p>
      <div className="mt-3 grid gap-2">
        <ConnectButton className="btn btn-sage w-full" />
        <button type="button" disabled className="btn btn-cream w-full">
          {tab === "in" ? `Buy ${name}` : "Redeem"} · opens at launch
        </button>
      </div>
    </aside>
  );
}
