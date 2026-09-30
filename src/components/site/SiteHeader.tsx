"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND } from "@/config/brand";
import { NAV, type NavGroup, type NavItem } from "@/config/nav";
import { Logo } from "@/components/Logo";
import { CaPill } from "@/components/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { NavIcon } from "@/components/site/NavIcon";
import { ChevronDownIcon, CloseIcon, MenuIcon, XIcon } from "@/components/icons";

function isActive(pathname: string, group: NavGroup) {
  const hrefs = group.href ? [group.href] : (group.items ?? []).map((i) => i.href).filter(Boolean) as string[];
  return hrefs.some((h) => {
    const path = h.split(/[?#]/)[0];
    return path !== "/" && (pathname === path || pathname.startsWith(path + "/"));
  });
}

function MenuRow({ item, onPick }: { item: NavItem; onPick: () => void }) {
  const inner = (
    <>
      <NavIcon name={item.icon} className="size-4 shrink-0 text-ink-3" />
      <span className="flex-1">{item.label}</span>
      {item.soon ? <span className="tag-soon">Soon</span> : null}
    </>
  );
  const cls = "flex items-center gap-3 rounded-[6px] px-3 py-[7px] text-[14px] text-ink-2";
  return (
    <>
      {item.divider ? <li aria-hidden="true" className="mx-3 my-1.5 h-px bg-line" /> : null}
      <li>
        {item.soon || !item.href ? (
          <span className={`${cls} cursor-default opacity-60`}>{inner}</span>
        ) : (
          <Link href={item.href} onClick={onPick} className={`${cls} transition-colors hover:bg-white/[0.05] hover:text-ink`}>
            {inner}
          </Link>
        )}
      </li>
    </>
  );
}

function DesktopMenu({ group, active }: { group: NavGroup; active: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tone = active || open ? "text-ink" : "text-ink-2 hover:text-ink";
  if (!group.items) {
    return (
      <Link href={group.href!} className={`flex h-9 items-center rounded-[6px] px-3 text-[14px] transition-colors ${tone}`}>
        {group.label}
      </Link>
    );
  }
  const keep = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const leave = () => {
    keep();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };
  return (
    <div ref={root} className="relative" onMouseEnter={() => { keep(); setOpen(true); }} onMouseLeave={leave}>
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)} className={`flex h-9 items-center gap-1 rounded-[6px] px-3 text-[14px] transition-colors ${tone}`}>
        {group.label}
        <ChevronDownIcon className={`size-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[60] pt-1.5">
          <ul role="menu" className="min-w-[240px] animate-pop rounded-[10px] border border-line bg-[#0a1510] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
            {group.items.map((item) => (
              <MenuRow key={item.label} item={item} onPick={() => setOpen(false)} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 z-[65] flex flex-col bg-night/[0.97] backdrop-blur-md xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="wrap flex h-[68px] shrink-0 items-center justify-between border-b border-line">
        <Link href="/" onClick={onClose} aria-label={`${BRAND.name} home`}>
          <Logo />
        </Link>
        <button type="button" aria-label="Close menu" onClick={onClose} className="grid size-10 place-items-center rounded-[6px] text-ink-2 hover:text-ink">
          <CloseIcon />
        </button>
      </div>
      <nav className="wrap min-h-0 flex-1 overflow-y-auto pb-10 pt-4">
        {NAV.map((group) =>
          group.items ? (
            <div key={group.label} className="border-b border-line py-3">
              <p className="px-3 pb-1 text-[12.5px] font-medium text-mute">{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <MenuRow key={item.label} item={{ ...item, divider: false }} onPick={onClose} />
                ))}
              </ul>
            </div>
          ) : (
            <Link key={group.label} href={group.href!} onClick={onClose} className="block border-b border-line px-3 py-4 text-[15px] text-ink">
              {group.label}
            </Link>
          ),
        )}
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 px-3 py-2 text-[14px] text-ink-2">
          <XIcon className="size-4" /> {BRAND.xHandle}
        </a>
      </nav>
    </div>,
    document.body,
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/[0.86] backdrop-blur-md">
      <div className="wrap flex h-[67px] items-center gap-3">
        <Link href="/" aria-label={`${BRAND.name} home`} className="shrink-0">
          <span className="sm:hidden">
            <Logo compact />
          </span>
          <span className="hidden sm:inline">
            <Logo />
          </span>
        </Link>
        <nav aria-label="Main" className="ml-10 hidden items-center xl:flex">
          {NAV.map((group) => (
            <DesktopMenu key={group.label} group={group} active={isActive(pathname, group)} />
          ))}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-2.5">
          <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className="hidden size-9 place-items-center text-ink-2 transition-colors hover:text-ink sm:grid">
            <XIcon className="size-[19px]" />
          </a>
          <CaPill />
          <NavWallet compact />
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="grid size-9 shrink-0 place-items-center rounded-[6px] text-ink-2 hover:text-ink xl:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>
      {drawer ? <MobileDrawer onClose={closeDrawer} /> : null}
    </header>
  );
}
