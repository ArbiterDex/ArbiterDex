import type { GlyphName } from "@/config/baskets";

/* Line glyphs drawn for each basket theme. Stroke only, so they sit on any panel. */
const PATHS: Record<GlyphName, string> = {
  chip: "M8 8h8v8H8zM10.5 10.5h3v3h-3zM10 4v4M14 4v4M10 16v4M14 16v4M4 10h4M4 14h4M16 10h4M16 14h4",
  atom: "M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8M12 20c-2 0-3.5-3.6-3.5-8S10 4 12 4s3.5 3.6 3.5 8-1.5 8-3.5 8ZM4.6 8C6.8 4.2 11.8 3 15.6 5.2s5 7.2 2.8 11-7.2 5-11 2.8S2.4 11.8 4.6 8Z",
  server: "M5 5h14v5H5zM5 14h14v5H5zM8 7.5h.01M8 16.5h.01M11 7.5h5M11 16.5h5",
  layers: "m12 4 8 4-8 4-8-4 8-4ZM4 12l8 4 8-4M4 16l8 4 8-4",
  shield: "M12 3.5 5.5 6v5.2c0 4.1 2.8 7.6 6.5 9.3 3.7-1.7 6.5-5.2 6.5-9.3V6L12 3.5ZM9.5 11V9.8a2.5 2.5 0 0 1 5 0V11M9 11h6v4.5H9z",
  pick: "M5 19 14.5 9.5M9 5.5c4-1.8 8.2-1 10.5 1.5M12.5 6.5l5 5",
  tower: "M12 3v2M8.5 21 12 5l3.5 16M9.6 16h4.8M10.4 12h3.2M6 8h12M7 21h10",
  orbit: "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 15.5c1.4 2.4 7.2 1.1 12.9-2.9s8.4-8.5 6.9-10.6M3.5 15.5C2 13.4 4.7 9 10.4 5",
  coin: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9.5 8.5H13a2 2 0 0 1 0 4H9.5h4a2 2 0 0 1 0 4H9.5zM11 7v1.5M11 16.5V18",
  scale: "M12 4v16M8 20h8M5 7h14M7.5 7 5 13a2.5 2.5 0 0 0 5 0L7.5 7ZM16.5 7 14 13a2.5 2.5 0 0 0 5 0l-2.5-6Z",
  wave: "M3 9c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 17c3 0 3-2 6-2s3 2 6 2 3-2 6-2",
  grid: "M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z",
  bars: "M4 20h16M7 17v-6M12 17V6M17 17v-9",
  gold: "M4 18h7l-1.5-5h-4zM13 18h7l-1.5-5h-4zM8.5 12h7L14 7h-4z",
};

export function Glyph({ name, className = "size-6" }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Square tile with a glyph, the basket's "logo". */
export function GlyphTile({ name, size = 44 }: { name: GlyphName; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[10px] border border-line bg-[linear-gradient(135deg,rgba(96,145,126,0.35),rgba(11,23,18,0.9))] text-parchment" style={{ width: size, height: size }}>
      <Glyph name={name} className="size-[55%]" />
    </span>
  );
}

/** Large ringed disc used on strategy cards in place of a portrait. */
export function GlyphDisc({ name, size = 108 }: { name: GlyphName; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border border-line-2 bg-[radial-gradient(circle_at_35%_30%,rgba(96,145,126,0.28),rgba(0,15,6,0.7)_70%)] text-ink shadow-[0_0_0_8px_rgba(255,255,255,0.02)]"
      style={{ width: size, height: size }}
    >
      <Glyph name={name} className="size-[46%]" />
    </span>
  );
}
