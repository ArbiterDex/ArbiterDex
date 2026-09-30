import type { Metadata } from "next";
import { ExploreBoard } from "@/components/launchpad/ExploreBoard";

export const metadata: Metadata = { title: "Trending launches" };

export default function TrendingPage() {
  return <ExploreBoard title="Trending" active="trending" />;
}
