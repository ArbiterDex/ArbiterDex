import Link from "next/link";
import { BRAND } from "@/config/brand";
import { FOOTER_COLUMNS } from "@/config/nav";
import { CaBlock } from "@/components/CopyCa";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="wrap pb-10 pt-16 sm:pt-[88px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-7">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="text-[14px] font-medium text-ink">{col.title}</p>
              <ul className="mt-5 grid gap-[11px]">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[14px] text-mute transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[14px] font-medium text-ink">Connect</p>
            <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className="mt-4 inline-grid size-8 place-items-center text-mute transition-colors hover:text-ink">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
                <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.74H5.58L16.67 19.2Z" />
              </svg>
            </a>
          </div>
          <CaBlock />
        </div>

        <div aria-hidden="true" className="mt-16 select-none overflow-hidden">
          <svg viewBox="0 0 1300 150" className="block w-full" role="presentation">
            <text x="650" y="128" textAnchor="middle" textLength="1296" lengthAdjust="spacingAndGlyphs" className="font-wide" fontSize="150" fill="rgba(255,255,255,0.045)">
              ARBITERDEX
            </text>
          </svg>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {BRAND.name}</p>
          <p>Self-custody. Your keys, your verdict.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
