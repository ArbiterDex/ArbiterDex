import { BRAND } from "@/config/brand";

/**
 * The owner's Arbiterdex mark (public/brand/mark.webp), drawn as a mask so it
 * takes the text colour it sits in: light on dark surfaces, ink on light ones.
 */
export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: "url(/brand/mark.webp)",
        maskImage: "url(/brand/mark.webp)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[19px] font-bold leading-none tracking-[-0.02em] ${className}`} aria-label={BRAND.name}>
      Arbiterdex
    </span>
  );
}

/** Mark + wordmark used in the navbar. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-ink">
      <Mark size={24} />
      <span className={compact ? "hidden sm:inline" : ""}>
        <Wordmark />
      </span>
    </span>
  );
}
