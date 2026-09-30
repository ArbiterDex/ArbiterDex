"use client";

import { useState } from "react";
import { StrategyCard, type CardData } from "@/components/baskets/Cards";

/** Category chips over the automated strategies, grouped like a catalogue. */
export function StrategyBrowser({ cards, groups }: { cards: CardData[]; groups: string[] }) {
  const [active, setActive] = useState<string>("All");
  const present = groups.filter((g) => cards.some((c) => c.group === g));
  const shown = active === "All" ? present : [active];
  const chip = (label: string, n: number) => (
    <button
      key={label}
      type="button"
      onClick={() => setActive(label)}
      aria-pressed={active === label}
      className={`h-8 shrink-0 rounded-[6px] px-3 text-[13px] transition-colors ${active === label ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}
    >
      {label} <span className="text-mute">{n}</span>
    </button>
  );
  return (
    <div>
      <div className="scroll-x -mx-1 flex gap-1 px-1">
        {chip("All", cards.length)}
        {present.map((g) => chip(g, cards.filter((c) => c.group === g).length))}
      </div>
      {shown.map((g) => {
        const list = cards.filter((c) => c.group === g);
        return (
          <section key={g} className="mt-8">
            <p className="text-[13.5px] text-ink">
              {g} <span className="text-mute">{list.length}</span>
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <StrategyCard key={c.id} b={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
