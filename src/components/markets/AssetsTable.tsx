"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { SearchIcon } from "@/components/icons";
import { compact, price } from "@/lib/format";
import { Change, SpreadCell } from "@/components/markets/ui";

export type AssetRow = {
  symbol: string;
  name: string;
  logo: string;
  issuer: string;
  category: string;
  oracle: number | null;
  venuePrice: number | null;
  spreadBps: number | null;
  change24h: number | null;
  volume24h: number;
  liquidityUsd: number;
  venues: number;
  supplyUsd: number | null;
};

type SortKey = "liquidityUsd" | "volume24h" | "supplyUsd" | "spread";

export function AssetsTable({ rows, empty }: { rows: AssetRow[]; empty: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("liquidityUsd");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? rows.filter((r) => r.symbol.toLowerCase().includes(needle) || r.name.toLowerCase().includes(needle)) : rows;
    const val = (r: AssetRow) => (sort === "spread" ? -Math.abs(r.spreadBps ?? 1e9) : (r[sort] ?? -1));
    return [...list].sort((a, b) => val(b) - val(a));
  }, [rows, q, sort]);

  const head = (key: SortKey, label: string) => (
    <button type="button" onClick={() => setSort(key)} className={`table-head inline-flex items-center gap-1 hover:text-ink ${sort === key ? "!text-ink" : ""}`}>
      {label}
      {sort === key ? <span aria-hidden="true">↓</span> : null}
    </button>
  );

  return (
    <div>
      <label className="relative block w-full max-w-[520px]">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ticker or company" className="field !pl-11" aria-label="Search assets" />
      </label>

      {shown.length === 0 ? (
        <div className="mt-6 panel px-5 py-10 text-center text-[14px] text-mute">{rows.length === 0 ? empty : `Nothing matches “${q}”.`}</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-[14px] border border-line lg:block">
            <table className="w-full table-fixed text-[14px]">
              <colgroup>
                <col className="w-[27%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line text-right">
                  <th className="table-head px-6 py-4 text-left">Asset</th>
                  <th className="table-head px-3 py-4">Oracle</th>
                  <th className="table-head px-3 py-4">Deepest venue</th>
                  <th className="px-3 py-4">{head("spread", "Spread")}</th>
                  <th className="px-3 py-4">{head("volume24h", "24h volume")}</th>
                  <th className="px-3 py-4">{head("liquidityUsd", "Liquidity")}</th>
                  <th className="px-6 py-4">{head("supplyUsd", "On-chain value")}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.symbol} className="group border-b border-line text-right last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-left">
                      <Link href={`/assets/${r.symbol}`} className="flex min-w-0 items-center gap-3">
                        <TokenLogo src={r.logo} symbol={r.symbol} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-medium text-ink group-hover:text-parchment">{r.symbol}</span>
                          <span className="block truncate text-[12.5px] text-mute">
                            {r.name} · {r.issuer}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="num px-3 py-4 text-ink">{price(r.oracle)}</td>
                    <td className="px-3 py-4">
                      <span className="num block text-ink">{price(r.venuePrice)}</span>
                      <span className="block text-[12px]">
                        <Change value={r.change24h} />
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <SpreadCell value={r.spreadBps} />
                    </td>
                    <td className="num px-3 py-4 text-ink">{r.venues ? compact(r.volume24h) : "—"}</td>
                    <td className="px-3 py-4">
                      <span className="num block text-ink">{r.venues ? compact(r.liquidityUsd) : "—"}</span>
                      <span className="block text-[12px] text-mute">
                        {r.venues} venue{r.venues === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="num px-6 py-4 text-ink-2">{compact(r.supplyUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards below lg */}
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {shown.map((r) => (
              <li key={r.symbol}>
                <Link href={`/assets/${r.symbol}`} className="panel block p-4">
                  <div className="flex items-center gap-3">
                    <TokenLogo src={r.logo} symbol={r.symbol} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{r.symbol}</span>
                      <span className="block truncate text-[12.5px] text-mute">{r.name}</span>
                    </span>
                    <span className="text-right">
                      <span className="num block text-[15px]">{price(r.oracle ?? r.venuePrice)}</span>
                      <Change value={r.change24h} />
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-[12.5px]">
                    <div className="min-w-0">
                      <dt className="text-mute">Spread</dt>
                      <dd className="mt-1">
                        <SpreadCell value={r.spreadBps} stacked={false} />
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-mute">24h volume</dt>
                      <dd className="num mt-1 text-ink">{r.venues ? compact(r.volume24h) : "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-mute">Liquidity</dt>
                      <dd className="num mt-1 text-ink">{r.venues ? compact(r.liquidityUsd) : "—"}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
