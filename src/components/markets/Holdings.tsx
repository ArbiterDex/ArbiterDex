"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ALL_ASSETS } from "@/config/assets";
import { BRAND, CHAIN, explorerAddress, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SourceNote } from "@/components/ui/SourceNote";
import { price, tokenAmount, units, usd } from "@/lib/format";
import { ExternalArrow } from "@/components/markets/ui";

type Row = { symbol: string; name: string; logo: string; amount: number; price: number | null; value: number | null };
type State = { status: "idle" | "loading" | "ready" | "error"; rows: Row[] };

export function Holdings() {
  const { address } = useWallet();
  const [state, setState] = useState<State>({ status: "idle", rows: [] });

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    const load = async () => {
      setState((s) => ({ status: s.rows.length ? s.status : "loading", rows: s.rows }));
      try {
        const [bal, mkt] = await Promise.all([
          fetch(`/api/portfolio?address=${address}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
          fetch("/api/market", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { rows: [] })),
        ]);
        const prices = new Map<string, number>((mkt.rows as { symbol: string; oracle: { price: number } | null }[]).filter((r) => r.oracle).map((r) => [r.symbol, r.oracle!.price]));
        prices.set("USDG", 1);
        const balances = (bal.balances ?? {}) as Record<string, string>;
        const rows: Row[] = ALL_ASSETS.flatMap((a) => {
          const raw = balances[a.address.toLowerCase()];
          if (!raw) return [];
          const amount = Number(units(raw, a.decimals, 8));
          const p = prices.get(a.symbol) ?? null;
          return [{ symbol: a.symbol, name: a.name, logo: a.logo, amount, price: p, value: p !== null ? amount * p : null }];
        }).sort((x, y) => (y.value ?? 0) - (x.value ?? 0));
        if (!cancelled) setState({ status: "ready", rows });
      } catch {
        if (!cancelled) setState((s) => ({ status: "error", rows: s.rows }));
      }
    };
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [address]);

  const total = state.rows.reduce((s, r) => s + (r.value ?? 0), 0);

  return (
    <>
      <div className="pt-12 sm:pt-[70px]">
        <p className="eyebrow">Portfolio</p>
        <h1 className="h-page mt-4">Everything You Hold, Valued Fairly</h1>
        <p className="mt-4 max-w-[640px] text-[17px] leading-[1.6] text-mute sm:text-[18px]">
          {address
            ? `Your ${CHAIN.name} balances, each valued at its independent oracle price rather than at whatever one pool says.`
            : `Connect to see every tokenized asset, ETH and USDG your wallet holds on ${CHAIN.name}, valued at the oracle's fair price.`}
        </p>
        {!address ? (
          <div className="mt-9">
            <ConnectButton />
          </div>
        ) : null}
      </div>

      {address ? (
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="card p-6">
              <p className="text-[13px] text-ink-2">Total value</p>
              <p className="num mt-3 text-[40px] font-medium leading-none tracking-[-0.02em] sm:text-[52px]">{state.status === "loading" ? "…" : usd(total)}</p>
              <p className="mt-3 text-[13px] text-mute">At Chainlink prices · USDG at $1.00</p>
            </div>
            <div className="panel p-6">
              <p className="text-[13px] text-ink-2">Wallet</p>
              <a href={explorerAddress(address)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-mono text-[15px] text-ink hover:text-parchment">
                {shortAddress(address, 8, 6)} <ExternalArrow />
              </a>
              <p className="mt-3 text-[13px] text-mute">
                {state.rows.length} asset{state.rows.length === 1 ? "" : "s"} held · {CHAIN.name}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[14px] border border-line">
            {state.status === "loading" ? (
              <p className="px-5 py-12 text-center text-[14px] text-mute">Reading your balances from {CHAIN.name}…</p>
            ) : state.status === "error" && state.rows.length === 0 ? (
              <p className="px-5 py-12 text-center text-[14px] text-mute">Balances could not be read right now. They refresh every 30 seconds.</p>
            ) : state.rows.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[14px] text-mute">This wallet holds none of the assets {BRAND.name} prices yet.</p>
                <Link href="/swap" className="btn btn-cream mt-5">
                  Make a first trade
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {state.rows.map((r) => (
                  <li key={r.symbol}>
                    <Link href={r.symbol === "USDG" ? "/swap" : `/assets/${r.symbol}`} className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] sm:px-6">
                      <TokenLogo src={r.logo} symbol={r.symbol} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">{r.symbol}</span>
                        <span className="block truncate text-[12.5px] text-mute">{r.name}</span>
                      </span>
                      <span className="hidden w-[140px] text-right sm:block">
                        <span className="num block text-[14px]">{tokenAmount(r.amount)}</span>
                        <span className="num block text-[12.5px] text-mute">@ {price(r.price)}</span>
                      </span>
                      <span className="num w-[110px] text-right text-[15px] font-medium">{r.value !== null ? usd(r.value) : "—"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <SourceNote live={state.status === "ready"}>Balances read from each token contract · prices from Chainlink · refreshed every 30 seconds</SourceNote>
          </div>
        </div>
      ) : null}
    </>
  );
}
