"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAIN, explorerTx } from "@/config/brand";
import { assetBySymbol, type Asset } from "@/config/assets";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletModal } from "@/components/wallet/WalletButton";
import { TokenPicker } from "@/components/swap/TokenPicker";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { AlertIcon, ArrowDown, ArrowUpRight, ChevronDownIcon, GearIcon, InfoIcon, ScaleIcon, WalletIcon } from "@/components/icons";
import { allowanceCalldata, approveTx, swapTx, withSlippage, type Route } from "@/lib/uniswap";
import { rpc, waitForReceipt } from "@/lib/rpc";
import { bps, parseUnits, price, tokenAmount, units } from "@/lib/format";
import { RULING_TEXT, type Ruling } from "@/lib/verdict";

type Tab = "swap" | "bridge" | "private";

type Quote = {
  quotes: { route: Route; amountOut: string; gasEstimate: number }[];
  checked: number;
  oracle: { from: { price: number } | null; to: { price: number } | null; fairOut: number | null };
  edgeBps: number | null;
  ruling: Ruling | null;
  amountIn: string;
  from: string;
  to: string;
};

type Stage = { kind: "idle" } | { kind: "busy"; label: string } | { kind: "done"; hash: string } | { kind: "error"; message: string };

const PRIVATE_CHECKS = [
  "I am not a resident of a sanctioned country and not subject to sanctions myself.",
  "I am 18 or older, and these funds come from lawful activity.",
  "The receiving wallet is mine, and I have checked its address.",
  "I understand settlement is slower than a swap and a transfer can be held for review.",
];

const RULING_TONE: Record<Ruling, string> = {
  fair: "bg-sage text-night",
  watch: "bg-warn text-night",
  unfair: "bg-danger text-night",
  unknown: "bg-white/[0.1] text-ink",
};

function TokenButton({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 shrink-0 items-center gap-2 rounded-[8px] border border-line-2 bg-white/[0.03] pl-1.5 pr-2.5 text-[15px] font-medium transition-colors hover:bg-white/[0.07]">
      <TokenLogo src={asset.logo} symbol={asset.symbol} size={26} />
      {asset.symbol}
      <ChevronDownIcon className="size-3.5 text-ink-3" />
    </button>
  );
}

export function SwapCard({ initialTab = "swap", initialFrom = "USDG", initialTo = "NVDA" }: { initialTab?: Tab; initialFrom?: string; initialTo?: string }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [from, setFrom] = useState<Asset>(() => assetBySymbol(initialFrom) ?? assetBySymbol("USDG")!);
  const [to, setTo] = useState<Asset>(() => {
    const t = assetBySymbol(initialTo) ?? assetBySymbol("NVDA")!;
    return t.symbol === (assetBySymbol(initialFrom)?.symbol ?? "USDG") ? assetBySymbol("ETH")! : t;
  });
  const [amount, setAmount] = useState("");
  const [picker, setPicker] = useState<"from" | "to" | null>(null);
  const [slippage, setSlippage] = useState(50);
  const [settings, setSettings] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [prices, setPrices] = useState<Record<string, number>>({});

  const { address, onRobinhoodChain, chainId, switchNetwork, switching, sendTransaction } = useWallet();
  const { open } = useWalletModal();

  // Oracle prices for the dollar values under each box.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/market")
      .then((r) => r.json())
      .then((m: { rows: { symbol: string; oracle: { price: number } | null }[] }) => {
        if (cancelled) return;
        const p: Record<string, number> = { USDG: 1 };
        for (const row of m.rows ?? []) if (row.oracle) p[row.symbol] = row.oracle.price;
        setPrices(p);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBalances = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/portfolio?address=${address}`, { cache: "no-store" });
      const body = (await res.json()) as { balances?: Record<string, string> };
      setBalances(body.balances ?? {});
    } catch {
      // Balances are a convenience; the wallet still checks funds itself.
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    const t = window.setTimeout(loadBalances, 0);
    return () => window.clearTimeout(t);
  }, [address, loadBalances]);

  const amountIn = useMemo(() => parseUnits(amount, from.decimals), [amount, from.decimals]);

  // Debounced quote.
  const seq = useRef(0);
  useEffect(() => {
    if (tab !== "swap" || !amountIn || amountIn === 0n) return;
    const id = ++seq.current;
    const t = window.setTimeout(async () => {
      setLoading(true);
      setQuoteError(null);
      try {
        const res = await fetch(`/api/swap/quote?from=${from.symbol}&to=${to.symbol}&amount=${encodeURIComponent(amount)}`, { cache: "no-store" });
        const body = await res.json();
        if (id !== seq.current) return;
        if (!res.ok) {
          setQuote(null);
          setQuoteError(body.error ?? "No quote.");
        } else setQuote(body as Quote);
      } catch {
        if (id === seq.current) setQuoteError("Quotes are unavailable right now.");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [amount, amountIn, from.symbol, to.symbol, tab]);

  const hasAmount = Boolean(amountIn && amountIn > 0n);
  const live = hasAmount && quote && quote.from === from.symbol && quote.to === to.symbol && quote.amountIn === amountIn?.toString() ? quote : null;
  const best = live?.quotes[0] ?? null;
  const outHuman = best ? Number(BigInt(best.amountOut)) / 10 ** to.decimals : null;
  const balanceRaw = balances[from.address.toLowerCase()];
  const balance = balanceRaw ? BigInt(balanceRaw) : 0n;
  const short = address && amountIn ? amountIn > balance : false;
  const usdIn = hasAmount && prices[from.symbol] ? Number(amount) * prices[from.symbol] : null;
  const usdOut = outHuman !== null && prices[to.symbol] ? outHuman * prices[to.symbol] : null;

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount(outHuman ? String(Number(outHuman.toPrecision(6))) : "");
    setQuote(null);
  };

  async function execute() {
    if (!address || !best || !amountIn) return;
    setStage({ kind: "busy", label: "Checking allowance…" });
    try {
      if (from.symbol !== "ETH") {
        const raw = await rpc<string>("eth_call", [{ to: from.address, data: allowanceCalldata(address as `0x${string}`) }, "latest"]);
        if (BigInt(raw || "0x0") < amountIn) {
          setStage({ kind: "busy", label: `Approve ${from.symbol} in your wallet…` });
          const ap = approveTx(from.address, amountIn);
          const approveHash = await sendTransaction({ to: ap.to, data: ap.data });
          setStage({ kind: "busy", label: "Waiting for the approval to settle…" });
          const r = await waitForReceipt(approveHash);
          if (!r.ok) throw new Error("The approval was reverted.");
        }
      }
      setStage({ kind: "busy", label: "Confirm the swap in your wallet…" });
      const minOut = withSlippage(BigInt(best.amountOut), slippage);
      const tx = swapTx(best.route, from.address, to.address, amountIn, minOut, address as `0x${string}`);
      const hash = await sendTransaction({ to: tx.to, data: tx.data, value: tx.value });
      setStage({ kind: "busy", label: "Settling on Robinhood Chain…" });
      const receipt = await waitForReceipt(hash);
      if (!receipt.ok) throw new Error("The swap was reverted, most likely because the price moved past your slippage limit. Nothing was spent except gas.");
      setStage({ kind: "done", hash });
      setAmount("");
      setQuote(null);
      loadBalances();
    } catch (cause) {
      setStage({ kind: "error", message: cause instanceof Error ? cause.message : "The swap did not go through." });
    }
  }

  let action: { label: string; onClick?: () => void; disabled?: boolean };
  if (tab !== "swap") action = { label: tab === "bridge" ? "Bridging opens soon" : "Private settlement opens soon", disabled: true };
  else if (!address) action = { label: "Connect", onClick: open };
  else if (chainId !== null && !onRobinhoodChain) action = { label: switching ? "Confirm in wallet…" : `Switch to ${CHAIN.name}`, onClick: switchNetwork, disabled: switching };
  else if (!hasAmount) action = { label: "Enter an amount", disabled: true };
  else if (short) action = { label: `Not enough ${from.symbol}`, disabled: true };
  else if (loading && !live) action = { label: "Comparing venues…", disabled: true };
  else if (!best) action = { label: "No route for this pair", disabled: true };
  else if (stage.kind === "busy") action = { label: stage.label, disabled: true };
  else action = { label: live?.ruling === "unfair" ? "Swap anyway" : "Swap", onClick: execute };

  const tabs: { key: Tab; label: string }[] = [
    { key: "swap", label: "Swap" },
    { key: "bridge", label: "Bridge" },
    { key: "private", label: "Private" },
  ];

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="rounded-[16px] border border-line bg-night">
        <div className="flex items-center justify-between px-4 pb-1 pt-3 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`h-11 rounded-[10px] px-3 text-[15.5px] font-medium transition-colors ${tab === t.key ? "bg-white/[0.07] text-ink" : "text-ink-2 hover:text-ink"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button type="button" aria-label="Settings" aria-expanded={settings} onClick={() => setSettings((v) => !v)} className="grid size-10 place-items-center text-ink-2 hover:text-ink">
              <GearIcon />
            </button>
            {settings ? (
              <div className="absolute right-0 top-full z-20 mt-1 w-[240px] animate-pop rounded-[12px] border border-line bg-panel p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
                <p className="text-[13px] font-medium">Max slippage</p>
                <p className="mt-1 text-[12px] text-mute">The swap reverts if the price moves further than this.</p>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[10, 50, 100].map((v) => (
                    <button key={v} type="button" onClick={() => setSlippage(v)} className={`h-8 rounded-[6px] text-[13px] ${slippage === v ? "bg-parchment text-onparch" : "bg-white/[0.06] text-ink-2"}`}>
                      {v / 100}%
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-3 pb-3 pt-2 sm:px-6 sm:pb-6">
          {tab === "private" ? (
            <div className="mb-3 flex gap-3 rounded-[12px] border border-sage/50 bg-[linear-gradient(180deg,rgba(96,145,126,0.12),rgba(96,145,126,0.03))] p-4 text-[14.5px] leading-[1.6] text-ink-2">
              <InfoIcon className="mt-1 size-4 shrink-0 text-parchment" />
              <p>
                Private settlement will move an asset to a fresh address with no on-chain link between the two wallets. It is slower than a swap and every transfer is screened. It is not open yet; the fields below show how it will work.
              </p>
            </div>
          ) : null}
          {tab === "bridge" ? (
            <div className="mb-3 flex gap-3 rounded-[12px] border border-line bg-white/[0.02] p-4 text-[14px] leading-[1.6] text-ink-2">
              <InfoIcon className="mt-1 size-4 shrink-0 text-parchment" />
              <p>Bridging into and out of {CHAIN.name} is not open yet. Every route that works today settles on {CHAIN.name}.</p>
            </div>
          ) : null}

          {tab === "private" ? (
            <div className="rounded-[12px] border border-line bg-white/[0.02] p-4">
              <p className="text-[15px] font-medium text-ink-2">Before you continue</p>
              <ul className="mt-3 grid gap-3">
                {PRIVATE_CHECKS.map((c) => (
                  <li key={c} className="flex gap-3 text-[13.5px] leading-[1.5] text-ink-3">
                    <span className="mt-0.5 size-[18px] shrink-0 rounded-[4px] border border-line-2" />
                    {c}
                  </li>
                ))}
              </ul>
              <button type="button" disabled className="btn mt-4 h-11 w-full bg-white/[0.06] text-ink-3">
                Private settlement opens soon
              </button>
            </div>
          ) : (
          <>
          <div className="rounded-[12px] bg-night-2 p-4">
            <div className="flex items-center justify-between text-[15px] font-medium">
              <span>Send</span>
              {address && tab === "swap" ? (
                <button type="button" onClick={() => balance > 0n && setAmount(units(balance, from.decimals, from.decimals))} className="text-[12.5px] font-normal text-mute hover:text-ink">
                  Balance {tokenAmount(Number(balance) / 10 ** from.decimals)}
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                inputMode="decimal"
                placeholder="0"
                aria-label="Amount to send"
                value={amount}
                disabled={tab !== "swap"}
                onChange={(e) => {
                  const v = e.target.value.replace(",", ".");
                  if (/^\d*\.?\d*$/.test(v)) {
                    setAmount(v);
                    setStage((s) => (s.kind === "busy" ? s : { kind: "idle" }));
                  }
                }}
                className="num min-w-0 flex-1 bg-transparent text-[34px] font-medium leading-none tracking-[-0.02em] text-ink outline-none placeholder:text-ink-4 disabled:opacity-60"
              />
              <TokenButton asset={from} onClick={() => setPicker("from")} />
            </div>
            <p className="num mt-2 text-[13px] text-mute">{usdIn !== null ? price(usdIn) : "$0.00"}</p>
          </div>

          <div className="relative z-10 -my-3 flex justify-center">
            <button type="button" aria-label="Switch direction" onClick={flip} className="grid size-10 place-items-center rounded-[10px] border-4 border-night bg-night-2 text-ink-2 transition-colors hover:text-ink">
              <ArrowDown className="size-4" />
            </button>
          </div>

          <div className="rounded-[12px] bg-night-2 p-4">
            <p className="text-[15px] font-medium">Receive</p>
            <div className="mt-2 flex items-center gap-3">
              <p className={`num min-w-0 flex-1 truncate text-[34px] font-medium leading-none tracking-[-0.02em] ${outHuman !== null ? "text-ink" : "text-ink-4"}`}>{outHuman !== null ? tokenAmount(outHuman) : loading && hasAmount ? "…" : "0"}</p>
              <TokenButton asset={to} onClick={() => setPicker("to")} />
            </div>
            <p className="num mt-2 text-[13px] text-mute">{usdOut !== null ? price(usdOut) : "$0.00"}</p>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={action.onClick} disabled={action.disabled} className={`btn h-12 flex-1 !text-[15px] ${action.disabled ? "bg-white/[0.06] text-ink-3" : "btn-cream"}`}>
              {action.label}
            </button>
            <button type="button" aria-label={address ? "Wallet connected" : "Connect wallet"} onClick={address ? undefined : open} className="grid size-12 shrink-0 place-items-center rounded-[4px] border border-line bg-white/[0.03] text-ink-2 hover:text-ink">
              <WalletIcon className="size-5" />
            </button>
          </div>

          </>
          )}

          {stage.kind === "done" ? (
            <a href={explorerTx(stage.hash)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-[10px] bg-sage-tint px-4 py-3 text-[14px] text-ink">
              Swap settled on {CHAIN.name} <ArrowUpRight className="size-4" />
            </a>
          ) : null}
          {stage.kind === "error" ? (
            <p className="mt-3 flex gap-2 rounded-[10px] bg-danger-tint px-4 py-3 text-[13.5px] leading-[1.5] text-danger">
              <AlertIcon className="mt-0.5 size-4 shrink-0" /> {stage.message}
            </p>
          ) : null}
          {quoteError && hasAmount && tab === "swap" ? <p className="mt-3 text-[13px] text-mute">{quoteError}</p> : null}
        </div>
      </div>

      {tab === "swap" && live && best ? (
        <div className="mt-3 rounded-[16px] border border-line bg-night p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[14px] font-medium">
              <ScaleIcon className="size-4 text-parchment" /> Arbiter ruling
            </p>
            {live.ruling ? <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-semibold ${RULING_TONE[live.ruling]}`}>{RULING_TEXT[live.ruling].title}</span> : null}
          </div>
          {live.ruling ? <p className="mt-2 text-[13px] leading-[1.55] text-ink-2">{RULING_TEXT[live.ruling].body}</p> : null}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            <div>
              <dt className="text-mute">Best route pays</dt>
              <dd className="num mt-0.5">
                {tokenAmount(outHuman ?? 0)} {to.symbol}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Oracle fair value</dt>
              <dd className="num mt-0.5">{live.oracle.fairOut !== null ? `${tokenAmount(live.oracle.fairOut)} ${to.symbol}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-mute">Gap to fair value</dt>
              <dd className={`num mt-0.5 ${live.edgeBps !== null && live.edgeBps < -50 ? "text-warn" : ""}`}>{bps(live.edgeBps)}</dd>
            </div>
            <div>
              <dt className="text-mute">Minimum received</dt>
              <dd className="num mt-0.5">
                {tokenAmount(Number(withSlippage(BigInt(best.amountOut), slippage)) / 10 ** to.decimals)} {to.symbol}
              </dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-[12.5px] text-mute">
              {live.checked} routes checked · {live.quotes.length} can fill this order
            </p>
            <ul className="mt-2 grid gap-1.5">
              {live.quotes.slice(0, 4).map((q, i) => (
                <li key={i} className={`flex items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-[12.5px] ${i === 0 ? "bg-parchment text-onparch" : "bg-white/[0.03] text-ink-2"}`}>
                  <span className="min-w-0 truncate">{q.route.hops.join(" → ")} · {q.route.label.replace("Uniswap v3 · ", "")}</span>
                  <span className="num shrink-0">{tokenAmount(Number(BigInt(q.amountOut)) / 10 ** to.decimals)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-mute">
            Quotes from Uniswap v3 on {CHAIN.name}; fair value from Chainlink. Your wallet sends the trade; nothing passes through an Arbiter DEX contract. <Link href="/docs#fees" className="underline underline-offset-2 hover:text-ink">How rulings work</Link>
          </p>
        </div>
      ) : null}

      {picker ? (
        <TokenPicker
          exclude={picker === "from" ? to.symbol : from.symbol}
          balances={balances}
          onClose={() => setPicker(null)}
          onPick={(a) => {
            if (picker === "from") setFrom(a);
            else setTo(a);
            setQuote(null);
            setPicker(null);
          }}
        />
      ) : null}
    </div>
  );
}
