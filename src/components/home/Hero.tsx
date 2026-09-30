"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import { Mark } from "@/components/Logo";
import { ArrowRight, CloseIcon } from "@/components/icons";
import { LogoStack } from "@/components/ui/TokenLogo";
import { ParticleGlobe } from "@/components/home/ParticleGlobe";
import { Courthouse } from "@/components/home/Courthouse";

const WORDS = ["Stocks", "ETFs", "Commodities", "Treasuries", "Index Funds"];
const STACK = ["nvda", "tsla", "aapl", "meta", "googl", "amzn", "spcx", "qqq"].map((s) => ({ src: `/tokens/${s}.webp`, symbol: s }));

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="relative block h-[1.05em] overflow-hidden text-parchment" aria-live="polite">
      <span key={i} className="block animate-word">
        {WORDS[i]}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="wrap-land relative grid min-h-[calc(100svh-67px)] grid-cols-1 items-center gap-10 pb-10 pt-14 lg:min-h-[833px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pb-0 lg:pt-0">
        <div className="relative z-10 max-w-[640px]">
          <p className="flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
            <span className="flex items-center gap-2 text-sage-2">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-sage-2" /> Live now
            </span>
            <span>on</span>
            <span className="flex h-[28px] items-center gap-1.5 rounded-[6px] border border-line bg-white/[0.03] px-2 text-ink">
              <span className="grid size-[18px] place-items-center rounded-full bg-parchment text-onparch">
                <Mark size={11} />
              </span>
              Robinhood Chain
            </span>
            <span>with</span>
            <span className="flex h-[28px] items-center rounded-[6px] border border-line bg-white/[0.03] px-2 text-ink">Chainlink prices</span>
          </p>
          <h1 className="h-hero mt-6">
            The Fair-Price Marketplace for Everything Tokenized.
            <RotatingWord />
          </h1>
          <p className="mt-6 max-w-[560px] text-[18px] leading-[1.55] text-ink-2">
            Buy and sell tokenized assets at a price you can check. Every venue is compared, every quote is judged against an independent oracle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/assets" className="btn btn-cream">
              Explore Assets <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/swap" className="btn btn-ghost">
              Swap and Bridge
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3 text-[14px] text-mute">
            <LogoStack items={STACK} size={24} />
            <span>NVDA, TSLA, AAPL and 33 more verified stock tokens</span>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[560px] lg:absolute lg:right-[-40px] lg:top-1/2 lg:w-[760px] lg:max-w-none lg:-translate-y-1/2">
          <div className="absolute inset-[12%] overflow-hidden rounded-full [mask-image:radial-gradient(circle,black_45%,transparent_72%)]">
            <Courthouse className="absolute left-1/2 top-[54%] w-[118%] -translate-x-1/2 -translate-y-1/2 text-sage/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(96,145,126,0.22),transparent_65%)]" />
          </div>
          <ParticleGlobe className="absolute inset-0 size-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]">
            <Mark size={64} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Corner card announcing the token. Before launch it points to X instead of a market. */
export function LaunchToast() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[calc(100%-32px)] max-w-[288px] animate-rise rounded-[14px] border border-line-2 bg-panel/95 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur sm:bottom-5 sm:right-5">
      <button type="button" aria-label="Dismiss" onClick={() => setOpen(false)} className="absolute right-3 top-3 grid size-6 place-items-center text-ink-3 hover:text-ink">
        <CloseIcon className="size-3.5" />
      </button>
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-full border border-line-2 bg-night text-ink">
          <Mark size={20} />
        </span>
        <span className="font-wide text-[14px]">ARBITERDEX</span>
      </div>
      <p className="mt-4 text-[16px] font-medium">{BRAND.symbol} is on its way</p>
      <a href={BRAND.x} target="_blank" rel="noreferrer" className="mt-1 block text-[14px] leading-[1.45] text-ink-2 hover:text-ink">
        Follow {BRAND.xHandle} for the launch
      </a>
    </aside>
  );
}
