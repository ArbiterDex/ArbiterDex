"use client";

import { useState } from "react";
import { shortAddress } from "@/config/brand";
import { CheckIcon, CopyIcon } from "@/components/icons";

/** Short address chip that copies the full address. */
export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(address);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          // Clipboard blocked; nothing else to do.
        }
      }}
      className="chip border border-line font-mono !text-[12px] hover:!text-ink"
      aria-label="Copy token address"
    >
      {shortAddress(address, 6, 4)}
      {copied ? <CheckIcon className="size-3 text-up" /> : <CopyIcon className="size-3" />}
    </button>
  );
}
