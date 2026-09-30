import type { Metadata } from "next";
import { CHAIN, BRAND } from "@/config/brand";
import { compact, count } from "@/lib/format";
import { readSettlements } from "@/components/markets/server";
import { SettlementsTable } from "@/components/markets/SettlementsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settlement Explorer",
  description: "Recent on-chain swaps in the Robinhood Chain pools Arbiter DEX compares.",
};

function Tile({ label, value, note, wide = false }: { label: string; value: React.ReactNode; note: string; wide?: boolean }) {
  return (
    <div className={`panel min-w-0 p-6 ${wide ? "sm:col-span-2 lg:col-span-1" : ""}`}>
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className={`num mt-3 truncate font-medium leading-none tracking-[-0.02em] ${wide ? "text-[40px] sm:text-[52px]" : "text-[30px]"}`}>{value}</p>
      <p className="mt-3 text-[13.5px] text-mute">{note}</p>
    </div>
  );
}

export default async function ExplorerPage() {
  const data = await readSettlements(60);
  const rows = data?.rows ?? [];
  const value = rows.reduce((s, r) => s + (r.valueUsd ?? 0), 0);
  const buys = rows.filter((r) => r.side === "Buy").length;
  const now = new Date();

  return (
    <div className="wrap pb-24">
      <div className="pt-12 sm:pt-[70px]">
        <p className="flex items-center gap-2 text-[13px] text-ink-2">
          <span className={`size-1.5 rounded-full ${data ? "animate-pulse-dot bg-up" : "bg-warn"}`} />
          {data ? `Read at ${now.toISOString().slice(11, 19)} UTC` : "Chain unreachable"}
        </p>
        <h1 className="h-page mt-4">Settlement Explorer</h1>
        <p className="mt-4 max-w-[760px] text-[17px] leading-[1.6] text-mute sm:text-[18px]">
          Every swap as it settles in the {CHAIN.name} pools {BRAND.name} weighs. These are the venues&apos; own on-chain trades, whoever sent them, each linked to its transaction. They are the evidence the arbiter rules on, not orders placed through this site.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <Tile wide label="Value settled" value={data ? compact(value) : "—"} note={`USD value of the ${rows.length} latest swaps shown below`} />
        <Tile label="Swaps" value={data ? count(rows.length) : "—"} note="most recent first" />
        <Tile label="Buys" value={data ? count(buys) : "—"} note="stock bought from a pool" />
        <Tile label="Pools watched" value={data ? count(data.pools) : "—"} note="busiest v3 stock pools" />
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-line">
        <div className="flex flex-col gap-2 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-[18px] font-medium">Transactions</h2>
          {data ? (
            <p className="text-[12.5px] text-mute">
              Blocks {count(data.fromBlock)} to {count(data.toBlock)}
            </p>
          ) : null}
        </div>
        {!data ? (
          <p className="px-5 py-12 text-center text-[14px] text-mute">The chain could not be reached just now. Settlements appear here again on the next refresh.</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-mute">No swap settled in these pools over the last few thousand blocks.</p>
        ) : (
          <SettlementsTable rows={rows} now={now.getTime()} />
        )}
      </div>
      <p className="mt-3 text-[12.5px] text-mute">Swap events are read from each pool on {CHAIN.name}. Values use USDG at $1 and ETH at its Chainlink price.</p>
    </div>
  );
}
