"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CaPill } from "@/components/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { LaunchpadMark } from "@/components/launchpad/LaunchpadMark";
import { LP_NAV } from "@/components/launchpad/nav";

const itemCls = (active: boolean) =>
  `flex h-9 items-center rounded-[6px] px-3 text-[14px] transition-colors ${active ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`;

function Drawer({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // The header blurs its backdrop, which would trap a fixed child inside it.
  return createPortal(
    <div className="fixed inset-0 z-[65] flex flex-col bg-night/[0.97] backdrop-blur-md xl:hidden" role="dialog" aria-modal="true" aria-label="Launchpad menu">
      <div className="wrap flex h-[68px] shrink-0 items-center justify-between border-b border-line">
        <Link href="/launchpad" onClick={onClose}>
          <LaunchpadMark small />
        </Link>
        <button type="button" aria-label="Close menu" onClick={onClose} className="grid size-10 place-items-center rounded-[6px] text-ink-2 hover:text-ink">
          <CloseIcon />
        </button>
      </div>
      <nav className="wrap min-h-0 flex-1 overflow-y-auto pb-10 pt-4">
        {[...LP_NAV, { label: "My tokens", href: "/launchpad/mine" }, { label: "Marketplace", href: "/" }, { label: "Swap & Bridge", href: "/swap" }].map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose} className={`block border-b border-line px-3 py-4 text-[15px] ${pathname === item.href ? "text-parchment" : "text-ink"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>,
    document.body,
  );
}

export function LaunchpadHeader() {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const close = useCallback(() => setDrawer(false), []);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/[0.86] backdrop-blur-md">
      <div className="wrap flex h-[68px] items-center gap-3">
        <Link href="/launchpad" aria-label="Launchpad home" className="shrink-0">
          <LaunchpadMark small />
        </Link>
        <nav aria-label="Launchpad" className="ml-8 hidden items-center gap-0.5 xl:flex">
          {LP_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={itemCls(active(item.href))}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <Link href="/" className={`hidden xl:flex ${itemCls(false)}`}>
            Marketplace
          </Link>
          <Link href="/launchpad/mine" className={`hidden xl:flex ${itemCls(active("/launchpad/mine"))}`}>
            My tokens
          </Link>
          <Link href="/swap" className="btn btn-ghost !hidden !h-[34px] !px-3 !text-ink xl:!inline-flex">
            Swap &amp; Bridge
          </Link>
          <CaPill />
          <NavWallet compact />
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="grid size-9 shrink-0 place-items-center rounded-[6px] text-ink-2 hover:text-ink xl:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>
      {drawer ? <Drawer onClose={close} pathname={pathname} /> : null}
    </header>
  );
}
