import type { Metadata } from "next";
import { BRAND, CHAIN } from "@/config/brand";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="30 September 2026"
      intro={`These terms cover your use of the ${BRAND.name} website and interface at ${BRAND.domain}. By using them you accept these terms. If you do not accept them, do not use the site.`}
      sections={[
        {
          heading: "What the interface does",
          list: [
            `${BRAND.name} is software that reads public prices, compares them with independent oracles and prepares transactions for your own wallet to sign on ${CHAIN.name}.`,
            "It never takes custody of your assets, and it cannot move them without your signature.",
            "Transactions on a blockchain are final. A signed trade cannot be reversed by anyone.",
          ],
        },
        { heading: "Eligibility", list: ["You must be at least 18 years old.", "You must not be subject to sanctions or located in a sanctioned territory.", "You are responsible for complying with the laws that apply to you."] },
        {
          heading: "No advice",
          body: "Rulings, prices and every other figure on the site are information, not financial, investment, tax or legal advice. A \"Fair\" ruling describes one quote against one oracle at one moment and is not a recommendation to trade.",
        },
        {
          heading: "Risks you accept",
          list: [
            "Tokenized assets can lose value, be paused, restricted or burned by their issuer, and may trade away from the underlying asset.",
            "Pools can be thin, oracles can be stale outside market hours, and prices can move between quote and settlement.",
            "Smart contracts, networks, wallets and third-party services can fail.",
          ],
        },
        {
          heading: "Preview features",
          body: "Pages marked Preview, Soon or Opens at launch describe planned products. Their parameters are proposals and may change or never ship.",
        },
        { heading: "Prohibited use", body: "Do not use the site for unlawful activity, market manipulation, sanctions evasion, or to interfere with the site or the networks it reads." },
        {
          heading: "Limitation of liability",
          body: `To the extent the law allows, ${BRAND.name} and its contributors are not liable for losses from market movements, failed or reverted transactions, third-party protocols, issuer actions, outages or user error.`,
        },
        { heading: "Changes", body: "These terms may be updated. The date above shows the latest version; continued use means you accept it." },
        { heading: "Contact", body: `Questions can be sent on X to ${BRAND.xHandle}.` },
      ]}
    />
  );
}
