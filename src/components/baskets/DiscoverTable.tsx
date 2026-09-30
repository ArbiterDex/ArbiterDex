"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Change, LegLogos, type CardData } from "@/components/baskets/Cards";
import { GlyphTile } from "@/components/baskets/Glyph";
import { SearchIcon } from "@/components/icons";
import { compact } from "@/lib/format";

type Kind = "all" | "index" | "automated";

/** Every basket in one searchable list; a table on desktop, cards on phones. */
export function DiscoverTable({ cards }: { cards: CardData[] }) {
  const [kind, setKind] = useState<Kind>("all");
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards
      .filter((c) => kind === "all" || c.kind === kind)
      .filter((c) => !q || [c.name, c.ticker ?? "", c.group ?? "", c.rule ?? "", ...c.legs.map((l) => l.symbol)].some((s) => s.toLowerCase().includes(q)))
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd);
  }, [cards, kind, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-[440px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, ticker, rule or holding" className="field !pl-10" />
        </label>
        <div className="scroll-x flex gap-1">
          <span className="flex h-8 shrink-0 items-center gap-2 rounded-[6px] bg-white/[0.08] px-3 text-[13px] text-ink">
            <span className="size-2 rounded-full bg-sage-2" /> Robinhood Chain
          </span>
        </div>
      </div>
      <div className="mt-5 flex gap-1">
        {(["all", "index", "automated"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={`h-8 rounded-[6px] px-3 text-[13px] capitalize ${kind === k ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
            {k === "all" ? "All" : k === "index" ? "Index" : "Automated"}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-line">
        <div className="table-head hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-4 border-b border-line px-5 py-3.5 lg:grid">
          <span>Name</span>
          <span>Basket</span>
          <span className="text-right">Leg liquidity</span>
          <span className="text-right">Legs</span>
          <span className="text-right">24h (legs)</span>
        </div>
        {list.length === 0 ? <p className="px-5 py-10 text-center text-[14px] text-mute">No basket matches that search.</p> : null}
        <ul>
          {list.map((c) => (
            <li key={c.id} className="border-b border-line last:border-b-0">
              <Link href={c.href} className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02] lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center lg:gap-4">
                <span className="flex min-w-0 items-center gap-3">
                  <GlyphTile name={c.glyph} size={36} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-medium">
                      {c.name} {c.ticker ? <span className="font-normal text-mute">${c.ticker}</span> : null}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12.5px] text-mute">
                      <span className="size-1.5 rounded-full bg-sage-2" /> Robinhood Chain · {c.kind === "index" ? "Index" : `Automated · ${c.rule}`}
                    </span>
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 lg:block">
                  <span className="text-[12.5px] text-mute lg:hidden">Holdings</span>
                  <LegLogos legs={c.legs} max={4} />
                </span>
                <span className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-[12.5px] text-mute lg:hidden">Leg liquidity</span>
                  <span className="num text-[14px] font-medium">{compact(c.liquidityUsd || null)}</span>
                </span>
                <span className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-[12.5px] text-mute lg:hidden">Legs</span>
                  <span className="num text-[14px]">{c.legs.length}</span>
                </span>
                <span className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-[12.5px] text-mute lg:hidden">24h (legs)</span>
                  <Change value={c.change24h} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
