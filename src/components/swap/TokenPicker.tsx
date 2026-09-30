"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_ASSETS, type Asset } from "@/config/assets";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { TokenLogo } from "@/components/ui/TokenLogo";

/** Full-list asset picker. Portaled to <body> so no ancestor can clip it. */
export function TokenPicker({ exclude, onPick, onClose, balances }: { exclude?: string; onPick: (a: Asset) => void; onClose: () => void; balances?: Record<string, string> }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL_ASSETS.filter((a) => !s || a.symbol.toLowerCase().includes(s) || a.name.toLowerCase().includes(s) || a.address.toLowerCase() === s);
  }, [q]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Select an asset" className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade cursor-default bg-black/60 backdrop-blur-sm" />
      <div className="relative flex max-h-[86dvh] w-full max-w-[440px] animate-sheet flex-col overflow-hidden rounded-t-[16px] border border-line bg-panel sm:animate-pop sm:rounded-[16px]">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-[18px] font-medium">Select an asset</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-[8px] bg-white/[0.05] text-ink-2 hover:text-ink">
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="relative px-5 pt-4">
          <SearchIcon className="pointer-events-none absolute left-8 top-1/2 mt-2 size-4 -translate-y-1/2 text-ink-3" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ticker or address" className="field !pl-10" />
        </div>
        <ul className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {list.map((a) => {
            const disabled = a.symbol === exclude;
            const raw = balances?.[a.address.toLowerCase()];
            const held = raw ? Number(BigInt(raw)) / 10 ** a.decimals : 0;
            return (
              <li key={a.symbol}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(a)}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors enabled:hover:bg-white/[0.05] disabled:opacity-40"
                >
                  <TokenLogo src={a.logo} symbol={a.symbol} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{a.symbol}</span>
                    <span className="block truncate text-[12.5px] text-mute">{a.name}</span>
                  </span>
                  {held > 0 ? <span className="num text-[13px] text-ink-2">{held.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span> : null}
                </button>
              </li>
            );
          })}
          {list.length === 0 ? <li className="px-4 py-8 text-center text-[14px] text-mute">No verified asset matches that search.</li> : null}
        </ul>
        <p className="border-t border-line px-5 py-3 text-[12px] text-mute">Only issuer-verified contracts on Robinhood Chain are listed.</p>
      </div>
    </div>,
    document.body,
  );
}
