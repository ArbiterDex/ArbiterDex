import type { Metadata } from "next";
import { ExploreBoard } from "@/components/launchpad/ExploreBoard";

export const metadata: Metadata = { title: "Explore launches" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  const active = sort === "cap" ? "cap" : sort === "sale" ? "sale" : "new";
  return <ExploreBoard title="Explore" active={active} />;
}
