"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_ASSETS, type Asset } from "@/config/assets";
import { CHAIN } from "@/config/brand";
import { CheckIcon, InfoIcon, PlusIcon } from "@/components/icons";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { TokenOrb } from "@/components/launchpad/Visuals";

/* Create-a-token form. This is a preview: the launchpad contracts are not
   deployed, so nothing here sends a transaction. A draft can be kept in this
   browser and picked up again later. */

type Dest = "you" | "holders" | "burn";
type Draft = { name: string; ticker: string; story: string; website: string; x: string; fee: number; dest: Dest; pair: string; firstBuy: string };

const EMPTY: Draft = { name: "", ticker: "", story: "", website: "", x: "", fee: 2.5, dest: "you", pair: "ETH", firstBuy: "" };
const KEY = "arbiterdex.launch-draft";

const DESTS: { key: Dest; title: string; body: string }[] = [
  { key: "you", title: "To you", body: "Collect your fees any time from the token page, or use them to open more pools." },
  { key: "holders", title: "To holders", body: "Fees are shared with your token's holders by balance, in the pair asset. Nothing to claim." },
  { key: "burn", title: "Buy back & burn", body: "Fees buy your token in its own pool and burn it. Supply only shrinks." },
];

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-2 text-[11.5px] text-ink-2">{n}</span>
        <div>
          <h2 className="text-[21px] font-medium tracking-[-0.01em]">{title}</h2>
          <p className="mt-1 text-[14px] text-mute">{body}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <span className="mb-1.5 flex justify-between text-[13.5px] font-medium">
      {children}
      {count ? <span className="font-normal text-mute">{count}</span> : null}
    </span>
  );
}

export function LaunchForm() {
  const { address } = useWallet();
  const [d, setD] = useState<Draft>(EMPTY);
  const [links, setLinks] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // Restoring a saved draft from this browser, once, on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setD({ ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) });
    } catch {
      // Storage blocked: start from an empty draft.
    }
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));
  const pair = ALL_ASSETS.find((a) => a.symbol === d.pair) ?? ALL_ASSETS[1];
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const match = (a: Asset) => !q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    return [
      { title: "Native coin", items: ALL_ASSETS.filter((a) => a.symbol === "ETH" && match(a)) },
      { title: "Stablecoins", items: ALL_ASSETS.filter((a) => a.symbol === "USDG" && match(a)) },
      { title: "Tokenized stocks and funds", items: ALL_ASSETS.filter((a) => a.issuer === "Robinhood" && match(a)) },
    ].filter((g) => g.items.length);
  }, [search]);

  const saveDraft = () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(d));
      setSaved("Draft saved in this browser.");
    } catch {
      setSaved("This browser blocked storage, so the draft was not saved.");
    }
  };

  const ticker = d.ticker ? d.ticker.toUpperCase() : "TICKER";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid min-w-0 grid-cols-1 gap-6">
        <Step n="01" title="Start with your story" body="The image, the name and the ticker people will know it by.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
            <div className="row-tile grid min-h-[170px] place-items-center p-4 text-center">
              <div>
                <p className="text-[14px] font-medium">Add token image</p>
                <p className="mt-1 text-[12px] text-mute">PNG, JPG, GIF or WebP · up to 5 MB</p>
                <p className="mt-2 text-[11.5px] text-ink-4">Uploads open with launches</p>
              </div>
            </div>
            <div className="grid content-start gap-4">
              <label className="block">
                <Label count={`${d.name.length}/32`}>Token name</Label>
                <input className="field" maxLength={32} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="What is it called?" />
              </label>
              <label className="block">
                <Label count={`${d.ticker.length}/10`}>Ticker</Label>
                <input className="field uppercase" maxLength={10} value={d.ticker} onChange={(e) => set("ticker", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))} placeholder="$ TICKER" />
              </label>
            </div>
          </div>
          <label className="mt-5 block">
            <Label count={`${d.story.length}/1,000`}>Your story</Label>
            <textarea className="field !h-28 resize-none py-3" maxLength={1000} value={d.story} onChange={(e) => set("story", e.target.value)} placeholder="Tell people what this token is for." />
          </label>
          <p className="mt-1.5 text-[12.5px] text-mute">Optional. Stored in the token&apos;s metadata and shown on its page.</p>
          {links ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="field" value={d.website} onChange={(e) => set("website", e.target.value)} placeholder="Website, https://…" />
              <input className="field" value={d.x} onChange={(e) => set("x", e.target.value)} placeholder="X profile, https://x.com/…" />
            </div>
          ) : (
            <button type="button" onClick={() => setLinks(true)} className="mt-4 flex items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              <PlusIcon className="size-3.5" /> Add website and social links
            </button>
          )}
        </Step>

        <Step n="02" title="Find your pair" body="What your community trades your token with, from its first block.">
          <span className="chip border border-line-2 !bg-white/[0.08] !text-ink">{CHAIN.name}</span>
          <p className="mt-4 text-[14px] text-mute">Every {CHAIN.name} asset Arbiter DEX has verified: its coin, a stablecoin or a Stock Token. {ALL_ASSETS.length} to choose from.</p>
          <input className="field mt-4 max-w-[260px]" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pairs" aria-label="Search pairs" />
          {groups.map((g) => (
            <div key={g.title} className="mt-5">
              <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-mute">{g.title}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((a) => (
                  <button
                    type="button"
                    key={a.symbol}
                    onClick={() => set("pair", a.symbol)}
                    className={`row-tile flex min-w-0 items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.06] ${d.pair === a.symbol ? "!border-parchment/70" : ""}`}
                  >
                    <img src={a.logo} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full bg-white" />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium">{a.symbol}</span>
                      <span className="block truncate text-[12px] text-mute">{a.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-col gap-1 border-t border-line pt-4 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">
              Trading pair ${ticker} / {pair.symbol}
            </span>
            <span className="text-mute">
              {CHAIN.name} · chain {CHAIN.id}
            </span>
          </div>
        </Step>

        <Step n="03" title="A launch that feels like you" body="Your fee on every trade, where it goes, and your first purchase.">
          <Label>Your fee</Label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2.5, 5].map((f) => (
              <button type="button" key={f} onClick={() => set("fee", f)} className={`rounded-[6px] px-3 py-1.5 text-[14px] ${d.fee === f ? "bg-white/[0.09] text-ink" : "text-ink-2 hover:text-ink"}`}>
                {f}%
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-[14px] text-ink-2">
              Custom
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={d.fee}
                onChange={(e) => set("fee", Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                className="field !h-8 !w-20 !px-2"
                aria-label="Custom fee"
              />
            </label>
          </div>
          <div className="row-tile mt-3 max-w-[260px] !border-parchment/50 p-3">
            <p className="text-[12px] text-mute">On every trade</p>
            <p className="num mt-1 text-[22px] font-medium">{d.fee}%</p>
            <p className="text-[12px] text-mute">of every buy and sell</p>
          </div>
          <p className="mt-2 text-[12.5px] text-mute">Fixed at launch. Charged by the pool on buys and sells, never on transfers.</p>

          <div className="mt-6">
            <Label>Where your fees go</Label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {DESTS.map((o) => (
                <button type="button" key={o.key} onClick={() => set("dest", o.key)} className={`row-tile p-3.5 text-left transition-colors hover:bg-white/[0.05] ${d.dest === o.key ? "!border-parchment/70" : ""}`}>
                  <span className="flex items-center justify-between text-[14px] font-medium">
                    {o.title}
                    {d.dest === o.key ? <CheckIcon className="size-3.5 text-parchment" /> : null}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-[1.5] text-mute">{o.body}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Label>Buy your token at launch</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="row-tile flex items-center gap-2 px-3 py-2">
                <input className="num min-w-0 flex-1 bg-transparent text-[16px] outline-none" inputMode="decimal" placeholder="0" value={d.firstBuy} onChange={(e) => set("firstBuy", e.target.value.replace(/[^0-9.]/g, ""))} aria-label="First purchase" />
                <span className="text-[13px] text-ink-2">{pair.symbol}</span>
              </label>
              <div className="row-tile flex items-center justify-between px-3 py-2 text-[13px] text-mute">
                <span>You get</span>
                <span>shown at review</span>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] text-mute">Optional. Lands in the launch transaction itself, before anyone else can buy.</p>
          </div>
        </Step>

        <div className="flex flex-wrap items-center gap-3">
          {address ? (
            <button type="button" disabled className="btn btn-cream !h-11 !px-6">
              Launches open soon
            </button>
          ) : (
            <ConnectButton className="btn btn-cream !h-11 !px-6" />
          )}
          <button type="button" onClick={saveDraft} className="btn btn-ghost !h-11">
            Save draft
          </button>
          <span className="text-[13px] text-mute">{saved ?? "Preview only: nothing is deployed from this page yet."}</span>
        </div>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-[88px]">
        <div className="card p-4">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-[0.1em] text-ink-2">
              <span className="size-1.5 rounded-full bg-up" /> Live preview
            </span>
            <span className="text-mute">Your idea, taking shape</span>
          </div>
          <div className="mt-3 grid aspect-square place-items-center rounded-[8px] bg-white/[0.04]">
            <TokenOrb size={96} />
          </div>
          <p className="mt-4 text-[20px] font-medium">{d.name || "Your token"}</p>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-2">
            ${ticker}
            <span className="chip !h-6 !text-[11px]">Paired with {pair.symbol}</span>
          </p>
          <dl className="mt-4 grid gap-2 text-[12.5px]">
            {[
              ["Network", CHAIN.name],
              ["Status", "Draft"],
              ["Fee", `${d.fee}%`],
              ["Your fees", DESTS.find((x) => x.key === d.dest)!.title],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line pb-2">
                <dt className="text-mute">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel p-4">
          <p className="flex items-center gap-2 text-[14px] font-medium">
            <InfoIcon className="size-4 text-parchment" /> Why it is a preview
          </p>
          <p className="mt-2 text-[13px] leading-[1.6] text-mute">The launchpad contracts are not deployed yet. When they are, this form sends one transaction from your wallet that creates the token and its locked pool together.</p>
        </div>
      </aside>
    </div>
  );
}
