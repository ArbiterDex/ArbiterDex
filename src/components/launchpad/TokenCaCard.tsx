"use client";

import { useState } from "react";
import { BRAND, CHAIN, TOKEN, explorerToken } from "@/config/brand";
import { Mark } from "@/components/Logo";
import { ArrowUpRight, CheckIcon, CopyIcon } from "@/components/icons";

/** Contract card for the token page: full address and a copy button once live. */
export function TokenCaCard() {
  const live = TOKEN.isLive;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the address stays selectable.
    }
  };
  return (
    <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-white/[0.05] text-ink">
        <Mark size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] text-ink-2">Contract address · {CHAIN.name}</p>
        <p className="mt-1 break-all font-mono text-[13px]">{live ? BRAND.ca : "Published at launch"}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {live ? (
          <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="btn btn-ghost !h-9 !px-3">
            Explorer <ArrowUpRight />
          </a>
        ) : null}
        <button type="button" onClick={copy} disabled={!live} className="btn btn-cream !h-9 !px-3.5">
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {live ? (copied ? "Copied" : "Copy") : "Not live yet"}
        </button>
      </div>
    </div>
  );
}
