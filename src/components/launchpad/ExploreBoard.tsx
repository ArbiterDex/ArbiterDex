"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CHAIN } from "@/config/brand";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { NavIcon } from "@/components/site/NavIcon";

const SORTS = [
  { key: "trending", label: "Trending", href: "/launchpad/trending" },
  { key: "cap", label: "Market cap", href: "/launchpad/explore?sort=cap" },
  { key: "new", label: "New pairs", href: "/launchpad/explore" },
  { key: "sale", label: "Last sale", href: "/launchpad/explore?sort=sale" },
];

/**
 * Launch board. The launchpad is not live yet, so there are no launches to
 * list; the search box still works for any token address on Robinhood Chain
 * and opens its live token page.
 */
export function ExploreBoard({ title, active }: { title: string; active: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (/^0x[0-9a-fA-F]{40}$/.test(v)) {
      router.push(`/launchpad/t/robinhood/${v}`);
      return;
    }
    setHint(v ? "No launches match yet. Paste a full 0x token address to open any Robinhood Chain token." : null);
  };

  return (
    <div className="wrap pb-24 pt-10 sm:pt-12">
      <div className="flex gap-3">
        <form onSubmit={submit} className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setHint(null);
            }}
            aria-label="Search tokens"
            placeholder="Search tokens by name, ticker or address"
            className="field !h-[46px] !pl-11"
          />
        </form>
        <Link href="/launchpad/launch" className="btn btn-cream !h-[46px] shrink-0 !px-5">
          <PlusIcon className="size-3.5" /> Create
        </Link>
      </div>
      {hint ? <p className="mt-2 text-[13px] text-mute">{hint}</p> : null}

      <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[38px] font-medium tracking-[-0.02em] sm:text-[42px]">{title}</h1>
          <span className="rounded-[5px] border border-line-2 px-2 py-0.5 text-[12.5px] text-ink-2">0 launched</span>
        </div>
        <div className="scroll-x flex gap-1">
          {SORTS.map((s) => (
            <Link key={s.key} href={s.href} className={`shrink-0 rounded-[6px] px-3 py-1.5 text-[14px] ${s.key === active ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip border border-line-2 !bg-white/[0.08] !text-ink">All chains</span>
        <span className="chip border border-line">
          <NavIcon name="bolt" className="size-3.5 text-parchment" /> {CHAIN.name}
        </span>
      </div>

      <div className="card mt-8 grid place-items-center px-6 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-[10px] bg-white/[0.06] text-parchment">
          <NavIcon name="rocket" className="size-6" />
        </span>
        <p className="mt-5 text-[20px] font-medium">No launches yet</p>
        <p className="mt-2 max-w-[520px] text-[15px] leading-[1.6] text-mute">
          The launchpad opens on {CHAIN.name} soon. The first tokens appear here the moment they are created on-chain, with market cap and 24h volume read from their pools. Nothing is listed before that.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/launchpad/launch" className="btn btn-cream">
            Draft a token
          </Link>
          <Link href="/launchpad/docs" className="btn btn-ghost">
            How launches work
          </Link>
        </div>
      </div>
    </div>
  );
}
