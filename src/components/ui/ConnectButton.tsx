"use client";

import { useWalletModal } from "@/components/wallet/WalletButton";
import { useWallet } from "@/components/wallet/WalletProvider";

/** In-page Connect: opens the one site-wide wallet dialog. Hidden once connected unless `always`. */
export function ConnectButton({ className = "btn btn-cream", label = "Connect", always = false }: { className?: string; label?: string; always?: boolean }) {
  const { open } = useWalletModal();
  const { address } = useWallet();
  if (address && !always) return null;
  return (
    <button type="button" onClick={open} className={className}>
      {label}
    </button>
  );
}
