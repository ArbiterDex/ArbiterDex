import Link from "next/link";
import { LaunchpadMark } from "@/components/launchpad/LaunchpadMark";
import { LP_FOOTER } from "@/components/launchpad/nav";

export function LaunchpadFooter() {
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-6 py-9 md:flex-row md:items-center md:justify-between">
        <div>
          <LaunchpadMark />
          <p className="mt-2 text-[12.5px] text-mute">The fair-launch pad for tokenized-asset markets on Robinhood Chain.</p>
        </div>
        <nav aria-label="Launchpad footer" className="flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-ink-2">
          {LP_FOOTER.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
