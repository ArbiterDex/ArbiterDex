import type { Metadata } from "next";
import { SwapPage } from "@/components/swap/SwapPage";

export const metadata: Metadata = {
  title: "Swap",
  description: "Swap verified tokenized stocks, funds, ETH and USDG on Robinhood Chain. Every route is quoted on-chain and judged against Chainlink before you sign.",
};

export default async function Swap({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  return <SwapPage tab="swap" from={from} to={to} />;
}
