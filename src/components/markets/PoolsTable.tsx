"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SearchIcon } from "@/components/icons";
import { compact, pct } from "@/lib/format";

export type PoolRow = {
  pair: string;
  symbol: string;
  name: string;
  logo: string;
  quote: string;
  dex: string;
  version: string;
  liquidityUsd: number;
  volume24h: number;
  /** Fee tier in hundredths of a bip; null when not readable. */
  fee: number | null;
};

const apr = (p: PoolRow) => (p.fee !== null && p.liquidityUsd > 0 ? ((p.volume24h * (p.fee / 1e6) * 365) / p.liquidityUsd) * 100 : null);

export function PoolsTable({ pools }: { pools: PoolRow[] }) {
  const [q, setQ] = useState("");
  const [size, setSize] = useState(25);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? pools.filter((p) => `${p.symbol}/${p.quote} ${p.name} ${p.dex}`.toLowerCase().includes(n)) : pools;
  }, [pools, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * size, current * size + size);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-[520px]">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search by stock or DEX"
            className="field !pl-11"
            aria-label="Search pools"
          />
        </label>
        <span className="flex h-9 w-fit items-center gap-2 rounded-[6px] bg-white/[0.08] px-3 text-[14px] text-ink">
          <span className="size-2 rounded-full bg-up" /> Robinhood Chain
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 panel px-5 py-10 text-center text-[14px] text-mute">{pools.length ? `No pool matches “${q}”.` : "Pools could not be read right now. Try again in a minute."}</div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-[14px] border border-line lg:block">
            <table className="w-full table-fixed text-[14px]">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line text-right">
                  <th className="table-head px-6 py-4 text-left">Pool</th>
                  <th className="table-head px-3 py-4 text-left">DEX</th>
                  <th className="table-head px-3 py-4">Liquidity</th>
                  <th className="table-head px-3 py-4">24h volume</th>
                  <th className="table-head px-3 py-4">Fee</th>
                  <th className="table-head px-6 py-4">Fee APR</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.pair} className="group border-b border-line text-right last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-left">
                      <Link href={`/rwa-pools/${p.pair}`} className="flex min-w-0 items-center gap-3">
                        <TokenLogo src={p.logo} symbol={p.symbol} size={38} />
                        <span className="min-w-0">
                          <span className="block truncate text-[15.5px] font-medium group-hover:text-parchment">
                            {p.symbol}/{p.quote}
                          </span>
                          <span className="block truncate text-[13px] text-mute">Robinhood Chain · {p.name}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="truncate px-3 py-4 text-left text-ink-2">
                      {p.dex} {p.version}
                    </td>
                    <td className="num px-3 py-4 text-[15px] font-medium">{compact(p.liquidityUsd)}</td>
                    <td className="num px-3 py-4 text-[15px] font-medium">{compact(p.volume24h)}</td>
                    <td className="num px-3 py-4 text-ink-2">{p.fee !== null ? `${p.fee / 10000}%` : "—"}</td>
                    <td className="num px-6 py-4 text-[15px] font-medium text-sage-2">{pct(apr(p), 0, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {shown.map((p) => (
              <li key={p.pair}>
                <Link href={`/rwa-pools/${p.pair}`} className="panel block p-4">
                  <div className="flex items-center gap-3">
                    <TokenLogo src={p.logo} symbol={p.symbol} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">
                        {p.symbol}/{p.quote}
                      </span>
                      <span className="block truncate text-[12.5px] text-mute">
                        {p.dex} {p.version}
                        {p.fee !== null ? ` · ${p.fee / 10000}%` : ""}
                      </span>
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-[12.5px]">
                    <div>
                      <dt className="text-mute">Liquidity</dt>
                      <dd className="num mt-1 text-ink">{compact(p.liquidityUsd)}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">24h volume</dt>
                      <dd className="num mt-1 text-ink">{compact(p.volume24h)}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Fee APR</dt>
                      <dd className="num mt-1 text-sage-2">{pct(apr(p), 0, false)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[13.5px] text-mute">
            <div className="flex items-center gap-1">
              <span className="pr-2">Rows</span>
              {[25, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setSize(n);
                    setPage(0);
                  }}
                  className={`h-8 rounded-[6px] px-2.5 ${size === n ? "bg-white/[0.08] text-ink" : "hover:text-ink"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span>
                {current * size + 1}–{Math.min(filtered.length, (current + 1) * size)} of {filtered.length}
              </span>
              <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="btn btn-ghost !h-8 !px-3 disabled:opacity-40">
                Prev
              </button>
              <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="btn btn-ghost !h-8 !px-3 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
