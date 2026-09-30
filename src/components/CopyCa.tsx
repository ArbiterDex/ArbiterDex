"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND, TOKEN, explorerToken, shortAddress } from "@/config/brand";
import { CheckIcon, CopyIcon, GithubIcon, XIcon } from "@/components/icons";

/** Copies the token contract. Before launch it reports that instead of copying. */
function useCopyCa() {
  const [state, setState] = useState<"idle" | "copied" | "pending">("idle");
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const flash = (next: "copied" | "pending") => {
    setState(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  };
  const copy = async () => {
    if (!TOKEN.isLive) return flash("pending");
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      flash("copied");
    } catch {
      // Clipboard can be blocked; the footer still shows the full address.
    }
  };
  return { state, copy };
}

/**
 * Navbar pill: ticker plus a copy icon. `label` is hidden on the narrowest
 * layouts, where only "CA" and the icon remain.
 */
export function CaPill() {
  const { state, copy } = useCopyCa();
  const live = TOKEN.isLive;
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={copy}
        aria-label={live ? `Copy ${BRAND.symbol} contract address` : `${BRAND.symbol} contract is published at launch`}
        title={live ? BRAND.ca : "Contract published at launch"}
        className="flex h-[34px] items-center gap-1.5 rounded-[4px] border border-line-2 px-2.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-white/30 hover:text-ink"
      >
        <span className="hidden min-[1440px]:inline">{BRAND.symbol}</span>
        <span className="min-[1440px]:hidden">CA</span>
        {state === "copied" ? <CheckIcon className="size-3.5 text-up" /> : <CopyIcon className="size-3.5" />}
      </button>
      {state !== "idle" ? (
        <span role="status" className="absolute right-0 top-[calc(100%+8px)] z-[60] animate-fade whitespace-nowrap rounded-[6px] border border-line bg-panel px-2.5 py-1.5 text-[12px] text-ink">
          {state === "copied" ? "Contract address copied" : "Published at launch"}
        </span>
      ) : null}
    </div>
  );
}

/** Footer token block: full address, copy button and links. */
export function CaBlock() {
  const { state, copy } = useCopyCa();
  const live = TOKEN.isLive;
  return (
    <div className="w-full max-w-[420px]">
      <p className="text-[14px] font-medium text-ink">{BRAND.symbol} contract</p>
      <div className="mt-3 flex items-center gap-2 rounded-[8px] border border-line bg-white/[0.03] p-1.5 pl-3.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink-2">{live ? shortAddress(BRAND.ca, 10, 8) : "Published at launch"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy contract address"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] bg-parchment px-3 text-[12.5px] font-medium text-onparch transition-colors hover:bg-parchment-2"
        >
          {state === "copied" ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {state === "copied" ? "Copied" : state === "pending" ? "At launch" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] text-mute">{live ? "Robinhood Chain · check the address before you trade." : "The contract address appears here the moment it is deployed."}</p>
      <div className="mt-4 flex items-center gap-4 text-[14px] text-ink-2">
        {live ? (
          <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="hover:text-ink">
            Explorer
          </a>
        ) : null}
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
          <XIcon className="size-4" /> {BRAND.xHandle}
        </a>
        {BRAND.github ? (
          <a href={BRAND.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
            <GithubIcon className="size-4" /> GitHub
          </a>
        ) : null}
      </div>
    </div>
  );
}
