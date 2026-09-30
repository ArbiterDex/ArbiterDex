"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND, CHAIN as chain, explorerAddress, shortAddress } from "@/config/brand";
import { WALLET_CATALOG, catalogIcon } from "@/config/wallets";
import { WALLETCONNECT_RDNS, useWallet, type DiscoveredWallet } from "@/components/wallet/WalletProvider";
import { Mark } from "@/components/Logo";
import { AlertIcon, ArrowUpRight, CheckIcon, ChevronDownIcon, CloseIcon, CopyIcon, LogOutIcon, WalletIcon } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* One dialog for the whole site. Every "Connect" button opens it       */
/* through this context instead of owning a copy of it.                 */
/* ------------------------------------------------------------------ */

const ModalContext = createContext<{ open: () => void } | null>(null);

export function WalletModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  return (
    <ModalContext.Provider value={{ open: show }}>
      {children}
      {open ? <WalletDialog onClose={() => setOpen(false)} /> : null}
    </ModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useWalletModal must be used inside WalletModalProvider");
  return context;
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function Icon({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" width={36} height={36} className="size-9 shrink-0 rounded-[10px]" />
  ) : (
    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white/[0.06] text-ink-2">
      <WalletIcon className="size-5" />
    </span>
  );
}

const row = "flex min-h-[58px] w-full items-center gap-3 rounded-[10px] border border-line bg-white/[0.03] px-3.5 py-2.5 text-left text-[15px]";

/**
 * The wallet list itself: detected wallets (EIP-6963) first, then
 * WalletConnect, then wallets that support Robinhood Chain but are not in
 * this browser (install link on desktop, open-in-wallet link on phones).
 * Used by the site dialog and by the app's connect sheet.
 */
export function WalletPicker({ onConnected }: { onConnected?: () => void }) {
  const { wallets, connect, connecting, error } = useWallet();
  const [pending, setPending] = useState<string | null>(null);
  // Only ever rendered after a click, so the browser is there to ask.
  const [mobile] = useState(() => typeof navigator !== "undefined" && isMobile());
  const [here] = useState(() => (typeof window === "undefined" ? BRAND.url : window.location.href));

  useEffect(() => {
    // Late-loading extensions announce on request, so ask again on open.
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }, []);

  const installed = wallets
    .filter((w) => w.rdns !== WALLETCONNECT_RDNS)
    .sort((a, b) => Number(Boolean(a.unsupported)) - Number(Boolean(b.unsupported)));
  const walletConnect = wallets.find((w) => w.rdns === WALLETCONNECT_RDNS) ?? null;
  const detected = new Set(wallets.map((w) => w.rdns));
  const more = WALLET_CATALOG.filter((c) => !c.rdns.some((r) => detected.has(r)));

  async function pick(wallet: DiscoveredWallet) {
    setPending(wallet.rdns);
    const ok = await connect(wallet);
    setPending(null);
    if (ok) onConnected?.();
  }

  return (
    <div>
      {installed.length ? (
        <>
          <p className="px-1 pb-2 text-[13px] font-semibold text-ink-3">Detected in this browser</p>
          <ul className="grid gap-1.5">
            {installed.map((wallet) => (
              <li key={wallet.rdns}>
                <button
                  type="button"
                  disabled={connecting || Boolean(wallet.unsupported)}
                  onClick={() => pick(wallet)}
                  className={`${row} transition-colors enabled:hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Icon src={wallet.icon || catalogIcon(wallet.rdns)} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{wallet.name}</span>
                    <span className="block text-[12.5px] text-ink-2">{wallet.unsupported ? `Not supported · ${wallet.unsupported}` : "Installed"}</span>
                  </span>
                  {pending === wallet.rdns ? <span className="text-[12.5px] text-ink-2">Check wallet…</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="px-1 pb-2 pt-4 text-[13px] font-semibold text-ink-3 first:pt-0">Mobile and other wallets</p>
      {walletConnect ? (
        <button type="button" disabled={connecting} onClick={() => pick(walletConnect)} className={`${row} transition-colors enabled:hover:bg-white/[0.07] disabled:opacity-50`}>
          <Icon src="/wallets/walletconnect.webp" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">WalletConnect</span>
            <span className="block text-[12.5px] text-ink-2">Scan a QR code with a mobile wallet</span>
          </span>
          {pending === WALLETCONNECT_RDNS ? <span className="text-[12.5px] text-ink-2">Opening…</span> : null}
        </button>
      ) : (
        <div className={`${row} opacity-50`}>
          <Icon src="/wallets/walletconnect.webp" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">WalletConnect</span>
            <span className="block text-[12.5px] text-ink-2">Not configured on this site yet</span>
          </span>
        </div>
      )}

      {more.length ? (
        <>
          <p className="px-1 pb-2 pt-4 text-[13px] font-semibold text-ink-3">{mobile ? "Open this site in a wallet app" : "Not installed · supports Robinhood Chain"}</p>
          <ul className="grid gap-1.5">
            {more.map((w) => {
              const href = mobile && w.deepLink ? w.deepLink(here) : w.install;
              const label = mobile && w.deepLink ? "Open" : "Install";
              return (
                <li key={w.id}>
                  <a href={href} target="_blank" rel="noreferrer" className={`${row} transition-colors hover:bg-white/[0.07]`}>
                    <Icon src={`/wallets/${w.id}.webp`} />
                    <span className="min-w-0 flex-1 font-semibold">{w.name}</span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-2">
                      {label} <ArrowUpRight className="size-3" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-[8px] bg-danger-tint px-3 py-2.5 text-[13.5px] leading-[1.45] text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function WalletDialog({ onClose }: { onClose: () => void }) {
  const { clearError } = useWallet();

  const close = useCallback(() => {
    onClose();
    clearError();
  }, [onClose, clearError]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  // The navbar blurs what is behind it, and a backdrop filter turns it into
  // the containing block for fixed children. Rendered in place, the dialog
  // would be clipped to the navbar, so it always goes to <body>.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title" className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 animate-fade cursor-default bg-black/60 backdrop-blur-sm" />
      <div className="relative flex max-h-[92dvh] w-full max-w-[420px] animate-sheet flex-col overflow-hidden rounded-t-[16px] border border-line bg-panel shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] sm:animate-pop sm:rounded-[16px]">
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <Mark size={24} className="text-parchment" />
            <h2 id="wallet-dialog-title" className="text-[20px] font-medium tracking-[-0.02em]">
              Connect a wallet
            </h2>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="grid size-10 place-items-center rounded-[8px] bg-white/[0.05] text-ink-2 transition-colors hover:bg-white/[0.1] hover:text-ink">
            <CloseIcon />
          </button>
        </div>
        <p className="px-5 pt-3 text-[14.5px] leading-[1.5] text-ink-2">
          Any EVM wallet that can add a custom network works on {chain.name}. Connecting only shares your address; your wallet asks before any trade is sent.
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-4">
          <WalletPicker onConnected={onClose} />
        </div>
        <p className="mt-2 border-t border-line px-5 py-3.5 font-mono text-[11px] text-ink-3">
          {chain.name} · chain id {chain.id} · added to your wallet on connect
        </p>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Navbar control: Connect, or the connected account with its menu.     */
/* ------------------------------------------------------------------ */

export function NavWallet({ compact = false }: { compact?: boolean }) {
  const { address } = useWallet();
  const { open } = useWalletModal();
  if (address) return <AccountMenu compact={compact} />;
  return (
    <button type="button" onClick={open} className="btn btn-sage !h-[34px] shrink-0 !px-3.5">
      Connect
    </button>
  );
}

function AccountMenu({ compact }: { compact: boolean }) {
  const { address, walletName, chainId, balance, onRobinhoodChain, switchNetwork, switching, disconnect, error } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const WIDTH = 288;
    const position = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(8, Math.min(rect.right - WIDTH, window.innerWidth - WIDTH - 8));
      setPlace({ top: rect.bottom + 10, left });
    };
    position();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
    };
  }, [open]);

  if (!address) return null;
  const wrongNetwork = chainId !== null && !onRobinhoodChain;
  const item = "flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-ink-2 transition-colors hover:bg-white/[0.05] hover:text-ink";

  return (
    <div ref={root} className="flex shrink-0 items-center">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-[34px] items-center gap-2 whitespace-nowrap rounded-[4px] border border-line-2 bg-white/[0.03] px-2.5 transition-colors hover:bg-white/[0.07]"
      >
        <span className={`size-2 rounded-full ${wrongNetwork ? "bg-danger" : "bg-up"}`} />
        <span className="font-mono text-[12.5px]">{shortAddress(address, compact ? 4 : 5, 4)}</span>
        <ChevronDownIcon className="size-3.5 text-ink-2" />
      </button>

      {open && place
        ? createPortal(
            <div ref={menu} role="menu" style={{ position: "fixed", top: place.top, left: place.left }} className="z-[80] w-[288px] animate-fade overflow-hidden rounded-[12px] border border-line bg-panel shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]">
              <div className="border-b border-line px-4 py-4">
                <p className="text-[12.5px] text-ink-2">{walletName ?? "Wallet"}</p>
                <p className="mt-1 font-mono text-[13px]">{shortAddress(address, 10, 8)}</p>
                <p className="num mt-2 text-[22px] font-medium">{balance === null ? "…" : `${balance} ${chain.nativeSymbol}`}</p>
                <p className={`mt-1 text-[12.5px] ${wrongNetwork ? "text-danger" : "text-ink-2"}`}>
                  {chainId === null ? "Reading network…" : onRobinhoodChain ? `On ${chain.name}` : `On chain ${chainId}, not ${chain.name}`}
                </p>
              </div>
              {wrongNetwork ? (
                <div className="border-b border-line p-2">
                  <button type="button" role="menuitem" disabled={switching} onClick={switchNetwork} className="btn btn-cream !h-10 w-full">
                    {switching ? "Confirm in wallet…" : `Switch to ${chain.name}`}
                  </button>
                  {error ? <p className="mt-2 px-1 text-[12.5px] leading-[1.45] text-danger">{error}</p> : null}
                </div>
              ) : null}
              <div className="flex flex-col p-1.5 text-[14.5px]">
                <Link role="menuitem" href="/swap" onClick={() => setOpen(false)} className={item}>
                  <WalletIcon className="size-4" /> Open swap
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1400);
                    } catch {
                      // Clipboard refused; the address above stays readable.
                    }
                  }}
                  className={item}
                >
                  {copied ? <CheckIcon className="size-4 text-up" /> : <CopyIcon className="size-4" />}
                  {copied ? "Copied" : "Copy address"}
                </button>
                <a role="menuitem" href={explorerAddress(address)} target="_blank" rel="noreferrer" className={item}>
                  <ArrowUpRight className="size-4" /> View on explorer
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    disconnect();
                  }}
                  className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-danger transition-colors hover:bg-danger-tint"
                >
                  <LogOutIcon className="size-4" /> Disconnect
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
