import type { Metadata } from "next";
import Link from "next/link";
import { LaunchForm } from "@/components/launchpad/LaunchForm";
import { PreviewBadge } from "@/components/ui/SourceNote";

export const metadata: Metadata = { title: "Create a token" };

const STEPS = [
  { n: "01", t: "Make it yours", d: "Image, name, ticker, story" },
  { n: "02", t: "Set your launch", d: "Pair, fee, first buy" },
  { n: "03", t: "Review & create", d: "Every value checked, then signed" },
];

export default function LaunchPage() {
  return (
    <div className="wrap pb-24 pt-10 sm:pt-14">
      <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-2">
        Made for your next idea <PreviewBadge />
      </p>
      <h1 className="h-page mt-3 !text-[clamp(32px,4.4vw,44px)]">A small idea. A fair new market.</h1>
      <p className="mt-2 text-[17px] text-mute">Name it, pair it, and bring your community along.</p>
      <Link href="/launchpad/docs#create" className="mt-3 inline-block text-[14px] text-ink underline underline-offset-4">
        How it works
      </Link>
      <ol className="mt-8 grid grid-cols-1 gap-4 border-b border-line pb-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-2 text-[11.5px] text-ink-2">{s.n}</span>
            <span>
              <span className="block text-[14px] font-medium">{s.t}</span>
              <span className="block text-[12.5px] text-mute">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <LaunchForm />
      </div>
    </div>
  );
}
