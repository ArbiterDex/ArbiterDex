import type { NavIcon as Name } from "@/config/nav";

const PATHS: Record<Name, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  bars: "M4 20h16M7 16V9M12 16V5M17 16v-4",
  pie: "M12 3v9h9A9 9 0 1 1 12 3ZM15 3.5A9 9 0 0 1 20.5 9H15z",
  gem: "M6 4h12l3 5-9 11L3 9l3-5ZM3 9h18M9.5 4 12 9l2.5-5M12 9v11",
  doc: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  bank: "M3 9 12 4l9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18",
  building: "M5 21V4h10v17M15 9h4v12M8 8h3M8 12h3M8 16h3M3 21h18",
  robot: "M7 8h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM12 4v4M9.5 13h.01M14.5 13h.01M10 16h4",
  stack: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  briefcase: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
  vault: "M4 4h16v16H4zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 9V7M12 17v-2M4 20v1M20 20v1",
  rocket: "M5 15c-1 1-1.5 4-1.5 4.5.5 0 3.5-.5 4.5-1.5M12 15l-3-3a13 13 0 0 1 10-9c0 4-2 8-7 12ZM9 12H5l2-4h4M12 15v4l4-2v-4",
  pool: "M3 16c2 0 2-1.5 4.5-1.5S10 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20M8 12V5a2 2 0 0 1 4 0M12 12V5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  percent: "M19 5 5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  lend: "M4 10 12 5l8 5M6 10v7M18 10v7M10 10v7M14 10v7M4 20h16",
  multiply: "M6 6l12 12M18 6 6 18",
  swap: "M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4",
  eye: "M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 20 20 4",
  search: "M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM20 20l-4.2-4.2",
  bolt: "M13 3 5 13h6l-1 8 8-10h-6l1-8Z",
  cycle: "M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  book: "M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z",
  shield: "M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z",
  fee: "M12 3v18M16.5 7.5C16 6 14.5 5 12 5c-2.8 0-4.5 1.4-4.5 3.4 0 4.6 9 2.6 9 7.2 0 2-1.8 3.4-4.5 3.4-2.6 0-4.1-1.1-4.6-2.7",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.3-2.4 3.8M12 17h.01",
};

export function NavIcon({ name, className = "size-4" }: { name: Name; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
