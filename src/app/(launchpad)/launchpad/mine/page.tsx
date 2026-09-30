import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { MyTokens } from "@/components/launchpad/MyTokens";

export const metadata: Metadata = { title: "My tokens" };

export default function MinePage() {
  return (
    <div className="wrap min-h-[62vh] pb-24 pt-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[38px] font-medium tracking-[-0.02em] sm:text-[42px]">My tokens</h1>
        <Link href="/launchpad/launch" className="btn btn-cream !h-10">
          <PlusIcon className="size-3.5" /> Create
        </Link>
      </div>
      <MyTokens />
    </div>
  );
}
