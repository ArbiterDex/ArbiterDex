import Link from "next/link";
import { BackIcon } from "@/components/icons";

export function BackLink() {
  return (
    <Link href="/lend" className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-line-2 px-2.5 text-[13px] text-ink-2 hover:text-ink">
      <BackIcon className="size-3.5" /> Lend and Borrow
    </Link>
  );
}

export function StatGrid({ stats }: { stats: { label: string; value: React.ReactNode; note?: string }[] }) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[14px] border border-line sm:grid-cols-2">
      {stats.map((s, i) => (
        <div key={s.label} className={`min-w-0 p-5 ${i > 0 ? "border-t border-line" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}>
          <p className="text-[13px] text-ink-2">{s.label}</p>
          <p className="num mt-2 truncate text-[32px] font-medium tracking-[-0.02em] sm:text-[38px]">{s.value}</p>
          {s.note ? <p className="mt-1 text-[12px] text-mute">{s.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-[22px] font-medium tracking-[-0.015em]">{title}</h2>
      <div className="mt-4 text-[16px] leading-[1.65] text-ink-2">{children}</div>
    </section>
  );
}
