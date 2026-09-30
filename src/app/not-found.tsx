import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="wrap grid min-h-[60vh] place-items-center py-24 text-center">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="h-page mt-4">No ruling on this page.</h1>
          <p className="mt-4 text-[17px] text-mute">The address you followed does not exist, or it moved.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="btn btn-cream">
              Back home
            </Link>
            <Link href="/swap" className="btn btn-ghost">
              Open swap
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
