import Link from "next/link";
import { bps } from "@/lib/format";

/** How far a venue's price sits from the oracle, judged in absolute terms. */
export function spreadTone(value: number | null) {
  if (value === null || !Number.isFinite(value)) return { label: "No reference", cls: "text-mute" };
  const a = Math.abs(value);
  if (a <= 50) return { label: "Fair", cls: "text-up" };
  if (a <= 150) return { label: "Drifting", cls: "text-warn" };
  return { label: "Off oracle", cls: "text-down" };
}

export function SpreadCell({ value, stacked = true }: { value: number | null; stacked?: boolean }) {
  const tone = spreadTone(value);
  return (
    <span className={`num ${stacked ? "flex flex-col items-end" : "inline-flex items-center gap-2"}`}>
      <span className={tone.cls}>{bps(value)}</span>
      <span className="text-[12px] text-mute">{tone.label}</span>
    </span>
  );
}

export function Change({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-mute">—</span>;
  return <span className={`num ${value > 0 ? "text-up" : value < 0 ? "text-down" : "text-ink-2"}`}>{value > 0 ? "+" : ""}{value.toFixed(2)}%</span>;
}

/** Segmented filter made of links, as used above the tables. */
export function Segments({ items }: { items: { label: string; href: string; active: boolean; count?: number }[] }) {
  return (
    <div className="scroll-x flex gap-1">
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          scroll={false}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-[6px] px-3 text-[14px] transition-colors ${it.active ? "bg-white/[0.08] text-ink" : "text-ink-2 hover:text-ink"}`}
        >
          {it.label}
          {it.count !== undefined ? <span className="text-[12px] text-mute">{it.count}</span> : null}
        </Link>
      ))}
    </div>
  );
}

export function ExternalArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

/** Calm notice when a live source could not be reached. */
export function Unreachable({ children }: { children: React.ReactNode }) {
  return <div className="panel px-5 py-8 text-center text-[14px] text-mute">{children}</div>;
}
