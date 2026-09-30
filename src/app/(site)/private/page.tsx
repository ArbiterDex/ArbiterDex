import type { Metadata } from "next";
import { SwapPage } from "@/components/swap/SwapPage";

export const metadata: Metadata = {
  title: "Private Swap",
  description: "Private settlement on Arbiter DEX: move an asset to a fresh address with no on-chain link. Opening soon.",
};

export default function PrivateSwap() {
  return <SwapPage tab="private" />;
}
