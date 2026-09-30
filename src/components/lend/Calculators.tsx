"use client";

import { useState } from "react";
import type { LendRow } from "@/components/lend/types";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { price, tokenAmount, usd } from "@/lib/format";

const clean = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

function Line({ label, value, tone = "" }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[13px]">
      <span className="text-ink-2">{label}</span>
      <span className={`num text-right font-medium ${tone}`}>{value}</span>
    </div>
  );
}

function Illustration() {
  return <p className="mt-3 rounded-[8px] border border-line bg-white/[0.02] px-3 py-2 text-[12px] leading-[1.5] text-mute">Illustration with proposed limits and the live oracle price. Not a live position; nothing is sent from this panel.</p>;
}

/** Supply / borrow ticket for one collateral. Math only until markets open. */
export function BorrowCalculator({ row, initial = "supply" }: { row: LendRow; initial?: "supply" | "borrow" }) {
  const [tab, setTab] = useState<"supply" | "borrow">(initial);
  const [amount, setAmount] = useState("");
  const [share, setShare] = useState(50);
  const qty = Number(amount) || 0;
  const value = row.price ? qty * row.price : 0;
  const maxBorrow = (value * row.maxLtv) / 100;
  const borrow = (maxBorrow * share) / 100;
  const ltv = value ? (borrow / value) * 100 : 0;
  const liqPrice = qty && borrow ? borrow / (qty * (row.liqLtv / 100)) : null;

  return (
    <aside className="panel !bg-night-2 p-4">
      <div className="flex gap-1">
        {(["supply", "borrow"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`h-8 rounded-[6px] px-3 text-[13px] capitalize ${tab === t ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
            {t}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-ink-2">You deposit</p>
      <div className="mt-2 flex items-center gap-3 rounded-[10px] border border-line bg-white/[0.03] px-3 py-2.5">
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(clean(e.target.value))} placeholder="0" aria-label={`Amount of ${row.symbol}`} className="num min-w-0 flex-1 bg-transparent text-[22px] outline-none placeholder:text-ink-4" />
        <span className="flex items-center gap-2 text-[14px]">
          <TokenLogo src={row.logo} symbol={row.symbol} size={20} /> {row.symbol}
        </span>
      </div>
      <p className="mt-1.5 text-right text-[12px] text-mute">{value ? usd(value) : "$0.00"} at {price(row.price)}</p>

      {tab === "borrow" ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-2">Borrow</span>
            <span className="num">{share}% of limit</span>
          </div>
          <input type="range" min={0} max={100} value={share} onChange={(e) => setShare(Number(e.target.value))} aria-label="Share of borrow limit" className="mt-2 w-full accent-[#7fb09c]" />
        </div>
      ) : null}

      <div className="mt-4 border-t border-line pt-3">
        <Line label="Collateral value" value={usd(value)} />
        <Line label="Borrow limit (proposed)" value={`${usd(maxBorrow)} USDG`} />
        {tab === "borrow" ? (
          <>
            <Line label="You borrow" value={`${tokenAmount(borrow)} USDG`} />
            <Line label="Loan to value" value={`${ltv.toFixed(2)}%`} tone={ltv > row.maxLtv * 0.9 ? "text-warn" : ""} />
            <Line label={`Liquidated if ${row.symbol} falls to`} value={liqPrice ? price(liqPrice) : "—"} />
          </>
        ) : (
          <Line label="Supply APY" value="Opens at launch" />
        )}
      </div>
      <div className="mt-4 grid gap-2">
        <ConnectButton className="btn btn-sage w-full" />
        <button type="button" disabled className="btn btn-cream w-full capitalize">
          {tab} · soon
        </button>
      </div>
      <Illustration />
    </aside>
  );
}

/** Leverage loop preview: exposure, debt and the fall that would liquidate it. */
export function MultiplyCalculator({ row }: { row: LendRow }) {
  const ceiling = Math.max(1.1, row.maxLeverage);
  const [amount, setAmount] = useState("");
  const [lev, setLev] = useState(Math.min(2, ceiling));
  const qty = Number(amount) || 0;
  const value = row.price ? qty * row.price : 0;
  const exposure = value * lev;
  const debt = value * (lev - 1);
  const ltv = lev > 1 ? ((lev - 1) / lev) * 100 : 0;
  const fall = lev > 1 ? (1 - ltv / row.liqLtv) * 100 : null;

  return (
    <aside className="grid gap-3">
      <div className="panel !bg-night-2 p-4">
        <div className="flex items-center gap-3">
          <TokenLogo src={row.logo} symbol={row.symbol} size={32} />
          <div>
            <p className="text-[16px] font-medium">{row.symbol} / USDG</p>
            <p className="text-[12px] text-mute">Multiply · up to {ceiling.toFixed(2)}× (proposed)</p>
          </div>
        </div>
        <p className="mt-5 text-[13px] text-ink-2">You deposit</p>
        <div className="mt-2 flex items-center gap-3 rounded-[10px] border border-line bg-white/[0.03] px-3 py-2.5">
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(clean(e.target.value))} placeholder="0" aria-label={`Amount of ${row.symbol}`} className="num min-w-0 flex-1 bg-transparent text-[20px] outline-none placeholder:text-ink-4" />
          <span className="text-[13.5px] text-ink-2">{row.symbol}</span>
        </div>
        <div className="mt-5 flex items-center justify-between text-[13px]">
          <span className="text-ink-2">Leverage</span>
          <span className="num font-medium">{lev.toFixed(2)}×</span>
        </div>
        <input type="range" min={1.1} max={ceiling} step={0.01} value={lev} onChange={(e) => setLev(Number(e.target.value))} aria-label="Leverage" className="mt-2 w-full accent-[#7fb09c]" />
        <div className="mt-1 flex justify-between text-[11.5px] text-mute">
          <span>1.10×</span>
          <span>{ceiling.toFixed(2)}×</span>
        </div>
        <div className="mt-4 grid gap-2">
          <ConnectButton className="btn btn-sage w-full" />
          <button type="button" disabled className="btn btn-cream w-full">
            Open position · soon
          </button>
        </div>
        <div className="mt-4 border-t border-line pt-3">
          <Line label={`${row.symbol} supply APY`} value="—" />
          <Line label="USDG borrow APY" value="—" />
          <Line label="Liquidation LTV (proposed)" value={`${row.liqLtv.toFixed(2)}%`} />
        </div>
      </div>
      <div className="panel !bg-night-2 p-4">
        <p className="text-[12.5px] text-mute">Position preview</p>
        <p className="text-[14px] font-medium">Robinhood Chain</p>
        <div className="mt-3">
          <Line label="Your exposure" value={usd(exposure)} />
          <Line label="You borrow" value={`${tokenAmount(debt)} USDG`} />
          <Line label="Loan to value" value={`${ltv.toFixed(2)}%`} />
          <Line label="Liquidated after a fall of" value={fall === null ? "—" : `${fall.toFixed(1)}%`} tone="text-warn" />
        </div>
        <Illustration />
      </div>
    </aside>
  );
}
