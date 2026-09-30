"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LEND_MARKETS, type LendMarketId } from "@/config/lend";
import type { LendRow } from "@/components/lend/types";
import { TokenLogo, LogoStack } from "@/components/ui/TokenLogo";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { compact, price } from "@/lib/format";

type Tab = "lend" | "multiply";

const LEND_COLS = "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1.3fr)]";
const MULT_COLS = "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.8fr)]";

function Cell({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex items-center justify-between gap-3 lg:block lg:text-right ${className}`}>
      <span className="text-[12.5px] text-mute lg:hidden">{label}</span>
      <span className="num text-[13.5px]">{children}</span>
    </span>
  );
}

/** Markets grouped by collateral pool, with the two tabs of the lend page. */
export function LendBoard({ rows, initialTab }: { rows: LendRow[]; initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [market, setMarket] = useState<LendMarketId | "all">("all");
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => !q || r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.tier.toLowerCase().includes(q));
  }, [rows, query]);

  const selectTab = (t: Tab) => {
    setTab(t);
    const url = new URL(window.location.href);
    if (t === "multiply") url.searchParams.set("tab", "multiply");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div className="flex gap-1">
        {(["lend", "multiply"] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => selectTab(t)} className={`h-8 rounded-[6px] px-3 text-[13px] ${tab === t ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
            {t === "lend" ? "Lend and Borrow" : "Multiply"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-[440px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by stock or tier" className="field !pl-10" />
        </label>
        <div className="scroll-x flex gap-1">
          {[{ id: "all" as const, name: "All markets" }, ...LEND_MARKETS].map((m) => (
            <button key={m.id} type="button" aria-pressed={market === m.id} onClick={() => setMarket(m.id)} className={`h-8 shrink-0 rounded-[6px] px-3 text-[13px] ${market === m.id ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {LEND_MARKETS.filter((m) => market === "all" || market === m.id).map((m) => {
          const list = filtered.filter((r) => r.market === m.id);
          const isOpen = !closed[m.id];
          return (
            <section key={m.id} className="overflow-hidden rounded-[14px] border border-line">
              <button
                type="button"
                onClick={() => setClosed((c) => ({ ...c, [m.id]: isOpen }))}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ChevronDownIcon className={`size-3.5 shrink-0 text-mute transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium">{m.name}</span>
                    <span className="block truncate text-[12.5px] text-mute">Robinhood Chain · {m.blurb}</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-[12.5px] text-mute">
                  Collateral <LogoStack items={list.slice(0, 5).map((r) => ({ src: r.logo, symbol: r.symbol }))} size={20} />
                  {list.length > 5 ? `+${list.length - 5}` : null}
                  <span className="ml-3">Debt</span> <TokenLogo src="/tokens/usdg.webp" symbol="USDG" size={20} />
                </span>
                <span className="text-[12.5px] text-mute md:text-right">
                  Borrow from <span className="block text-[14px] text-ink">—</span>
                </span>
                <span className="text-[12.5px] text-mute md:text-right">
                  Market size <span className="block text-[14px] text-ink">Opens at launch</span>
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-line">
                  <div className={`table-head hidden gap-4 border-b border-line px-5 py-3 lg:grid ${tab === "lend" ? LEND_COLS : MULT_COLS}`}>
                    <span>Asset</span>
                    <span className="text-right">Oracle price</span>
                    <span className="text-right">Venue liquidity</span>
                    <span className="text-right">{tab === "lend" ? "Liq LTV" : "Max LTV"}</span>
                    <span className="text-right">{tab === "lend" ? "Supply APY" : "Max leverage"}</span>
                    <span className="text-right">{tab === "lend" ? "Borrow APY" : ""}</span>
                  </div>
                  {list.length === 0 ? <p className="px-5 py-8 text-center text-[13.5px] text-mute">No asset in this market matches that search.</p> : null}
                  <ul>
                    {list.map((r) => (
                      <li key={r.symbol} className={`grid grid-cols-1 gap-2.5 border-b border-line px-5 py-3.5 last:border-b-0 lg:items-center lg:gap-4 ${tab === "lend" ? LEND_COLS : MULT_COLS}`}>
                        <Link href={tab === "lend" ? `/lend/asset/${r.symbol.toLowerCase()}` : `/lend/multiply/${r.symbol.toLowerCase()}`} className="flex min-w-0 items-center gap-3 hover:text-parchment">
                          <TokenLogo src={r.logo} symbol={r.symbol} size={34} />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-medium">{tab === "lend" ? r.symbol : `${r.symbol} / USDG`}</span>
                            <span className="block truncate text-[12px] text-mute">
                              {r.name} · {r.tier}
                            </span>
                          </span>
                        </Link>
                        <Cell label="Oracle price">{price(r.price)}</Cell>
                        <Cell label="Venue liquidity">{compact(r.liquidityUsd || null)}</Cell>
                        {tab === "lend" ? (
                          <>
                            <Cell label="Liq LTV (proposed)">{r.liqLtv}%</Cell>
                            <span className="flex items-center justify-between gap-2 lg:justify-end">
                              <span className="text-[12.5px] text-mute lg:hidden">Supply APY</span>
                              <span className="flex items-center gap-2">
                                <span className="num text-[13.5px] text-mute">—</span>
                                <Link href={`/lend/asset/${r.symbol.toLowerCase()}`} className="btn btn-ghost !h-7 !px-2.5 !text-[12.5px]">
                                  Supply
                                </Link>
                              </span>
                            </span>
                            <span className="flex items-center justify-between gap-2 lg:justify-end">
                              <span className="text-[12.5px] text-mute lg:hidden">Borrow APY</span>
                              <span className="flex items-center gap-2">
                                <span className="num text-[13.5px] text-mute">—</span>
                                <Link href={`/lend/asset/${r.symbol.toLowerCase()}?action=borrow`} className="btn btn-ghost !h-7 !px-2.5 !text-[12.5px]">
                                  Borrow
                                </Link>
                              </span>
                            </span>
                          </>
                        ) : (
                          <>
                            <Cell label="Max LTV (proposed)">{r.maxLtv}%</Cell>
                            <Cell label="Max leverage">{r.maxLeverage.toFixed(2)}×</Cell>
                            <span className="flex justify-end">
                              <Link href={`/lend/multiply/${r.symbol.toLowerCase()}`} className="btn btn-ghost !h-7 !px-3 !text-[12.5px]">
                                Open
                              </Link>
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
