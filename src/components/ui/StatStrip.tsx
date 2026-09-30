/** Row of big numbers in one bordered box, split by hairlines. Stacks on phones. */
export function StatStrip({ stats }: { stats: { label: string; value: React.ReactNode; note?: React.ReactNode }[] }) {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-[14px] border border-line sm:grid-cols-[var(--stat-cols)]"
      style={{ "--stat-cols": `repeat(${stats.length}, minmax(0, 1fr))` } as React.CSSProperties}
    >
      {stats.map((s, i) => (
        <div key={s.label} className={`min-w-0 px-6 py-6 ${i ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}>
          <p className="text-[14px] font-medium text-ink-2">{s.label}</p>
          <p className="num mt-3 truncate text-[32px] font-medium leading-none tracking-[-0.02em] sm:text-[38px]">{s.value}</p>
          {s.note ? <p className="mt-2 text-[12.5px] text-mute">{s.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
