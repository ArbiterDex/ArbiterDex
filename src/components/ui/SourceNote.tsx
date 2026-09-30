/** Says where the numbers on a page come from, and whether they are live. */
export function SourceNote({ live, children }: { live: boolean; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[12.5px] text-mute">
      <span className={`size-1.5 shrink-0 rounded-full ${live ? "animate-pulse-dot bg-up" : "bg-warn"}`} />
      <span>{children}</span>
    </p>
  );
}

/** Honest label for anything that is a preview of a product that is not open yet. */
export function PreviewBadge({ children = "Preview" }: { children?: React.ReactNode }) {
  return <span className="tag-soon">{children}</span>;
}
