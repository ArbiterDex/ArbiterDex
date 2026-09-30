import type { Metadata } from "next";
import { Holdings } from "@/components/markets/Holdings";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Every tokenized asset your wallet holds on Robinhood Chain, valued at its oracle price.",
};

export default function PortfolioPage() {
  return (
    <div className="wrap pb-24">
      <Holdings />
    </div>
  );
}
