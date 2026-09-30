import { BRAND } from "@/config/brand";

/**
 * The Arbiter DEX mark: an "A" whose crossbar runs past both legs like the
 * beam of a balance, with the two pans hanging from its ends.
 */
export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.2 3.5h5.6L29 28.5h-5.1L16 8.4 8.1 28.5H3L13.2 3.5Z" />
      <rect x="1" y="16.6" width="30" height="2.6" rx="1.3" />
      <path d="M1.4 20.6h5.2l-2.6 4.6-2.6-4.6ZM25.4 20.6h5.2L28 25.2l-2.6-4.6Z" opacity="0.72" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-wide text-[17px] leading-none tracking-[0.02em] ${className}`} aria-label={BRAND.name}>
      ARBITERDEX
    </span>
  );
}

/** Mark + wordmark + the small "Beta" flag used in the navbar. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-ink">
      <Mark size={24} />
      <span className={compact ? "hidden sm:inline" : ""}>
        <Wordmark />
      </span>
      <span className="-translate-y-2 rounded-[3px] bg-parchment px-1 py-px text-[9.5px] font-semibold leading-[12px] text-onparch">Beta</span>
    </span>
  );
}
