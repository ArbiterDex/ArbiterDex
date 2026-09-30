/* Fee-flow diagram: sources on the left converge on one node, which splits
   into outcomes on the right. Rows have a fixed height so the connector
   curves can be drawn without measuring. Phones get a stacked version. */

export type FlowSource = { title: string; sub?: string; soon?: boolean; logo?: string };
export type FlowNode = { title: string; sub: string };

const ROW = 46;
const GAP = 10;
const OUT = 66;
const OUT_GAP = 16;

function Connectors({ n, side }: { n: number; side: "in" | "out" }) {
  const H = n * ROW + (n - 1) * GAP;
  const W = 100;
  const mid = H / 2;
  const ys = Array.from({ length: n }, (_, i) => i * (ROW + GAP) + ROW / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      {ys.map((y, i) => {
        const d = side === "in" ? `M0 ${y} C ${W * 0.55} ${y}, ${W * 0.45} ${mid}, ${W} ${mid}` : `M0 ${mid} C ${W * 0.55} ${mid}, ${W * 0.45} ${y}, ${W} ${y}`;
        return <path key={i} d={d} fill="none" stroke="rgba(127,176,156,0.55)" strokeWidth="1.2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

export function FeeFlow({ label, sources, center, outcomes }: { label: string; sources: FlowSource[]; center: FlowNode; outcomes: FlowNode[] }) {
  const leftH = sources.length * ROW + (sources.length - 1) * GAP;
  const rightH = outcomes.length * OUT + (outcomes.length - 1) * OUT_GAP;
  const H = Math.max(leftH, rightH);
  return (
    <div>
      <p className="text-[14px] font-medium text-ink-2">{label}</p>
      {/* Desktop diagram */}
      <div className="mt-4 hidden items-center lg:grid lg:grid-cols-[240px_minmax(40px,1fr)_220px_minmax(40px,1fr)_220px]" style={{ height: H }}>
        <div className="grid content-center gap-[10px]" style={{ height: H }}>
          {sources.map((s) => (
            <div key={s.title} className="row-tile flex h-[46px] items-center justify-center gap-2 px-3 text-center">
              {s.logo ? <img src={s.logo} alt="" className="size-5 shrink-0 rounded-full bg-white" /> : null}
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{s.title}</span>
                {s.sub ? <span className="block truncate text-[11px] text-mute">{s.sub}</span> : null}
              </span>
              {s.soon ? <span className="tag-soon !h-[18px] !text-[10.5px]">Soon</span> : null}
            </div>
          ))}
        </div>
        <div style={{ height: leftH }}>
          <Connectors n={sources.length} side="in" />
        </div>
        <div className="rounded-[10px] border border-sage/50 bg-sage-tint px-4 py-3 text-center">
          <p className="text-[13.5px] font-medium">{center.title}</p>
          <p className="mt-1 text-[11.5px] leading-[1.45] text-ink-2">{center.sub}</p>
        </div>
        <div style={{ height: rightH }}>
          <Connectors n={outcomes.length} side="out" />
        </div>
        <div className="grid content-center gap-[16px]" style={{ height: H }}>
          {outcomes.map((o) => (
            <div key={o.title} className="row-tile flex h-[66px] flex-col items-center justify-center px-3 text-center">
              <p className="text-[13.5px] font-medium">{o.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-[1.4] text-mute">{o.sub}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Phone version */}
      <div className="mt-4 grid grid-cols-1 gap-2 lg:hidden">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {sources.map((s) => (
            <div key={s.title} className="row-tile flex items-center gap-2 px-3 py-2">
              {s.logo ? <img src={s.logo} alt="" className="size-5 shrink-0 rounded-full bg-white" /> : null}
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{s.title}</span>
              {s.soon ? <span className="tag-soon !h-[18px] !text-[10.5px]">Soon</span> : null}
            </div>
          ))}
        </div>
        <p className="text-center text-[16px] text-sage-2" aria-hidden="true">↓</p>
        <div className="rounded-[10px] border border-sage/50 bg-sage-tint px-4 py-3 text-center">
          <p className="text-[13.5px] font-medium">{center.title}</p>
          <p className="mt-1 text-[11.5px] text-ink-2">{center.sub}</p>
        </div>
        <p className="text-center text-[16px] text-sage-2" aria-hidden="true">↓</p>
        <div className="grid grid-cols-2 gap-1.5">
          {outcomes.map((o) => (
            <div key={o.title} className="row-tile px-3 py-2.5 text-center">
              <p className="text-[13px] font-medium">{o.title}</p>
              <p className="mt-0.5 text-[11px] text-mute">{o.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
