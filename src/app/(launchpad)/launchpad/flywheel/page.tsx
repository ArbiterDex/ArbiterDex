import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";

export const metadata: Metadata = { title: "Flywheel" };

const STATS = [
  { label: "Revenue", note: "Protocol share, in ETH" },
  { label: `${BRAND.symbol} bought`, note: "Spent in its pool" },
  { label: `${BRAND.symbol} burned`, note: "Sent to 0xdead" },
  { label: "Treasury", note: "Kept by the protocol" },
  { label: "Launches", note: `On ${CHAIN.name}` },
];

const COLS = ["#", "Token", "Chain", "Pair", "Creator's fees", "Revenue", `${BRAND.symbol} burned`];

export default function FlywheelPage() {
  return (
    <div className="wrap pb-24 pt-10 sm:pt-14">
      <h1 className="h-hero max-w-[560px] !text-[clamp(34px,4.4vw,52px)]">Every launch buys and burns {BRAND.symbol}.</h1>
      <p className="mt-5 max-w-[560px] text-[18px] leading-[1.6] text-mute">
        The protocol&apos;s share of every launch is set to buy {BRAND.symbol} in its pool on {CHAIN.name} and burn it. The rest goes to the treasury. Every number below is read on-chain once launches open.
      </p>

      <div className="panel mt-10 grid grid-cols-2 gap-6 p-6 sm:p-7 md:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="text-[13.5px] text-ink-2">{s.label}</p>
            <p className="num mt-3 text-[32px] font-medium leading-none">—</p>
            <p className="mt-2 text-[12.5px] text-mute">{s.note}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-[20px] font-medium">Launches</h2>
      <div className="panel mt-4 overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                {COLS.map((c, i) => (
                  <th key={c} className={`table-head px-4 py-3 ${i >= 5 ? "text-right" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="grid place-items-center px-6 py-16 text-center">
          <p className="text-[17px] font-medium">No launches yet</p>
          <p className="mt-2 max-w-[440px] text-[14px] leading-[1.6] text-mute">The table fills itself from the chain: each launch, its pair, where its creator sends fees, and how much {BRAND.symbol} its trading has burned.</p>
          <Link href="/launchpad/launch" className="btn btn-cream mt-6">
            Draft a token
          </Link>
        </div>
      </div>
    </div>
  );
}
