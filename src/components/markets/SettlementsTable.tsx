import Link from "next/link";
import { explorerTx, shortAddress } from "@/config/brand";
import { ago, compact, price, tokenAmount } from "@/lib/format";
import { TokenLogo } from "@/components/ui/TokenLogo";
import type { Settlement } from "@/components/markets/server";
import { ExternalArrow } from "@/components/markets/ui";

/** Recent on-chain swaps. Times are relative to `now`, passed in by the page. */
export function SettlementsTable({ rows, now, showPair = true }: { rows: Settlement[]; now: number; showPair?: boolean }) {
  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full table-fixed text-[14px]">
          <colgroup>
            <col className="w-[14%]" />
            <col className={showPair ? "w-[24%]" : "w-[14%]"} />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line text-right">
              <th className="table-head px-6 py-4 text-left">Time</th>
              <th className="table-head px-3 py-4 text-left">{showPair ? "Pair" : "Side"}</th>
              <th className="table-head px-3 py-4">Size</th>
              <th className="table-head px-3 py-4">Price</th>
              <th className="table-head px-3 py-4">Value</th>
              <th className="table-head px-6 py-4">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tx + r.pool + r.size} className="border-b border-line text-right last:border-0">
                <td className="px-6 py-4 text-left text-[13px] text-ink-2">{r.time ? ago(r.time, now) : `block ${r.block}`}</td>
                <td className="px-3 py-4 text-left">
                  {showPair ? (
                    <Link href={`/rwa-pools/${r.pool}`} className="flex min-w-0 items-center gap-3">
                      <TokenLogo src={r.logo} symbol={r.symbol} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate">
                          <span className={r.side === "Buy" ? "text-up" : "text-down"}>{r.side}</span> {r.symbol}/{r.quote}
                        </span>
                        <span className="block truncate text-[12px] text-mute">{r.dex}</span>
                      </span>
                    </Link>
                  ) : (
                    <span className={r.side === "Buy" ? "text-up" : "text-down"}>
                      {r.side} {r.symbol}
                    </span>
                  )}
                </td>
                <td className="num px-3 py-4">
                  {tokenAmount(r.size)} <span className="text-mute">{r.symbol}</span>
                </td>
                <td className="num px-3 py-4 text-ink-2">{r.valueUsd !== null ? price(r.price) : `${tokenAmount(r.price)} ${r.quote}`}</td>
                <td className="num px-3 py-4 font-medium">{r.valueUsd !== null ? compact(r.valueUsd) : "—"}</td>
                <td className="px-6 py-4">
                  <a href={explorerTx(r.tx)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12.5px] text-ink-2 hover:text-ink">
                    {shortAddress(r.tx, 6, 4)} <ExternalArrow />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid grid-cols-1 divide-y divide-line lg:hidden">
        {rows.map((r) => (
          <li key={r.tx + r.pool + r.size} className="flex items-center gap-3 px-4 py-3.5">
            <TokenLogo src={r.logo} symbol={r.symbol} size={30} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px]">
                <span className={r.side === "Buy" ? "text-up" : "text-down"}>{r.side}</span> {tokenAmount(r.size)} {r.symbol}
              </p>
              <p className="truncate text-[12px] text-mute">
                {r.time ? ago(r.time, now) : `block ${r.block}`} · {r.symbol}/{r.quote} · {r.dex}
              </p>
            </div>
            <a href={explorerTx(r.tx)} target="_blank" rel="noreferrer" className="shrink-0 text-right">
              <span className="num block text-[14px] font-medium">{r.valueUsd !== null ? compact(r.valueUsd) : "—"}</span>
              <span className="inline-flex items-center gap-1 text-[12px] text-mute">
                Tx <ExternalArrow />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
