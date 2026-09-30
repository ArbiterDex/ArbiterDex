"use client";

import { useState } from "react";
import { BRAND, TOKEN } from "@/config/brand";
import { ArrowDown } from "@/components/icons";
import { Mark } from "@/components/Logo";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/ui/ConnectButton";

function Tok({ s }: { s: string }) {
  return (
    <span className="chip shrink-0 border border-line !h-9 !bg-white/[0.05] !px-2.5 !text-[13.5px] !font-medium !text-ink">
      {s === "USDG" ? <img src="/tokens/usdg.webp" alt="" className="size-5 rounded-full bg-white" /> : <Mark size={16} className="text-parchment" />}
      <span className="max-w-[92px] truncate">{s}</span>
    </span>
  );
}

/** Buy / sell box for the project token. Trading opens with the contract. */
export function ArbiterTradeBox() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const { address } = useWallet();
  const pay = side === "buy" ? "USDG" : BRAND.ticker;
  const get = side === "buy" ? BRAND.ticker : "USDG";
  return (
    <div className="panel p-3">
      <div className="flex gap-1">
        {(["buy", "sell"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setSide(k)} className={`rounded-[6px] px-3 py-1.5 text-[13px] ${side === k ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
            {k === "buy" ? "Buy" : "Sell"} {BRAND.ticker}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-[12px] bg-night-2 p-4">
        <p className="text-[14px] font-medium">Send</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="num text-[28px] text-ink-3">0</span>
          <Tok s={pay} />
        </div>
        <p className="mt-1 text-[12px] text-mute">$0.00</p>
      </div>
      <div className="relative z-[1] -my-2.5 grid place-items-center">
        <span className="grid size-8 place-items-center rounded-[8px] border border-line bg-night text-ink-2">
          <ArrowDown className="size-3.5" />
        </span>
      </div>
      <div className="rounded-[12px] bg-night-2 p-4">
        <p className="text-[14px] font-medium">Receive</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="num text-[28px] text-ink-3">0</span>
          <Tok s={get} />
        </div>
        <p className="mt-1 text-[12px] text-mute">$0.00</p>
      </div>
      <div className="mt-3">
        {address ? (
          <button type="button" disabled className="btn btn-cream !h-11 w-full">
            {TOKEN.isLive ? "Pool not found yet" : "Opens at launch"}
          </button>
        ) : (
          <ConnectButton className="btn btn-cream !h-11 w-full" />
        )}
      </div>
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-mute">
        {TOKEN.isLive ? `${BRAND.symbol} is not on the verified swap list yet; its pool is shown here once it trades.` : `Trading opens when the ${BRAND.symbol} contract is published.`}
      </p>
    </div>
  );
}
