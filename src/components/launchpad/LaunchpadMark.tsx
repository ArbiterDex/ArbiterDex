import { Mark, Wordmark } from "@/components/Logo";

/** Wordmark with "LAUNCHPAD" set underneath, as used in the launchpad chrome. */
export function LaunchpadMark({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-ink">
      {/* Phones get the mark alone so the wallet chip keeps its room. */}
      <span className={small ? "sm:hidden" : "hidden"}>
        <Mark size={24} />
      </span>
      <span className={`flex-col ${small ? "hidden sm:flex" : "flex"}`}>
        <Wordmark className={small ? "!text-[15px]" : "!text-[18px]"} />
        <span className="mt-1 text-[11px] font-medium leading-none tracking-[0.14em] text-ink-2">LAUNCHPAD</span>
      </span>
      <span className={`text-[10.5px] font-medium tracking-[0.14em] text-ink-2 ${small ? "hidden min-[420px]:inline sm:hidden" : "hidden"}`}>LAUNCHPAD</span>
    </span>
  );
}
